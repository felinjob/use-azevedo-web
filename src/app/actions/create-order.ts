'use server'

import { PaymentMethod, ShippingType } from '@prisma/client'
import prisma from '@/lib/prisma'
import { CheckoutFormData } from '@/lib/validations/checkout'
import { CartItem } from '@/lib/store/cart'
import { validateCoupon } from '@/app/actions/validate-coupon'
import crypto from 'crypto'
import { getBaseUrl } from '@/lib/utils'
import { sanitizeDigits, formatPhoneInternational } from '@/lib/formatters'
import { calculateShippingOptions } from '@/lib/shipping'

interface CreateOrderInput {
  formData: CheckoutFormData
  cartItems: CartItem[]
  couponCode?: string
}

function generateOrderNumber() {
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `UA-${randomStr}`
}

/**
 * Cria o pedido de forma segura e resiliente:
 *
 * Blindagens de Segurança e Concorrência:
 * 1. Não confia nos preços do frontend (busca preços oficiais direto no banco via variantId).
 * 2. Valida disponibilidade ativa e estoque físico em tempo real.
 * 3. Recalcula frete no servidor via `calculateShippingOptions` (impede manipulação de frete grátis/SEDEX zero).
 * 4. Valida atomicamente limites de cupom dentro da transação.
 * 5. Não faz chamada externa HTTP dentro da transação do banco (evita segurar conexões no pooler Supabase).
 *
 * @param input.formData - Dados validados do formulário de checkout.
 * @param input.cartItems - Itens do carrinho (usados apenas para obter variantId e quantity).
 * @param input.couponCode - Código do cupom opcional.
 * @returns Objeto com `success`, `orderNumber` e `redirectUrl`.
 */
export async function createOrder({ formData, cartItems, couponCode }: CreateOrderInput) {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Sua sacola está vazia.' }
    }

    // 1. Buscar todas as variantes do banco para validar preço, dados e estoque
    const variantIds = cartItems.map(item => item.variantId)
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    })

    const variantMap = new Map(dbVariants.map(v => [v.id, v]))

    const validatedItems: Array<{
      productId: string
      variantId: string
      productName: string
      variantSize: string
      variantColor: string
      unitPrice: number
      quantity: number
      totalPrice: number
      productionTimeDays: number
      isMadeToOrder: boolean
    }> = []

    for (const item of cartItems) {
      const dbVariant = variantMap.get(item.variantId)
      if (!dbVariant) {
        return { success: false, error: `Peça não encontrada no catálogo ou variante descontinuada.` }
      }

      if (!dbVariant.product.active) {
        return { success: false, error: `A peça "${dbVariant.product.name}" não está mais disponível para venda.` }
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))

      if (dbVariant.product.availability === 'READY_TO_SHIP' && dbVariant.stockQuantity < quantity) {
        return {
          success: false,
          error: `A peça "${dbVariant.product.name}" (Tam ${dbVariant.size}) possui apenas ${dbVariant.stockQuantity} unidade(s) disponível(is) em estoque.`
        }
      }

      const realUnitPrice = Number(dbVariant.product.price)
      validatedItems.push({
        productId: dbVariant.productId,
        variantId: dbVariant.id,
        productName: dbVariant.product.name,
        variantSize: dbVariant.size,
        variantColor: dbVariant.color,
        unitPrice: realUnitPrice,
        quantity,
        totalPrice: realUnitPrice * quantity,
        productionTimeDays: dbVariant.product.productionTimeDays || 0,
        isMadeToOrder: dbVariant.product.availability === 'MADE_TO_ORDER'
      })
    }

    // 2. Calcular subtotal com base estrita no banco de dados
    const subtotal = validatedItems.reduce((acc, item) => acc + item.totalPrice, 0)

    // 3. Recalcular opções de frete no servidor de acordo com as regras de negócio
    const cleanZip = sanitizeDigits(formData.address.zipCode)
    const hasMadeToOrder = validatedItems.some(item => item.isMadeToOrder)
    const maxProductionDays = validatedItems.reduce((max, item) => Math.max(max, item.productionTimeDays), 0)

    const serverShippingOptions = calculateShippingOptions(
      cleanZip,
      formData.address.state,
      hasMadeToOrder,
      maxProductionDays,
      subtotal,
      'PIX'
    )

    const selectedShippingOption = serverShippingOptions.find(opt => opt.id === formData.shipping.method)
    if (!selectedShippingOption) {
      return { success: false, error: 'A modalidade de entrega selecionada não é válida para este CEP.' }
    }

    const shippingCost = selectedShippingOption.price
    const estimatedDays = selectedShippingOption.estimatedDays

    // 4. Validação de Cupom de Desconto pelo Subtotal Oficial do Servidor
    let discount = 0
    let validatedCoupon: { id: string; code: string; amount: number } | null = null

    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, subtotal)
      if (couponRes.valid) {
        discount = couponRes.discountAmount!
        validatedCoupon = { id: couponRes.id!, code: couponRes.code!, amount: couponRes.discountAmount! }
      } else {
        return { success: false, error: couponRes.error }
      }
    }

    const total = Math.max(0, subtotal + shippingCost - discount)

    // 5. Mapear modalidade de frete para Enum do Prisma
    let shippingType: ShippingType = 'CORREIOS'
    if (formData.shipping.method === 'MOTOBOY_RJ') shippingType = 'MOTOBOY_RJ'
    if (formData.shipping.method === 'PICKUP') shippingType = 'PICKUP'

    const cleanCpf = sanitizeDigits(formData.customer.cpf)
    const cleanPhone = sanitizeDigits(formData.customer.phone)
    const orderNumber = generateOrderNumber()

    // 6. Transação Atômica Rápida no PostgreSQL (APENAS OPERAÇÕES DE BANCO, ZERO FETCH EXTERNO)
    const { order } = await prisma.$transaction(async (tx) => {
      // 6.1 Buscar ou criar cliente
      let cust = await tx.customer.findUnique({
        where: { cpf: cleanCpf }
      })

      if (!cust) {
        cust = await tx.customer.findUnique({
          where: { email: formData.customer.email.toLowerCase().trim() }
        })

        if (cust) {
          cust = await tx.customer.update({
            where: { email: cust.email },
            data: { cpf: cleanCpf, name: formData.customer.name.trim(), phone: cleanPhone }
          })
        } else {
          cust = await tx.customer.create({
            data: {
              cpf: cleanCpf,
              name: formData.customer.name.trim(),
              email: formData.customer.email.toLowerCase().trim(),
              phone: cleanPhone
            }
          })
        }
      } else {
        cust = await tx.customer.update({
          where: { cpf: cleanCpf },
          data: { name: formData.customer.name.trim(), email: formData.customer.email.toLowerCase().trim(), phone: cleanPhone }
        })
      }

      // 6.2 Criar Endereço
      const address = await tx.address.create({
        data: {
          customerId: cust.id,
          recipientName: formData.customer.name.trim(),
          street: formData.address.street.trim(),
          number: formData.address.number.trim(),
          complement: formData.address.complement?.trim() || null,
          neighborhood: formData.address.neighborhood.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim().toUpperCase(),
          zipCode: cleanZip,
          isDefault: true
        }
      })

      // 6.3 Validar e Incrementar Cupom se houver
      if (validatedCoupon?.id) {
        const freshCoupon = await tx.coupon.findUnique({
          where: { id: validatedCoupon.id }
        })
        if (!freshCoupon || !freshCoupon.isActive || (freshCoupon.maxUses && freshCoupon.usageCount >= freshCoupon.maxUses)) {
          throw new Error('O cupom atingiu o limite de usos ou foi desativado.')
        }
        await tx.coupon.update({
          where: { id: validatedCoupon.id },
          data: { usageCount: { increment: 1 } }
        })
      }

      // 6.4 Criar Pedido
      const estimatedDeliveryDate = new Date()
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays)

      const ord = await tx.order.create({
        data: {
          orderNumber,
          customerId: cust.id,
          shippingAddressId: address.id,
          subtotal,
          shippingCost,
          discount,
          total,
          couponId: validatedCoupon?.id || null,
          shippingType,
          motoboyNotes: formData.shipping.motoboyNotes?.trim() || null,
          estimatedDeliveryDate,
        }
      })

      // 6.5 Criar Itens do Pedido com preços oficiais do banco
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: ord.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantSize: item.variantSize,
            variantColor: item.variantColor,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }
        })
      }

      return { order: ord, customer: cust }
    })

    // 7. Chamada Externa à InfinitePay FORA da Transação do Banco (Não prende conexão do pooler)
    const ipItems = validatedItems.map(item => ({
      description: `${item.productName} - Tam ${item.variantSize}`,
      price: Math.round(Number(item.unitPrice) * 100),
      quantity: item.quantity
    }))

    if (shippingCost > 0) {
      ipItems.push({
        description: `Frete (${shippingType || 'Entrega'})`,
        price: Math.round(Number(shippingCost) * 100),
        quantity: 1
      })
    }

    if (discount > 0) {
      ipItems.push({
        description: `Desconto (Cupom: ${validatedCoupon?.code || 'OFF'})`,
        price: -Math.round(Number(discount) * 100),
        quantity: 1
      })
    }

    const formattedPhone = formatPhoneInternational(cleanPhone)
    const baseUrl = getBaseUrl()
    const handle = process.env.INFINITEPAY_HANDLE || 'useazevedo'
    const apiUrl = process.env.INFINITEPAY_API_URL || 'https://api.checkout.infinitepay.io'

    const payload = {
      handle,
      order_nsu: orderNumber,
      redirect_url: `${baseUrl}/pedido/${orderNumber}`,
      webhook_url: `${baseUrl}/api/webhooks/infinitepay`,
      items: ipItems,
      customer: {
        name: formData.customer.name.trim(),
        email: formData.customer.email.toLowerCase().trim(),
        phone_number: formattedPhone
      }
    }

    let paymentUrl = ''

    try {
      const ipResponse = await fetch(`${apiUrl}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!ipResponse.ok) {
        const errorText = await ipResponse.text().catch(() => 'Unknown Error')
        console.error('[INFINITEPAY CHECKOUT FAILED]:', ipResponse.status, errorText)
        throw new Error(`Falha no gateway InfinitePay (${ipResponse.status})`)
      }

      const data = await ipResponse.json()
      if (!data.url) {
        console.error('[INFINITEPAY ERROR]: Nenhum URL retornado', data)
        throw new Error('Resposta inválida da InfinitePay.')
      }

      paymentUrl = data.url
    } catch (gatewayError: unknown) {
      console.error('[GATEWAY LINK ERROR]:', gatewayError)
      // Se a InfinitePay falhou, marcamos o pedido como CANCELADO e estornamos uso do cupom
      if (validatedCoupon?.id) {
        await prisma.coupon.update({
          where: { id: validatedCoupon.id },
          data: { usageCount: { decrement: 1 } }
        }).catch(() => {})
      }
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELED' }
      }).catch(() => {})

      return {
        success: false,
        error: 'Não foi possível gerar o link seguro de pagamento da InfinitePay. Tente novamente em instantes.'
      }
    }

    // 8. Persistir Registro de Pagamento com a URL Oficial Retornada
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        method: PaymentMethod.PIX,
        status: 'PENDING',
        paymentUrl
      },
      update: {
        paymentUrl
      }
    })

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      redirectUrl: paymentUrl
    }

  } catch (error: unknown) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao processar o seu pedido. Tente novamente.'
    }
  }
}
