'use server'

import { PrismaClient, OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

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

