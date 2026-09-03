'use server'

import { PrismaClient, PaymentMethod, ShippingType } from '@prisma/client'
import { CheckoutFormData } from '@/lib/validations/checkout'
import { CartItem } from '@/lib/store/cart'

const prisma = new PrismaClient()

interface CreateOrderInput {
  formData: CheckoutFormData
  cartItems: CartItem[]
  paymentMethod: 'PIX' | 'CREDIT_CARD'
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(1000 + Math.random() * 9000).toString()
  return `UA-${timestamp}${random}`
}

export async function createOrder({ formData, cartItems, paymentMethod }: CreateOrderInput) {
  try {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingCost = formData.shipping.price
    const total = subtotal + shippingCost
    
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

      if (!customer) {
        // Fallback check by email
        customer = await tx.customer.findUnique({
          where: { email: formData.customer.email }
        })
        
        if (customer) {
          // Update missing CPF if found by email
          customer = await tx.customer.update({
            where: { email: customer.email },
            data: { cpf: cleanCpf, name: formData.customer.name, phone: formData.customer.phone }
          })
        } else {
          // Create new customer
          customer = await tx.customer.create({
            data: {
              cpf: cleanCpf,
              name: formData.customer.name,
              email: formData.customer.email,
              phone: formData.customer.phone
            }
          })
        }
      } else {
        // Update details if found by CPF
        customer = await tx.customer.update({
          where: { cpf: cleanCpf },
          data: { name: formData.customer.name, email: formData.customer.email, phone: formData.customer.phone }
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
          total,
          shippingType,
          motoboyNotes: formData.shipping.motoboyNotes || null,
          estimatedDeliveryDate,
        }
      })

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

      // 5. Create Payment
      const isPix = paymentMethod === 'PIX'
      const pixExpiresAt = isPix ? new Date(Date.now() + 20 * 60 * 1000) : null
      
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: isPix ? PaymentMethod.PIX : PaymentMethod.CREDIT_CARD,
          pixCopiaECola: isPix ? `00020126580014br.gov.bcb.pix0136${customer.cpf}5204000053039865802BR5925Use Azevedo6009SAO PAULO62140510${orderNumber}6304` : null, // Mocked Payload
          pixQrCode: isPix ? `mock_base64_qr_code` : null, // Mocked representation
          pixExpiresAt
        }
      })

      return { order, payment }
    })

    return { success: true, orderNumber: result.order.orderNumber }

  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Ocorreu um erro ao processar o seu pedido. Tente novamente.' }
  }
}
