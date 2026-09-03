'use client'

import { useState } from 'react'
import { OrderStatus, ShippingType } from '@prisma/client'
import { updateOrderStatus } from '@/app/actions/update-order-status'
import { MoreVertical, Check, Truck, X } from 'lucide-react'

interface OrderRowActionsProps {
  orderId: string
  currentStatus: OrderStatus
  shippingType: ShippingType
  currentTracking?: string | null
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  IN_PRODUCTION: 'Em Confecção',
  READY_FOR_PICKUP: 'Pronto p/ Retirada',
  DISPATCHED: 'Despachado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado'
}

export default function OrderRowActions({ orderId, currentStatus, shippingType, currentTracking }: OrderRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [tracking, setTracking] = useState(currentTracking || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateOrderStatus({
      orderId,
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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-[var(--color-brand-dark)] transition-colors rounded-sm hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 mt-1 w-72 bg-white border border-gray-200 shadow-xl z-50 rounded-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gray-50">
        <span className="font-semibold text-xs uppercase tracking-wider text-gray-700">Atualizar Pedido</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full text-sm border-gray-300 border p-2 outline-none focus:border-[var(--color-brand-green-deep)]"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {shippingType !== 'PICKUP' && (status === 'DISPATCHED' || status === 'DELIVERED') && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {shippingType === 'MOTOBOY_RJ' ? 'Anotação (Motoboy)' : 'Cód. Rastreio (Correios)'}
            </label>
            <input 
              type="text" 
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full text-sm border-gray-300 border p-2 outline-none focus:border-[var(--color-brand-green-deep)]"
              placeholder={shippingType === 'MOTOBOY_RJ' ? "Ex: Saiu para entrega" : "Ex: OA123456789BR"}
            />
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase tracking-wider py-2 flex items-center justify-center hover:bg-black transition-colors"
        >
          {isSaving ? 'Salvando...' : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Atualizar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
