'use client'

import { useState } from 'react'
import { markOrderAsPaid } from '@/app/actions/mark-order-paid'
import { Check } from 'lucide-react'

export default function MarkAsPaidButton({ orderNumber }: { orderNumber: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!window.confirm('Tem certeza que deseja marcar este pedido como PAGO manualmente? Esta ação dará baixa no estoque automaticamente.')) {
      return
    }

    setIsLoading(true)
    const res = await markOrderAsPaid(orderNumber)
    setIsLoading(false)

    if (!res.success) {
      alert(res.error)
    }
  }

  return (
    <button
      onClick={handleMarkAsPaid}
      disabled={isLoading}
      className="inline-flex items-center justify-center px-2 py-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors text-[10px] font-bold uppercase tracking-wider rounded-sm disabled:opacity-50 mr-2"
      title="Marcar como Pago"
    >
      {isLoading ? '...' : (
        <>
          <Check className="w-3 h-3 mr-1" />
          Baixa Manual
        </>
      )}
    </button>
  )
}
