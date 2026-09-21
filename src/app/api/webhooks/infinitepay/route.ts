import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Na InfinitePay, os eventos geralmente vêm com um tipo e metadados
    // Exemplo: { event: 'payment.approved', data: { metadata: { orderId: ... }, amount: ..., paid_amount: ..., receipt_url: ... } }
    // A integração pedida indicou um webhook recebido no payload direto com:
    // invoice_slug, amount, paid_amount, installments, capture_method, transaction_nsu, order_nsu, receipt_url

    // Vamos suportar o formato pedido explicitamente:
    const { 
      order_nsu, 
      transaction_nsu, 
      capture_method, 
      receipt_url, 
      amount, 
      paid_amount 
    } = body;

    if (!order_nsu) {
      return NextResponse.json({ error: 'Missing order_nsu' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: order_nsu },
      include: { items: true, payment: true }
    });

    if (order && order.status !== 'PAID') {
      await prisma.$transaction(async (tx: any) => {
        // Update Order
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        });

        // Update Payment
        const method = capture_method === 'pix' ? PaymentMethod.PIX : PaymentMethod.CREDIT_CARD;
        
        await tx.payment.upsert({
          where: { orderId: order.id },
          update: {
            status: 'APPROVED',
            method: method,
            gatewayTransactionId: transaction_nsu,
            paidAt: new Date(),
            metadata: body, // store full webhook payload
          },
          create: {
            orderId: order.id,
            status: 'APPROVED',
            method: method,
            gatewayTransactionId: transaction_nsu,
            paidAt: new Date(),
            metadata: body
          }
        });

        // Decrement stock
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
