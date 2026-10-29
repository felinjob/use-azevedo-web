'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const pathname = usePathname()

  const isAdmin = pathname.startsWith('/admin')

  // Delay the button appearance slightly
  useEffect(() => {
    if (isAdmin) return

    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [isAdmin])

  if (isAdmin || !isVisible) return null

  const whatsappNumber = '5521978594358'
  const message = encodeURIComponent('Olá, Amanda! Estou no site da Use Azevedo e gostaria de tirar uma dúvida.')
  const link = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <div
      onMouseLeave={() => setShowTooltip(false)}
      className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end animate-in slide-in-from-bottom-8 fade-in duration-500"
    >
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="mb-3 bg-white text-[var(--color-brand-dark)] text-xs px-4 py-2.5 rounded-sm shadow-lg border border-gray-200 flex items-center gap-3 relative animate-in fade-in duration-200">
          <p className="font-medium">Dúvidas sobre tamanhos ou caimento? Fale com a Amanda</p>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45" />
        </div>
      )}

      {/* Main Button */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="relative group bg-[#128C7E] hover:bg-[#0B3B24] text-white w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  )
}
