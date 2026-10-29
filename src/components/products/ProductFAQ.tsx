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
    question: "Como funciona a modalidade Sob Encomenda?",
    answer: "Peças sob encomenda são confeccionadas especialmente para o seu pedido. O prazo de produção (em dias úteis) já é somado à estimativa de entrega no checkout, garantindo uma peça nova, impecável e na sua medida.",
    icon: <Package className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
  },
  {
    question: "Como funciona a entrega via Motoboy no Rio de Janeiro?",
    answer: "Disponível para toda a capital do RJ. Após a aprovação do pedido (ou conclusão da confecção), combinamos a janela de entrega diretamente com você pelo WhatsApp para sua total comodidade.",
    icon: <Truck className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
  },
  {
    question: "E se eu precisar trocar o tamanho?",
    answer: "Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução (Art. 49 do CDC). O frete da primeira troca é por nossa conta em peças da coleção regular.",
    icon: <RefreshCcw className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
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
