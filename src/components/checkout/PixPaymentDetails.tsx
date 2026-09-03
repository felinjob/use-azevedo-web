'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, QrCode } from 'lucide-react'

interface PixPaymentDetailsProps {
  pixCopiaECola: string
  expiresAt: Date | null
}

export default function PixPaymentDetails({ pixCopiaECola, expiresAt }: PixPaymentDetailsProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime()
      if (difference > 0) {
        const minutes = Math.floor((difference / 1000 / 60) % 60)
        const seconds = Math.floor((difference / 1000) % 60)
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft('Expirado')
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopiaECola)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48 bg-gray-50 border border-gray-200 flex items-center justify-center mb-6 relative">
        {/* Placeholder SVG since we don't want external dependencies */}
        <QrCode className="w-32 h-32 text-gray-300" />
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <span className="bg-white text-[var(--color-brand-dark)] text-xs font-bold px-2 py-1 shadow-sm uppercase tracking-wider">
            QR Code Simulado
          </span>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider text-center">
          Chave PIX Copia e Cola
        </label>
        <div className="flex border border-gray-300 bg-gray-50 rounded-sm overflow-hidden mb-4">
          <input 
            type="text" 
            readOnly 
            value={pixCopiaECola} 
            className="w-full bg-transparent p-3 text-sm text-gray-600 outline-none font-mono"
          />
          <button 
            onClick={handleCopy}
            className="bg-[var(--color-brand-green-deep)] text-white px-4 flex items-center justify-center hover:bg-[var(--color-brand-dark)] transition-colors"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-3 w-full text-center rounded-sm text-amber-800 text-sm">
        <p className="font-semibold mb-1">Atenção ao prazo!</p>
        <p>
          O pagamento expira em: <strong className="font-mono text-lg ml-1">{timeLeft}</strong>
        </p>
      </div>
    </div>
  )
}
