'use client'

import { useState } from 'react'
import { QrCode, CreditCard, ChevronRight } from 'lucide-react'

interface PaymentSectionProps {
  total: number
  isSubmitting: boolean
  termsAccepted: boolean
  termsError?: string
  onSubmit: (method: 'PIX' | 'CREDIT_CARD') => void
}

const applyCardMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 16) {
    v = v.replace(/(\d{4})/g, "$1 ").trim()
  }
  return v
}

const applyExpiryMask = (v: string) => {
  v = v.replace(/\D/g, "")
  if (v.length <= 4) {
    v = v.replace(/(\d{2})(\d)/, "$1/$2")
  }
  return v
}

export default function PaymentSection({ total, isSubmitting, termsAccepted, termsError, onSubmit }: PaymentSectionProps) {
  const [method, setMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX')
  
  // Card local state for visual simulation (not submitted to our servers)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installments, setInstallments] = useState(1)

  const handlePlaceOrder = () => {
    onSubmit(method)
  }

  return (
    <div className="bg-white p-6 md:p-8 border border-gray-200 mt-6 lg:mt-8">
      <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">
        Pagamento
      </h2>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMethod('PIX')}
          className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-sm transition-colors ${
            method === 'PIX' ? 'border-[var(--color-brand-green-deep)] bg-green-50/30' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <QrCode className={`w-6 h-6 mb-2 ${method === 'PIX' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${method === 'PIX' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-600'}`}>PIX</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('CREDIT_CARD')}
          className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-sm transition-colors ${
            method === 'CREDIT_CARD' ? 'border-[var(--color-brand-green-deep)] bg-green-50/30' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CreditCard className={`w-6 h-6 mb-2 ${method === 'CREDIT_CARD' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-400'}`} />
          <span className={`text-sm font-semibold ${method === 'CREDIT_CARD' ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-600'}`}>Cartão de Crédito</span>
        </button>
      </div>

      {method === 'PIX' ? (
        <div className="bg-[var(--color-brand-offwhite)] p-4 border border-gray-200 mb-6 text-center">
          <p className="text-[var(--color-brand-dark)] font-medium mb-1">Aprovação Instantânea!</p>
          <p className="text-sm text-gray-600">
            Ao finalizar a compra, você receberá o QR Code e a chave Copia e Cola.
            A sua reserva estará garantida por <strong>20 minutos</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Número do Cartão</label>
            <input 
              value={cardNumber}
              onChange={e => setCardNumber(applyCardMask(e.target.value))}
              maxLength={19}
              className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors font-mono" 
              placeholder="0000 0000 0000 0000" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Nome Impresso no Cartão</label>
            <input 
              value={cardName}
              onChange={e => setCardName(e.target.value.toUpperCase())}
              className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors" 
              placeholder="NOME IGUAL AO CARTÃO" 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Validade</label>
              <input 
                value={cardExpiry}
                onChange={e => setCardExpiry(applyExpiryMask(e.target.value))}
                maxLength={5}
                className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors font-mono" 
                placeholder="MM/AA" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">CVV</label>
              <input 
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                maxLength={4}
                className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors font-mono" 
                placeholder="000" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider mt-4">Parcelamento</label>
            <select 
              value={installments}
              onChange={e => setInstallments(Number(e.target.value))}
              className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const num = i + 1;
                const valuePerInstallment = total / num;
                return (
                  <option key={num} value={num}>
                    {num}x de R$ {valuePerInstallment.toFixed(2).replace('.', ',')} sem juros
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      )}

      {termsError && !termsAccepted && (
        <p className="text-red-500 text-xs mb-4 text-center font-medium">{termsError}</p>
      )}

      <button 
        type="button" 
        onClick={handlePlaceOrder}
        disabled={isSubmitting || total === 0}
        className="w-full bg-[var(--color-brand-green-deep)] text-white py-4 font-bold tracking-widest uppercase hover:bg-[var(--color-brand-dark)] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processando...' : (
          <>
            Finalizar Compra
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </div>
  )
}
