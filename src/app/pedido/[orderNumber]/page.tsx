import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Truck, MapPin, Smartphone, Receipt, CreditCard } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import OrderClientLogic from './OrderClientLogic'
import OrderStatusClient from './OrderStatusClient'

const prisma = new PrismaClient()

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { orderNumber } = await params
  const resolvedSearchParams = await searchParams

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      shippingAddress: true,
      payment: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order || !order.shippingAddress) {
    notFound()
  }

  const searchReceiptUrl = resolvedSearchParams?.receipt_url as string | undefined
  const searchCaptureMethod = resolvedSearchParams?.capture_method as string | undefined
  
  const paymentMetadata = order.payment?.metadata as any
  const finalReceiptUrl = searchReceiptUrl || paymentMetadata?.receipt_url
  
  const captureMethod = searchCaptureMethod || (order.payment?.method === 'PIX' ? 'pix' : 'credit_card')
  const isPix = captureMethod === 'pix'
  const isPaid = order.status === 'PAID'

  const hasMadeToOrder = order.items.some(item => item.product.availability === 'MADE_TO_ORDER')

  const whatsappNumber = process.env.NEXT_PUBLIC_CONTACT_PHONE || '5521999999999'
  const whatsappMessage = encodeURIComponent(`Olá! Acabei de realizar o pedido ${order.orderNumber}. Gostaria de acompanhar o status!`)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-[var(--color-brand-offwhite)]">
      <Topbar />
      
      {/* Clear Cart on Mount */}
      <OrderClientLogic />

      <header className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-center">
          <Link href="/">
            <h1 className="text-2xl font-serif text-[var(--color-brand-dark)] tracking-wide hover:opacity-80 transition-opacity">
              USE AZEVEDO
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        
        {/* Header de Sucesso */}
        <div className="text-center mb-12">
          <CheckCircle className="w-16 h-16 text-[var(--color-brand-green-deep)] mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-[var(--color-brand-dark)] mb-2">Pedido Recebido com Sucesso!</h1>
          <p className="text-gray-600">
            Obrigado pela preferência, {order.customer.name.split(' ')[0]}! <br/>
            Seu número de pedido é <strong>{order.orderNumber}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Coluna Esquerda: Pagamento e Ações */}
          <div className="space-y-6">
            
            {/* Bloco de Pagamento Reativo */}
            <OrderStatusClient 
              orderNumber={order.orderNumber}
              initialStatus={order.status}
              isPix={isPix}
              finalReceiptUrl={finalReceiptUrl}
              hasMadeToOrder={hasMadeToOrder}
            />

            {/* Bloco de Contato */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
                Atendimento
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Dúvidas sobre o pedido? Fale diretamente com a nossa equipe no WhatsApp.
              </p>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#128C7E] transition-colors flex items-center justify-center rounded-sm mb-4"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Acompanhar via WhatsApp
              </a>

              <Link 
                href="/" 
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-[#0B3B24] text-[#0B3B24] hover:bg-[#0B3B24] hover:text-white transition-all rounded-md text-sm font-medium tracking-wide"
              >
                &larr; Voltar para a Loja / Continuar Comprando
              </Link>
            </div>

          </div>

          {/* Coluna Direita: Resumo do Pedido e Entrega */}
          <div className="space-y-6">
            
            {/* Resumo da Entrega */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
                Entrega
              </h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p className="font-medium text-[var(--color-brand-dark)]">{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                  <p>{order.shippingAddress.neighborhood}, {order.shippingAddress.city} - {order.shippingAddress.state}</p>
                  <p>CEP: {order.shippingAddress.zipCode}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-[var(--color-brand-dark)]">
                    {order.shippingType === 'MOTOBOY_RJ' ? 'Motoboy Especial (RJ)' : 
                     order.shippingType === 'PICKUP' ? 'Retirada no Local' : 'Correios'}
                  </p>
                  <p>Previsão: até {order.estimatedDeliveryDate?.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Resumo dos Itens */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
                Resumo da Compra
              </h2>
              <div className="space-y-4 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-[var(--color-brand-dark)] line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-500">Tamanho: {item.variantSize} | Cor: {item.variantColor} | Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-[var(--color-brand-dark)]">
                      R$ {Number(item.totalPrice).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>
                    {order.shippingType === 'MOTOBOY_RJ' 
                      ? 'A combinar com a Amanda' 
                      : `R$ ${Number(order.shippingCost).toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg text-[var(--color-brand-dark)] pt-2">
                  <span>Total</span>
                  <span>R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
