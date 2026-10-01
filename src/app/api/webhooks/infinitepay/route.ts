import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentMethod, Prisma } from '@prisma/client';
import crypto from 'crypto';

/**
 * Webhook handler para notificações de pagamento da InfinitePay.
 *
 * Segurança:
 * 1. Valida assinatura HMAC-SHA256 do payload usando `INFINITEPAY_WEBHOOK_SECRET`.
 * 2. Usa `crypto.timingSafeEqual` para prevenir timing attacks.
 *
 * Fluxo de Negócio (quando assinatura é válida):
 * - Localiza o pedido pelo `order_nsu` (orderNumber).
 * - Se pedido existe e não está PAID, executa transaction atômica:
 *   - Atualiza Order → status PAID.
 *   - Upsert Payment com método (PIX/CREDIT_CARD), transactionId e metadata.
 *   - Decrementa estoque de cada variante nos OrderItems.
 *
 * @returns 200 com `{ received: true }` se processado com sucesso.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Obter o payload cru (raw) como texto para garantir a precisão da assinatura HMAC
    const rawBody = await req.text();
    
    // 2. Extrair o header de assinatura enviado pela InfinitePay
    // Tentamos algumas chaves comuns, priorizando 'x-infinitepay-signature'
    const signatureHeader = req.headers.get('x-infinitepay-signature') || req.headers.get('x-signature');
    const secret = process.env.INFINITEPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Webhook Error: INFINITEPAY_WEBHOOK_SECRET não configurado.');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!signatureHeader) {
      console.warn('Webhook Error: Header de assinatura ausente.');
      return NextResponse.json({ error: 'Unauthorized: Missing signature' }, { status: 401 });
    }

    // 3. Gerar o HMAC SHA-256 do rawBody usando o secret
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    // 4. Prevenir Timing Attacks comparando os buffers de forma segura
    const signatureBuffer = Buffer.from(signatureHeader, 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');

    if (signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
      console.warn('Webhook Error: Assinatura inválida (Spoofing detectado).');
      return NextResponse.json({ error: 'Unauthorized: Invalid signature' }, { status: 401 });
    }

    // 5. Assinatura validada com sucesso, agora podemos parsear o body
    const body = JSON.parse(rawBody);
    
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
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

