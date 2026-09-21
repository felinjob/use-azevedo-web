'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, CreditCard, Receipt, Loader2 } from 'lucide-react'

interface OrderStatusClientProps {
  orderNumber: string
  initialStatus: string
  isPix: boolean
  finalReceiptUrl?: string
  hasMadeToOrder: boolean
}

export default function OrderStatusClient({
  orderNumber,
  initialStatus,
  isPix,
  finalReceiptUrl,
  hasMadeToOrder
}: OrderStatusClientProps) {
  const [status, setStatus] = useState(initialStatus)
  const [receiptUrl, setReceiptUrl] = useState(finalReceiptUrl)

  useEffect(() => {
    if (status === 'PAID') return

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`)
        const data = await res.json()
        if (data.status === 'PAID') {
          setStatus('PAID')
          if (data.payment?.receiptUrl) {
            setReceiptUrl(data.payment.receiptUrl)
          }
        }
      } catch (error) {
        console.error('Error checking status:', error)
      }
    }

    const interval = setInterval(checkStatus, 2000)
    
    // Stop polling after 30 seconds to save resources if no update
    const timeout = setTimeout(() => {
      clearInterval(interval)
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [status, orderNumber])

  const isPaid = status === 'PAID'

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-sm">
      <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">
        Status do Pagamento
      </h2>
      
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <div className="flex items-center gap-2">
          {isPix ? (
            <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Pago via Pix
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
              <CreditCard className="w-4 h-4 mr-1" />
              Pago via Cartão de Crédito
            </span>
          )}
        </div>

        {!isPaid && (
          <div className="flex flex-col items-center gap-3 w-full">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            <p className="text-sm text-yellow-700 font-medium text-center bg-yellow-50 px-4 py-3 rounded-sm border border-yellow-200 w-full">
              Aguardando confirmação do pagamento... (Atualizando automaticamente)
            </p>
          </div>
        )}

        {isPaid && (
          <div className="text-sm text-center space-y-3 mt-4 bg-green-50 p-5 border border-green-200 rounded-sm w-full shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-[var(--color-brand-green-deep)] font-bold text-base mb-2">
              <CheckCircle className="w-5 h-5" />
              Pagamento Confirmado com Sucesso!
            </div>
            
            <p className="text-gray-700 font-medium">
              Seu pagamento foi aprovado pela InfinitePay e o pedido já está sendo preparado.
            </p>

            {hasMadeToOrder ? (
              <p className="text-gray-600 mt-2 text-xs">
                Identificamos itens sob encomenda em seu pedido. O prazo de confecção artesanal (já incluso no cálculo do frete) começou a contar. Assim que as peças estiverem prontas, faremos o despacho.
              </p>
            ) : (
              <p className="text-gray-600 mt-2 text-xs">
                Todos os itens são de pronta entrega! Seu pedido já está na fila para separação e será despachado em breve.
              </p>
            )}
          </div>
        )}

        {receiptUrl && (
          <a 
            href={receiptUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 w-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-dark)] border border-[var(--color-brand-green-deep)] py-3 font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-brand-green-deep)] hover:text-white transition-all flex items-center justify-center rounded-sm"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Visualizar Comprovante Oficial
          </a>
        )}
      </div>
    </div>
  )
}
