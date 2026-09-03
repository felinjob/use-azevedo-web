'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

import { SerializedVariant } from '@/lib/serializers'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
  variants: SerializedVariant[]
}

export default function SizeGuideModal({ isOpen, onClose, variants }: SizeGuideModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Sort variants by size ascending roughly based on our strings (44, 46... G1, G2)
  const sortedVariants = [...variants].sort((a, b) => {
    const aNum = parseInt(a.size)
    const bNum = parseInt(b.size)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    return a.size.localeCompare(b.size)
  })

  // Deduplicate sizes just in case there are multiple colors per size
  const uniqueSizes = Array.from(new Map(sortedVariants.map(item => [item.size, item])).values())

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-[var(--color-brand-offwhite)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md shadow-2xl border border-[var(--color-brand-gold)]/30 animate-in fade-in zoom-in duration-200">
        
        <div className="sticky top-0 bg-[var(--color-brand-offwhite)] flex items-center justify-between p-4 border-b border-gray-200 z-10">
          <h2 className="text-xl font-serif text-[var(--color-brand-dark)]">Tabela de Medidas</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-white/50 border border-[var(--color-brand-green-light)]/20 rounded-md">
            <h3 className="text-sm font-bold text-[var(--color-brand-green-deep)] mb-2 uppercase tracking-wider">Como Medir</h3>
            <p className="text-sm text-[var(--color-brand-muted)] font-light leading-relaxed">
              Use uma fita métrica confortávelmente ao redor do seu corpo, sem apertar. 
              <strong> Busto:</strong> Contorne a parte mais cheia. 
              <strong> Cintura:</strong> Meça a parte mais fina (geralmente acima do umbigo). 
              <strong> Quadril:</strong> Contorne a parte mais larga dos glúteos.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-brand-green-deep)] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs rounded-tl-sm">Tamanho</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Busto (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Cintura (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Quadril (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs rounded-tr-sm">Compr. (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uniqueSizes.map((v) => (
                  <tr key={v.size} className="hover:bg-black/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-[var(--color-brand-dark)]">{v.size}</td>
                    <td className="px-4 py-3 text-[var(--color-brand-muted)]">{v.bustCm ? Number(v.bustCm).toString() : '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-brand-muted)]">{v.waistCm ? Number(v.waistCm).toString() : '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-brand-muted)]">{v.hipCm ? Number(v.hipCm).toString() : '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-brand-muted)]">{v.lengthCm ? Number(v.lengthCm).toString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
