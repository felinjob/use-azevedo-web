'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function markOrderAsPaid(orderNumber: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Acesso restrito a administradores.' }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, payment: true }
    })

    if (!order) {
      return { success: false, error: 'Pedido não encontrado.' }
    }

    if (order.status === 'PAID') {
      return { success: false, error: 'O pedido já está pago.' }
    }

    await prisma.$transaction(async (tx: any) => {
      // Update Order
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' }
      })

      // Update Payment
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'APPROVED',
            paidAt: new Date(),
          }
        })
      } else {
        await tx.payment.create({
          data: {
            orderId: order.id,
            status: 'APPROVED',
            method: 'PIX', // Default to PIX for manual payment
            paidAt: new Date(),
          }
        })
      }

      // Decrement stock
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } }
        })
      }
    })

    revalidatePath('/admin/pedidos')
    
    return { success: true }
  } catch (error) {
    console.error('Error marking order as paid:', error)
    return { success: false, error: 'Erro ao marcar pedido como pago.' }
  }
}

