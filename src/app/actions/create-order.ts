'use server'

import { PrismaClient, PaymentMethod, ShippingType } from '@prisma/client'
import { CheckoutFormData } from '@/lib/validations/checkout'
import { CartItem } from '@/lib/store/cart'

const prisma = new PrismaClient()

interface CreateOrderInput {
  formData: CheckoutFormData
  cartItems: CartItem[]
  paymentMethod: 'PIX' | 'CREDIT_CARD'
  cardData?: any
  installments?: number
}

import { infinitepay } from '@/lib/infinitepay'

import crypto from 'crypto'

function generateOrderNumber() {
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `UA-${randomStr}`
}

export async function createOrder({ formData, cartItems, paymentMethod, cardData, installments }: CreateOrderInput) {
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

      // 5. Create Payment with InfinitePay
      const isPix = paymentMethod === 'PIX'
      let paymentData: any = null
      let ipResponse: any = null

      const ipCustomer = {
        firstName: customer.name.split(' ')[0],
        lastName: customer.name.split(' ').slice(1).join(' ') || 'Sobrenome',
        documentNumber: customer.cpf,
        email: customer.email,
        phoneNumber: customer.phone,
        address: {
          street: address.street,
          number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip: address.zipCode
        }
      }

      const amountInCents = Math.round(total * 100)

      if (isPix) {
        ipResponse = await infinitepay.createPixPayment({
          orderId: order.orderNumber,
          amountInCents,
          customer: ipCustomer
        })
        
        paymentData = {
          orderId: order.id,
          method: PaymentMethod.PIX,
          pixCopiaECola: ipResponse.pixCopiaECola || ipResponse.brcode,
          pixQrCode: ipResponse.qrCodeImage,
          pixExpiresAt: ipResponse.expiresAt ? new Date(ipResponse.expiresAt) : new Date(Date.now() + 20 * 60 * 1000)
        }
      } else {
        if (!cardData) throw new Error('Dados do cartão ausentes')
        
        ipResponse = await infinitepay.createCardPayment({
          orderId: order.orderNumber,
          amountInCents,
          customer: ipCustomer,
          installments: installments || 1,
          card: cardData
        })

        paymentData = {
          orderId: order.id,
          method: PaymentMethod.CREDIT_CARD,
          // You could store the transactionId returned by IP in a new field if needed
          // For now, since the payment was approved synchronously, we could update the order status
        }
      }
      
      const payment = await tx.payment.create({
        data: paymentData
      })
      
      // If credit card was instantly approved
      if (!isPix && ipResponse.status === 'approved') {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        })
      }

      return { order, payment }
    })

    return { success: true, orderNumber: result.order.orderNumber, orderId: result.order.id }

  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Ocorreu um erro ao processar o seu pedido. Tente novamente.' }
  }
}
