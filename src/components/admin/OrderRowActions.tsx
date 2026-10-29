'use client'

import { useState } from 'react'
import { OrderStatus, ShippingType } from '@prisma/client'
import { updateOrderStatus } from '@/app/actions/update-order-status'
import { Eye, Check, X, Copy, MessageCircle, MapPin, Package, User } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

export interface SerializedOrderItem {
  id: string
  productName: string
  variantSize: string
  variantColor: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isMadeToOrder: boolean
}

export interface SerializedOrderDetails {
  id: string
  orderNumber: string
  status: OrderStatus
  shippingType: ShippingType
  trackingCode?: string | null
  motoboyNotes?: string | null
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  customer: {
    name: string
    email: string
    phone: string
    cpf: string
  }
  address?: {
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
  } | null
  items: SerializedOrderItem[]
}

interface OrderRowActionsProps {
  order: SerializedOrderDetails
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente (Aguardando Pagamento)',
  PAID: 'Pago (Separar / Produzir)',
  IN_PRODUCTION: 'Em Confecção no Ateliê',
  READY_FOR_PICKUP: 'Pronto p/ Retirada',
  DISPATCHED: 'Despachado / Em Rota',
  DELIVERED: 'Entregue à Cliente',
  CANCELED: 'Cancelado'
}

export default function OrderRowActions({ order }: OrderRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [tracking, setTracking] = useState(order.trackingCode || '')
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateOrderStatus({
      orderId: order.id,
      status,
      trackingCode: tracking
    })
    setIsSaving(false)
    if (res.success) {
      setIsOpen(false)
    } else {
      alert(res.error)
    }
  }

  const handleCopyAddress = () => {
    if (!order.address) return
    const text = `${order.customer.name}\n${order.address.street}, ${order.address.number}${order.address.complement ? ` - ${order.address.complement}` : ''}\n${order.address.neighborhood} - ${order.address.city}/${order.address.state}\nCEP: ${order.address.zipCode}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cleanPhone = order.customer.phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá, ${order.customer.name.split(' ')[0]}! Aqui é a Amanda da Use Azevedo sobre o seu pedido *${order.orderNumber}*.`
  )}`

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-green-deep)] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors rounded-sm"
        title="Ver detalhes e atualizar pedido"
      >
        <Eye className="w-3.5 h-3.5" />
        Detalhes
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-left">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                  Detalhes do Pedido
                </span>
                <h3 className="font-serif text-xl text-[var(--color-brand-dark)] font-bold">
                  Pedido {order.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bloco 1: Peças Compradas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[var(--color-brand-green-deep)]" />
                  Peças para Separação / Confecção ({order.items.length})
                </h4>
                <div className="border border-gray-200 rounded-sm divide-y divide-gray-100 bg-gray-50/50">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-sm text-[var(--color-brand-dark)]">
                          {item.quantity}x {item.productName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-xs font-bold text-gray-800">
                            Tamanho: {item.variantSize}
                          </span>
                          <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-xs font-semibold text-gray-700">
                            Cor: {item.variantColor}
                          </span>
                          {item.isMadeToOrder && (
                            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-xs">
                              Sob Encomenda
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right font-semibold text-sm text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloco 2: Cliente & Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-sm bg-white space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
                    Dados da Cliente
                  </h4>
                  <p className="text-sm font-bold text-gray-900">{order.customer.name}</p>
                  <p className="text-xs text-gray-600">CPF: <span className="font-mono">{order.customer.cpf}</span></p>
                  <p className="text-xs text-gray-600">E-mail: {order.customer.email}</p>
                  <div className="pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-3 py-1.5 rounded-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chamar no WhatsApp ({order.customer.phone})
                    </a>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-sm bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
                      Endereço de Entrega
                    </h4>
                    {order.address && (
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="text-[11px] font-bold text-[var(--color-brand-green-deep)] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    )}
                  </div>
                  {order.address ? (
                    <div className="text-xs text-gray-700 space-y-1 leading-relaxed">
                      <p className="font-semibold text-gray-900">
                        {order.address.street}, {order.address.number}
                        {order.address.complement ? ` — ${order.address.complement}` : ''}
                      </p>
                      <p>{order.address.neighborhood} • {order.address.city}/{order.address.state}</p>
                      <p className="font-mono font-bold text-gray-900">CEP: {order.address.zipCode}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Retirada no local / Sem endereço</p>
                  )}
                  {order.motoboyNotes && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900">
                      <strong>Obs. Entrega:</strong> {order.motoboyNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Bloco 3: Atualizar Status e Rastreio */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Atualizar Andamento do Pedido
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Status do Pedido
                    </label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OrderStatus)}
                      className="w-full text-sm bg-white border-gray-300 border p-2.5 rounded-sm outline-none focus:border-[var(--color-brand-green-deep)]"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      {order.shippingType === 'MOTOBOY_RJ' ? 'Aviso sobre o Motoboy' : 'Código de Rastreio (Correios)'}
                    </label>
                    <input 
                      type="text" 
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      className="w-full text-sm bg-white border-gray-300 border p-2.5 rounded-sm outline-none focus:border-[var(--color-brand-green-deep)] font-mono"
                      placeholder={order.shippingType === 'MOTOBOY_RJ' ? "Ex: Saiu para entrega às 14h" : "Ex: OA123456789BR"}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-200 rounded-sm transition-colors"
                  >
                    Fechar
                  </button>
                  <button 
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[var(--color-brand-green-deep)] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm flex items-center justify-center hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Salvar Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

