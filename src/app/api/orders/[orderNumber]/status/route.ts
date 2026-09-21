import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        status: true,
        payment: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const metadata = order.payment?.metadata as any
    const receiptUrl = metadata?.receipt_url

    return NextResponse.json({
      status: order.status,
      payment: {
        status: order.payment?.status,
        method: order.payment?.method,
        receiptUrl
      }
    })
  } catch (error) {
    console.error('Error fetching order status:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
