'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler, MessageCircle } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'

const STANDARD_MEASUREMENTS = [
  { size: '44', bust: '104 - 108', waist: '86 - 90', hip: '112 - 116', length: '105' },
  { size: '46', bust: '108 - 112', waist: '90 - 94', hip: '116 - 120', length: '106' },
  { size: '48', bust: '112 - 118', waist: '94 - 100', hip: '120 - 126', length: '107' },
  { size: '50', bust: '118 - 124', waist: '100 - 106', hip: '126 - 132', length: '108' },
  { size: '52', bust: '124 - 130', waist: '106 - 112', hip: '132 - 138', length: '109' },
  { size: '54', bust: '130 - 136', waist: '112 - 118', hip: '138 - 144', length: '110' },
  { size: '56+', bust: '136 - 144', waist: '118 - 126', hip: '144 - 152', length: '110' },
]

export default function GlobalSizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide } = useUIStore()

  useEffect(() => {
    if (isSizeGuideOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isSizeGuideOpen])

  return (
    <AnimatePresence>
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSizeGuide}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-[var(--color-brand-canvas)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-[var(--color-brand-muted)]/20 z-10"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-brand-canvas)] border-b border-[var(--color-brand-muted)]/15 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
                <h2 className="text-xl font-serif text-[var(--color-brand-dark)]">Guia de Medidas Oficial</h2>
              </div>
              <button 
                onClick={closeSizeGuide}
                className="p-1.5 rounded-full hover:bg-black/5 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* How to measure instruction */}
              <div className="bg-white p-4 rounded-md border border-[var(--color-brand-muted)]/15">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-brand-green-deep)] mb-2">
                  Como Medir com Fita Métrica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-0.5">1. Busto</strong>
                    Contorne a fita métrica sobre a parte mais saliente do busto, mantendo a fita paralela ao chão.
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-0.5">2. Cintura</strong>
                    Meça na linha natural da cintura (cerca de 2 dedos acima do umbigo), sem apertar a fita.
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-0.5">3. Quadril</strong>
                    Contorne a fita na área de maior circunferência dos glúteos e quadril.
                  </div>
                </div>
              </div>

              {/* Measurement Table */}
              <div className="overflow-x-auto rounded-md border border-[var(--color-brand-muted)]/20">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Tamanho</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Busto (cm)</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Cintura (cm)</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Quadril (cm)</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Compr. Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-brand-muted)]/15 bg-white">
                    {STANDARD_MEASUREMENTS.map((row) => (
                      <tr key={row.size} className="hover:bg-[var(--color-brand-canvas)] transition-colors">
                        <td className="px-4 py-3 font-bold text-[var(--color-brand-dark)]">{row.size}</td>
                        <td className="px-4 py-3 text-[var(--color-brand-muted)]">{row.bust}</td>
                        <td className="px-4 py-3 text-[var(--color-brand-muted)]">{row.waist}</td>
                        <td className="px-4 py-3 text-[var(--color-brand-muted)]">{row.hip}</td>
                        <td className="px-4 py-3 text-[var(--color-brand-muted)]">{row.length} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Consultation CTA */}
              <div className="p-4 bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] rounded-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold">Dúvida entre dois tamanhos?</h4>
                  <p className="text-xs text-[var(--color-brand-ivory)]/75 mt-0.5">
                    A Amanda faz consultoria de medidas personalizada direto pelo WhatsApp.
                  </p>
                </div>
                <a 
                  href="https://wa.me/5521978594358?text=Ol%C3%A1%2C%20gostaria%20de%20ajuda%20para%20escolher%20o%20tamanho%20ideal"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  Falar com a Amanda
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
