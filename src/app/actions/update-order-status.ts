'use server'

import { OrderStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface UpdateOrderStatusInput {
  orderId: string
  status: OrderStatus
  trackingCode?: string
  motoboyNotes?: string
}

export async function updateOrderStatus({ orderId, status, trackingCode, motoboyNotes }: UpdateOrderStatusInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Acesso restrito a administradores.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })

      if (!order) {
        throw new Error('Pedido não encontrado.')
      }

      const previousStatus = order.status
      const wasPaidOrProcessing = ['PAID', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'DISPATCHED', 'DELIVERED'].includes(previousStatus)
      const isNowCanceled = status === 'CANCELED'

      // Se o pedido teve estoque debitado e agora foi cancelado, estorna o estoque para o catálogo
      if (wasPaidOrProcessing && isNowCanceled) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } }
          }).catch(() => {})
        }
      }

      // Se o pedido estava cancelado e foi reativado para pago/em produção, re-decrementa o estoque
      if (previousStatus === 'CANCELED' && ['PAID', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'DISPATCHED'].includes(status)) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } }
          }).catch(() => {})
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(trackingCode !== undefined && { trackingCode }),
          ...(motoboyNotes !== undefined && { motoboyNotes }),
        }
      })
    })

    revalidatePath('/admin/pedidos')
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Erro ao atualizar o status do pedido.' }
  }
}
