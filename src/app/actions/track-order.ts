'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function trackOrder(orderNumber: string, cpf: string) {
  try {
    const cleanCpf = cpf.replace(/\D/g, '')

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    })

    if (!order || order.customer.cpf !== cleanCpf) {
      return { success: false, error: 'Pedido não encontrado ou CPF divergente.' }
    }

    return { 
      success: true, 
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        shippingType: order.shippingType,
        trackingCode: order.trackingCode,
        motoboyNotes: order.motoboyNotes,
        items: order.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          isMadeToOrder: item.product.availability === 'MADE_TO_ORDER'
        })),
        address: order.shippingAddress ? {
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          neighborhood: order.shippingAddress.neighborhood,
          street: `${order.shippingAddress.street.substring(0, 5)}***` // Truncated for privacy
        } : null
      }
    }
  } catch (error) {
    console.error('Error tracking order:', error)
    return { success: false, error: 'Erro ao consultar o rastreamento.' }
  }
}
