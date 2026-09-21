'use server'

import { PrismaClient, PaymentMethod, ShippingType } from '@prisma/client'
import { CheckoutFormData } from '@/lib/validations/checkout'
import { CartItem } from '@/lib/store/cart'
import { validateCoupon } from '@/app/actions/validate-coupon'
import crypto from 'crypto'

const prisma = new PrismaClient()

interface CreateOrderInput {
  formData: CheckoutFormData
  cartItems: CartItem[]
  couponCode?: string
}

function generateOrderNumber() {
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `UA-${randomStr}`
}

export async function createOrder({ formData, cartItems, couponCode }: CreateOrderInput) {
  try {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    
    // Server-side coupon validation
    let discount = 0
    let validatedCoupon: { id: string, code: string, amount: number } | null = null
    
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, subtotal)
      if (couponRes.valid) {
        discount = couponRes.discountAmount!
        validatedCoupon = { id: couponRes.id!, code: couponRes.code!, amount: couponRes.discountAmount! }
      } else {
        return { success: false, error: couponRes.error }
      }
    }

    const shippingCost = formData.shipping.price
    const total = Math.max(0, subtotal + shippingCost - discount)
    
    // Map shipping method to enum
    let shippingType: ShippingType = 'CORREIOS'
    if (formData.shipping.method === 'MOTOBOY_RJ') shippingType = 'MOTOBOY_RJ'
    if (formData.shipping.method === 'PICKUP') shippingType = 'PICKUP'
    
    // Clean CPF for DB storage
    const cleanCpf = formData.customer.cpf.replace(/\D/g, '')

    const orderNumber = generateOrderNumber()

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create Customer
      let customer = await tx.customer.findUnique({
        where: { cpf: cleanCpf }
      })

      const cleanPhone = formData.customer.phone.replace(/\D/g, '')

      if (!customer) {
        // Fallback check by email
        customer = await tx.customer.findUnique({
          where: { email: formData.customer.email }
        })
        
        if (customer) {
          // Update missing CPF if found by email
          customer = await tx.customer.update({
            where: { email: customer.email },
            data: { cpf: cleanCpf, name: formData.customer.name, phone: cleanPhone }
          })
        } else {
          // Create new customer
          customer = await tx.customer.create({
            data: {
              cpf: cleanCpf,
              name: formData.customer.name,
              email: formData.customer.email,
              phone: cleanPhone
            }
          })
        }
      } else {
        // Update details if found by CPF
        customer = await tx.customer.update({
          where: { cpf: cleanCpf },
          data: { name: formData.customer.name, email: formData.customer.email, phone: cleanPhone }
        })
      }

      // 2. Create Address
      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          recipientName: formData.customer.name,
          street: formData.address.street,
          number: formData.address.number,
          complement: formData.address.complement || null,
          neighborhood: formData.address.neighborhood,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode.replace(/\D/g, ''),
          isDefault: true
        }
      })

      // 3. Create Order
      const estimatedDeliveryDate = new Date()
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + formData.shipping.estimatedDays)

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          shippingAddressId: address.id,
          subtotal,
          shippingCost,
          discount,
          total,
          couponId: validatedCoupon?.id,
          shippingType,
          motoboyNotes: formData.shipping.motoboyNotes || null,
          estimatedDeliveryDate,
        }
      })

      // 3.5 Update Coupon Usage
      if (validatedCoupon?.id) {
        await tx.coupon.update({
          where: { id: validatedCoupon.id },
          data: { usageCount: { increment: 1 } }
        })
      }

      // 4. Create Order Items
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            variantSize: item.size,
            variantColor: item.color,
            unitPrice: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity
          }
        })
      }

      // 5. Build items for InfinitePay
      const ipItems = cartItems.map(item => ({
        description: `${item.name} - Tam ${item.size}`,
        price: Math.round(Number(item.price) * 100),
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
        // Enviar desconto como um item negativo para a InfinitePay
        ipItems.push({
          description: `Desconto (Cupom: ${validatedCoupon?.code})`,
          price: -Math.round(Number(discount) * 100),
          quantity: 1
        })
      }

      const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`

      // 6. Create InfinitePay Checkout Link
      const payload = {
        handle: process.env.INFINITEPAY_HANDLE,
        order_nsu: orderNumber,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${orderNumber}`,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/infinitepay`,
        items: ipItems,
        customer: {
          name: formData.customer.name,
          email: formData.customer.email,
          phone_number: formattedPhone
        }
      }

      const ipResponse = await fetch(`${process.env.INFINITEPAY_API_URL}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!ipResponse.ok) {
        const errorText = await ipResponse.text().catch(() => 'Unknown Error')
        console.error('[INFINITEPAY ERROR]:', ipResponse.status, errorText)
        throw new Error('Falha ao gerar link de pagamento')
      }

      const data = await ipResponse.json()
      
      if (!data.url) {
        console.error('[INFINITEPAY ERROR]: Nenhum URL de redirecionamento retornado', data)
        throw new Error('Falha ao gerar link de pagamento: resposta inválida')
      }

      // 7. Create Payment record in Prisma
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.PIX, // Placeholder, updated via webhook
          status: 'PENDING',
          paymentUrl: data.url
        }
      })

      return { order, payment, redirectUrl: data.url }
    })

    return { 
      success: true, 
      orderNumber: result.order.orderNumber, 
      orderId: result.order.id,
      redirectUrl: result.redirectUrl 
    }

  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Ocorreu um erro ao processar o seu pedido. Tente novamente.' }
  }
}
