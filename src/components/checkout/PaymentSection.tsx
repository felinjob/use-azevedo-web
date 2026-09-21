'use client'

import { ShieldCheck, ChevronRight } from 'lucide-react'

interface PaymentSectionProps {
  total: number
  isSubmitting: boolean
  termsAccepted: boolean
  termsError?: string
  checkoutError?: string | null
  onSubmit: () => void
}

export default function PaymentSection({ total, isSubmitting, termsAccepted, termsError, checkoutError, onSubmit }: PaymentSectionProps) {
  return (
    <div className="bg-white p-6 md:p-8 border border-gray-200 mt-6 lg:mt-8">
      <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">
        Pagamento
      </h2>

      <div className="bg-[var(--color-brand-offwhite)] p-4 border border-gray-200 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-[var(--color-brand-green-deep)] shrink-0" />
        <div>
          <p className="text-[var(--color-brand-dark)] font-medium mb-1">Ambiente Seguro InfinitePay</p>
          <p className="text-sm text-gray-600">
            Ao clicar em finalizar, você será redirecionado para a plataforma segura da InfinitePay para escolher sua forma de pagamento (Pix ou Cartão de Crédito) e concluir seu pedido.
          </p>
        </div>
      </div>

      {termsError && !termsAccepted && (
        <p className="text-red-500 text-xs mb-4 text-center font-medium">{termsError}</p>
      )}

      {checkoutError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 mb-6 border border-red-200 text-center rounded-sm">
          {checkoutError}
        </div>
      )}

      <button 
        type="button" 
        onClick={onSubmit}
        disabled={isSubmitting || total === 0}
        className="w-full bg-[var(--color-brand-green-deep)] text-white py-4 font-bold tracking-widest uppercase hover:bg-[var(--color-brand-dark)] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processando...' : (
          <>
            Finalizar Compra Segura
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </div>
  )
}
