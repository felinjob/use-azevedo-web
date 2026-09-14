import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    
    // Na InfinitePay, os eventos geralmente vêm com um tipo e metadados
    // Exemplo genérico de payload de webhook
    const eventType = payload.event
    const data = payload.data

    if (!data || !data.metadata || !data.metadata.orderId) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const orderNumber = data.metadata.orderId

    if (eventType === 'payment.approved' || eventType === 'payment.paid') {
      await prisma.order.update({
        where: { orderNumber },
        data: { status: 'PAID' }
      })
      console.log(`[InfinitePay Webhook] Order ${orderNumber} marked as PAID.`)
    } 
    else if (eventType === 'payment.refused' || eventType === 'payment.failed') {
      await prisma.order.update({
        where: { orderNumber },
        data: { status: 'CANCELED' }
      })
      console.log(`[InfinitePay Webhook] Order ${orderNumber} marked as CANCELLED.`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[InfinitePay Webhook Error]:', error)
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 })
  }
}
