'use server'

import { PrismaClient, OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

interface UpdateOrderStatusInput {
  orderId: string
  status: OrderStatus
  trackingCode?: string
  motoboyNotes?: string
}

export async function updateOrderStatus({ orderId, status, trackingCode, motoboyNotes }: UpdateOrderStatusInput) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingCode !== undefined && { trackingCode }),
        ...(motoboyNotes !== undefined && { motoboyNotes }),
      }
    })

    revalidatePath('/admin/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Erro ao atualizar o status do pedido.' }
  }
}
