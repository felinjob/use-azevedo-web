'use client'

import { X, Ruler } from 'lucide-react'
import { useEffect } from 'react'
import { SerializedVariant } from '@/lib/serializers'
import { getResolvedVariantMeasurements } from '@/lib/fit-meta'

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

  const sortedVariants = [...variants].sort((a, b) => {
    const aNum = parseInt(a.size)
    const bNum = parseInt(b.size)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    return a.size.localeCompare(b.size)
  })

  const uniqueSizes = Array.from(new Map(sortedVariants.map(item => [item.size, item])).values())

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-[var(--color-brand-offwhite)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md shadow-2xl border border-[var(--color-brand-gold)]/30 animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-[var(--color-brand-offwhite)] flex items-center justify-between p-4 sm:px-6 border-b border-gray-200 z-10">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
            <h2 className="text-xl font-serif text-[var(--color-brand-dark)]">Tabela de Medidas desta Peça</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-white border border-[var(--color-brand-muted)]/20 rounded-md">
            <h3 className="text-xs font-bold text-[var(--color-brand-green-deep)] mb-2 uppercase tracking-wider">
              Como Medir no Corpo
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] font-light leading-relaxed">
              Use uma fita métrica ao redor do corpo sem apertar.{' '}
              <strong className="text-[var(--color-brand-dark)]">Busto:</strong> contorne a parte mais cheia.{' '}
              <strong className="text-[var(--color-brand-dark)]">Cintura:</strong> meça a parte mais fina (cerca de 2 dedos acima do umbigo).{' '}
              <strong className="text-[var(--color-brand-dark)]">Quadril:</strong> contorne a parte mais larga dos glúteos.
            </p>
          </div>

          <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--color-brand-green-deep)] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Tamanho</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Busto (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Cintura (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Quadril (cm)</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">Compr. Médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uniqueSizes.map(v => {
                  const resolved = getResolvedVariantMeasurements(v)
                  return (
                    <tr key={v.size} className="hover:bg-black/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--color-brand-dark)]">{v.size}</td>
                      <td className="px-4 py-3 text-[var(--color-brand-muted)]">{resolved.bustLabel}</td>
                      <td className="px-4 py-3 text-[var(--color-brand-muted)]">{resolved.waistLabel}</td>
                      <td className="px-4 py-3 text-[var(--color-brand-muted)]">{resolved.hipLabel}</td>
                      <td className="px-4 py-3 text-[var(--color-brand-muted)]">{resolved.lengthLabel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
