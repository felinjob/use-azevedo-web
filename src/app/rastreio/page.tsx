'use client'

import { useState } from 'react'
import { trackOrder } from '@/app/actions/track-order'
import { Package, Truck, CheckCircle, Search, Clock, MapPin } from 'lucide-react'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const applyCpfMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return v
}

type TrackedOrder = NonNullable<Awaited<ReturnType<typeof trackOrder>>['order']>

export default function RastreioPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TrackedOrder | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const res = await trackOrder(orderNumber, cpf)
    if (res.success && res.order) {
      setResult(res.order)
    } else {
      setError(res.error || 'Erro ao buscar pedido')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="w-full bg-white p-6 md:p-10 border border-[var(--color-brand-muted)]/15 rounded-md shadow-xs">
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-2 text-center">Rastrear Pedido</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Acompanhe o status e a entrega da sua compra na Use Azevedo.
          </p>

          <form onSubmit={handleTrack} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-200 text-center">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Número do Pedido</label>
                <input 
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors font-mono"
                  placeholder="Ex: UA-123456"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">CPF do Titular</label>
                <input 
                  required
                  maxLength={14}
                  value={cpf}
                  onChange={(e) => setCpf(applyCpfMask(e.target.value))}
                  className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors font-mono"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-brand-dark)] text-white py-4 font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Rastrear Agora
                </>
              )}
            </button>
          </form>

          {/* Resultado */}
          {result && (
            <div className="mt-12 pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-brand-dark)]">Status: {
                    result.status === 'PENDING' ? 'Aguardando Pagamento' :
                    result.status === 'PAID' ? 'Pagamento Aprovado' :
                    result.status === 'IN_PRODUCTION' ? 'Em Confecção' :
                    result.status === 'READY_FOR_PICKUP' ? 'Disponível para Retirada' :
                    result.status === 'DISPATCHED' ? 'Enviado' :
                    result.status === 'DELIVERED' ? 'Entregue' : 'Cancelado'
                  }</h2>
                  <p className="text-xs text-gray-500 mt-1">Pedido realizado em {result.createdAt.toLocaleDateString('pt-BR')}</p>
                </div>
                {result.address && (
                  <div className="text-right text-xs text-gray-500 flex flex-col items-end">
                    <MapPin className="w-4 h-4 mb-1 text-gray-400" />
                    <span>{result.address.street}</span>
                    <span>{result.address.city} - {result.address.state}</span>
                  </div>
                )}
              </div>

              {/* Timeline Horizontal */}
              <div className="relative py-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
                
                {/* Dynamically calculate progress width */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-brand-green-deep)] transition-all duration-1000 ease-in-out"
                  style={{
                    width: result.status === 'PENDING' ? '0%' :
                           result.status === 'PAID' ? '33%' :
                           result.status === 'IN_PRODUCTION' || result.status === 'READY_FOR_PICKUP' ? '66%' :
                           result.status === 'DISPATCHED' || result.status === 'DELIVERED' ? '100%' : '0%'
                  }}
                />

                <div className="relative flex justify-between">
                  <div className={`flex flex-col items-center ${result.status !== 'CANCELED' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2 z-10">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Aprovado</span>
                  </div>

                  <div className={`flex flex-col items-center ${
                    ['IN_PRODUCTION', 'READY_FOR_PICKUP', 'DISPATCHED', 'DELIVERED'].includes(result.status) ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-300'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2 z-10">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center max-w-[80px]">
                      {result.items.some(i => i.isMadeToOrder) ? 'Em Confecção' : 'Preparando'}
                    </span>
                  </div>

                  <div className={`flex flex-col items-center ${
                    ['DISPATCHED', 'DELIVERED'].includes(result.status) ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-300'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2 z-10">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Enviado</span>
                  </div>

                  <div className={`flex flex-col items-center ${
                    result.status === 'DELIVERED' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-300'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center mb-2 z-10">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Entregue</span>
                  </div>
                </div>
              </div>

              {/* Rastreio Específico */}
              {result.status === 'DISPATCHED' && (
                <div className="bg-green-50 p-4 border border-green-200 mt-6 text-center text-sm">
                  {result.shippingType === 'MOTOBOY_RJ' ? (
                    <p className="text-green-800 font-medium">
                      O seu pedido saiu para entrega com nosso Motoboy VIP! 🎉
                      {result.motoboyNotes && <span className="block mt-1 font-normal text-green-700">Nota: {result.motoboyNotes}</span>}
                    </p>
                  ) : result.shippingType === 'PICKUP' ? (
                    <p className="text-green-800 font-medium">
                      O seu pedido está pronto para ser retirado no ateliê!
                    </p>
                  ) : (
                    <div>
                      <p className="text-green-800 font-medium mb-2">Seu pedido foi despachado via Correios.</p>
                      {result.trackingCode ? (
                        <a 
                          href={`https://rastreamento.correios.com.br/app/index.php`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-[var(--color-brand-green-deep)] text-white px-4 py-2 uppercase font-bold tracking-wider text-xs hover:bg-black transition-colors"
                        >
                          Rastrear {result.trackingCode}
                        </a>
                      ) : (
                        <p className="text-xs text-green-700">O código de rastreio estará disponível em breve.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Itens */}
              <div className="mt-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Peças neste pedido</h3>
                <div className="space-y-2">
                  {result.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500">Qtd: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
