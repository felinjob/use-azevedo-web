'use client'

import { ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PaymentRedirectOverlayProps {
  isVisible: boolean
}

export default function PaymentRedirectOverlay({ isVisible }: PaymentRedirectOverlayProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setProgress(100), 50)
      return () => clearTimeout(timer)
    } else {
      setProgress(0)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-md p-4">
      <div className="flex flex-col items-center p-8 md:p-10 bg-white md:bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl shadow-2xl max-w-lg text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-6">
          <ShieldCheck className="w-16 h-16 text-[#0B3B24] relative z-10" />
          <div className="absolute inset-0 bg-[#0B3B24]/10 rounded-full animate-ping scale-150"></div>
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-4">
          Ambiente de Pagamento Seguro
        </h3>
        
        <p className="text-[15px] text-[#1A1A1A] font-medium leading-relaxed mb-3">
          Para sua segurança, vamos te redirecionar direto para a página oficial de pagamento da InfinitePay.
        </p>
        
        <p className="text-sm text-[#666666] font-sans leading-relaxed mb-6">
          Ambiente criptografado com dados pré-preenchidos para sua conveniência (Pix taxa zero ou Cartão em até 12x).
        </p>
        
        <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-[#0B3B24] h-full transition-all duration-[2750ms] ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-[#0B3B24]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold text-[#0B3B24] tracking-wide">
            REDIRECIONANDO...
          </span>
        </div>
        
        <div className="mt-8 pt-4 border-t border-[#E5E0D8] w-full text-center">
          <p className="text-[11px] font-medium text-[#666666] uppercase tracking-wider">
            🔒 Conexão Criptografada SSL / Adquirente Oficial CloudWalk
          </p>
        </div>
      </div>
    </div>
  )
}
