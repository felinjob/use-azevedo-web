'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const pathname = usePathname()

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null
  }

  // Delay the button appearance slightly
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    
    // Auto-hide tooltip after 10 seconds
    const tooltipTimer = setTimeout(() => setShowTooltip(false), 12000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
    }
  }, [])

  if (!isVisible) return null

  const whatsappNumber = '5521978594358'
  const message = encodeURIComponent('Olá, Amanda! Estou no site da Use Azevedo e gostaria de tirar uma dúvida.')
  const link = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-8 fade-in duration-500">
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="mb-4 bg-white text-[var(--color-brand-dark)] text-sm px-4 py-3 rounded-lg shadow-xl border border-gray-100 flex items-start gap-3 relative animate-in fade-in duration-300">
          <p className="font-medium pr-2">Dúvidas sobre tamanhos ou pedidos? Fale conosco!</p>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 pt-0.5"
            aria-label="Fechar mensagem"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Arrow */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45" />
        </div>
      )}

      {/* Main Button */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="relative group bg-[#25D366] hover:bg-[#128C7E] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        
        {/* Ping Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 group-hover:animate-ping" />
      </a>
    </div>
  )
}
