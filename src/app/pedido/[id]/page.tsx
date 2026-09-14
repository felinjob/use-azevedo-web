import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Truck, MapPin, Smartphone } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import OrderClientLogic from './OrderClientLogic'
import PixPaymentDetails from '@/components/checkout/PixPaymentDetails'

const prisma = new PrismaClient()

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      shippingAddress: true,
      payment: true,
      items: true
    }
  })

  if (!order || !order.shippingAddress) {
    notFound()
  }

  const isPix = order.payment?.method === 'PIX'
  const whatsappNumber = '5521999999999' // Amanda's WhatsApp
  const whatsappMessage = encodeURIComponent(`Olá Amanda! Acabei de realizar o pedido ${order.orderNumber}. Gostaria de acompanhar o status!`)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-[var(--color-brand-offwhite)]">
      <Topbar />
      
      {/* Clear Cart on Mount */}
      <OrderClientLogic />

      <main className="container mx-auto px-4 md:px-8 py-12 max-w-4xl">
        
        {/* Header de Sucesso */}
        <div className="text-center mb-12">
          <CheckCircle className="w-16 h-16 text-[var(--color-brand-green-deep)] mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-[var(--color-brand-dark)] mb-2">Pedido Realizado com Sucesso!</h1>
          <p className="text-gray-600">
            Obrigado pela preferência, {order.customer.name.split(' ')[0]}! <br/>
            Seu número de pedido é <strong>{order.orderNumber}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Coluna Esquerda: Pagamento e Ações */}
          <div className="space-y-6">
            
            {/* Bloco de Pagamento */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
                Pagamento
              </h2>
              
              {isPix && order.payment ? (
                <PixPaymentDetails 
                  pixCopiaECola={order.payment.pixCopiaECola || ''} 
                  expiresAt={order.payment.pixExpiresAt} 
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--color-brand-dark)] font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-gray-500 mt-1">Transação em análise pela administradora.</p>
                </div>
              )}
            </div>

            {/* Bloco de Contato */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
                Atendimento
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Dúvidas sobre o pedido? Fale diretamente com a Amanda no WhatsApp.
              </p>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-3 font-bold uppercase tracking-wider hover:bg-[#128C7E] transition-colors flex items-center justify-center rounded-sm"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Notificar Amanda
              </a>
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
                  <span>R$ {Number(order.shippingCost).toFixed(2).replace('.', ',')}</span>
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
