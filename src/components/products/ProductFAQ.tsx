'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, RefreshCcw, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
  icon: React.ReactNode
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Como funciona a entrega Sob Encomenda?",
    answer: "Peças sob encomenda são produzidas exclusivamente para você. O prazo de confecção (em dias úteis) é somado ao prazo de envio escolhido. Assim, você garante uma peça exclusiva com caimento perfeito.",
    icon: <Package className="w-5 h-5 text-[var(--color-brand-gold)]" />
  },
  {
    question: "A entrega via Motoboy chega no mesmo dia?",
    answer: "A entrega via Motoboy é válida para o Rio de Janeiro e ocorre em 1 a 2 dias úteis. Caso a peça seja Pronta Entrega e o pedido aprovado até as 12h, frequentemente entregamos no dia seguinte.",
    icon: <Truck className="w-5 h-5 text-[var(--color-brand-gold)]" />
  },
  {
    question: "Como funciona a primeira troca grátis?",
    answer: "Você tem até 7 dias úteis após o recebimento para solicitar a troca ou devolução. A primeira troca tem o frete por nossa conta! (Exceção: itens de bazar/promoção).",
    icon: <RefreshCcw className="w-5 h-5 text-[var(--color-brand-gold)]" />
  }
]

export default function ProductFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="border-t border-gray-200 py-8">
      <h3 className="text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-widest mb-6">Dúvidas Frequentes</h3>
      
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx
          
          return (
            <div key={idx} className="border border-gray-200 rounded-sm overflow-hidden bg-white">
              <button 
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-bold text-[var(--color-brand-dark)]">{item.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-40" : "max-h-0"
                )}
              >
                <div className="p-4 pt-0 text-sm text-[var(--color-brand-muted)] border-t border-gray-100 bg-gray-50/50">
                  {item.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
