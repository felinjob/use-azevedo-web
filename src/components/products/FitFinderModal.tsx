'use client'

import { useState, useMemo } from 'react'
import { X, Ruler, CheckCircle2, AlertCircle } from 'lucide-react'
import { SerializedVariant } from '@/lib/serializers'

interface FitFinderModalProps {
  isOpen: boolean
  onClose: () => void
  variants: SerializedVariant[]
  onSelectSize: (size: string) => void
}

export default function FitFinderModal({ isOpen, onClose, variants, onSelectSize }: FitFinderModalProps) {
  const [bust, setBust] = useState<number | ''>('')
  const [waist, setWaist] = useState<number | ''>('')
  const [hip, setHip] = useState<number | ''>('')

  // Achar tamanho ideal
  const recommendedVariant = useMemo(() => {
    if (!bust && !waist && !hip) return null

    // Assumimos que 'size' são strings que podem conter números
    const sorted = [...variants].sort((a, b) => {
      const numA = parseInt(a.size)
      const numB = parseInt(b.size)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return a.size.localeCompare(b.size)
    })
    
    for (const v of sorted) {
      let isFit = true
      
      // Permitimos uma margem de caimento até -2cm
      if (bust && v.bustCm && v.bustCm < Number(bust) - 2) isFit = false
      if (waist && v.waistCm && v.waistCm < Number(waist) - 2) isFit = false
      if (hip && v.hipCm && v.hipCm < Number(hip) - 2) isFit = false

      if (isFit && (v.bustCm || v.waistCm || v.hipCm)) {
        return v
      }
    }

    return sorted[sorted.length - 1]
  }, [bust, waist, hip, variants])

  if (!isOpen) return null

  const handleSelect = () => {
    if (recommendedVariant) {
      onSelectSize(recommendedVariant.size)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-lg relative rounded-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[var(--color-brand-dark)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--color-brand-gold)]/10 flex items-center justify-center rounded-full">
              <Ruler className="w-5 h-5 text-[var(--color-brand-gold)]" />
            </div>
            <h2 className="text-2xl font-serif text-[var(--color-brand-dark)]">Provador Virtual</h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Insira suas medidas em centímetros e encontraremos o tamanho com o melhor caimento para você.
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Busto (cm)</label>
              <input 
                type="number"
                value={bust}
                onChange={e => setBust(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 110"
                className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none transition-colors bg-gray-50/50 px-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cintura (cm)</label>
              <input 
                type="number"
                value={waist}
                onChange={e => setWaist(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 95"
                className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none transition-colors bg-gray-50/50 px-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Quadril (cm)</label>
              <input 
                type="number"
                value={hip}
                onChange={e => setHip(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 120"
                className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none transition-colors bg-gray-50/50 px-2"
              />
            </div>
          </div>

          {recommendedVariant ? (
            <div className="bg-[var(--color-brand-offwhite)] border border-[var(--color-brand-gold)]/20 p-6 rounded-sm flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-8 h-8 text-[var(--color-brand-green-deep)] mb-2" />
              <p className="text-sm text-[var(--color-brand-dark)] font-medium mb-1">Seu tamanho ideal é</p>
              <span className="text-4xl font-serif text-[var(--color-brand-dark)] mb-6">{recommendedVariant.size}</span>
              
              <button 
                onClick={handleSelect}
                className="w-full bg-[var(--color-brand-green-deep)] text-white font-bold py-4 px-4 uppercase tracking-wider hover:bg-[var(--color-brand-dark)] transition-colors shadow-md"
              >
                Selecionar Tamanho {recommendedVariant.size}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm flex flex-col items-center text-center">
              <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Preencha pelo menos uma medida acima para receber uma recomendação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
