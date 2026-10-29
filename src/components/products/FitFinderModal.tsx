'use client'

import { useState, useMemo } from 'react'
import { X, Sparkles, Ruler, CheckCircle2, AlertCircle } from 'lucide-react'
import { SerializedVariant } from '@/lib/serializers'
import {
  getResolvedVariantMeasurements,
  getSavedFitProfile,
  saveFitProfile,
} from '@/lib/fit-meta'

interface FitFinderModalProps {
  isOpen: boolean
  onClose: () => void
  variants: SerializedVariant[]
  onSelectSize: (size: string) => void
}

const USUAL_SIZES = ['44', '46', '48', '50', '52', '54', '56']

const PRIORITY_AREAS = [
  { id: 'balanced', label: 'Proporcional', desc: 'Busto e quadril equilibrados' },
  { id: 'bust', label: 'Busto mais cheio', desc: 'Preciso de mais espaço no busto' },
  { id: 'waist', label: 'Cintura / Abdômen', desc: 'Não gosto que aperte na cintura' },
  { id: 'hip', label: 'Quadril e Coxas', desc: 'Quadril mais largo que os ombros' },
] as const

const FIT_PREFERENCES = [
  { id: 'snug', label: 'Mais Certinho', desc: 'Modelando bem as curvas' },
  { id: 'regular', label: 'Caimento Clássico', desc: 'Confortável na medida certa' },
  { id: 'loose', label: 'Mais Soltinho', desc: 'Com folga extra de movimento' },
] as const

export default function FitFinderModal({
  isOpen,
  onClose,
  variants,
  onSelectSize,
}: FitFinderModalProps) {
  const existingProfile = typeof window !== 'undefined' ? getSavedFitProfile() : null

  const [mode, setMode] = useState<'SMART' | 'TAPE'>('SMART')

  // Modo 1: Sem Fita Métrica (Rápido)
  const [usualSize, setUsualSize] = useState<string>(existingProfile?.usualSize || '')
  const [priorityArea, setPriorityArea] = useState<'balanced' | 'bust' | 'waist' | 'hip'>(
    existingProfile?.priorityArea || 'balanced'
  )
  const [preference, setPreference] = useState<'snug' | 'regular' | 'loose'>(
    existingProfile?.preference || 'regular'
  )

  // Modo 2: Com Fita Métrica (cm)
  const [bust, setBust] = useState<number | ''>('')
  const [waist, setWaist] = useState<number | ''>('')
  const [hip, setHip] = useState<number | ''>('')

  // Ordena tamanhos únicos disponíveis na peça
  const sortedUniqueVariants = useMemo(() => {
    const sorted = [...variants].sort((a, b) => {
      const numA = parseInt(a.size)
      const numB = parseInt(b.size)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return a.size.localeCompare(b.size)
    })
    return Array.from(new Map(sorted.map(v => [v.size, v])).values())
  }, [variants])

  // Recomendação Inteligente
  const recommendation = useMemo(() => {
    if (sortedUniqueVariants.length === 0) return null

    // Se a peça for Tamanho Único ('U')
    if (sortedUniqueVariants.length === 1 && sortedUniqueVariants[0].size.toUpperCase() === 'U') {
      return {
        variant: sortedUniqueVariants[0],
        bustNote: 'Modelagem adaptável (veste do 46 ao 52)',
        waistNote: 'Ajuste flexível e confortável',
        hipNote: 'Caimento fluido sem marcar',
      }
    }

    if (mode === 'SMART') {
      if (!usualSize) return null

      let targetNumeric = parseInt(usualSize, 10)
      if (isNaN(targetNumeric)) targetNumeric = 48

      // Ajuste inteligente baseado na preferência de caimento e área de atenção
      if (preference === 'loose') {
        targetNumeric += 2
      } else if (preference === 'snug' && priorityArea === 'balanced') {
        targetNumeric += 0
      } else if (priorityArea === 'bust' || priorityArea === 'waist' || priorityArea === 'hip') {
        // Se pede conforto extra em área específica e prefere soltinho, já subiu +2;
        // No caimento clássico mantemos a modelagem fiel da Use Azevedo.
      }

      // Mapeia caso a peça use grade G1/G2/G3 ou numérica 44-56
      const hasGGrade = sortedUniqueVariants.some(v => /^G[123]$/i.test(v.size))
      if (hasGGrade) {
        const gTarget = targetNumeric <= 48 ? 'G1' : targetNumeric <= 52 ? 'G2' : 'G3'
        const foundG =
          sortedUniqueVariants.find(v => v.size.toUpperCase() === gTarget) ||
          sortedUniqueVariants[sortedUniqueVariants.length - 1]
        return {
          variant: foundG,
          bustNote:
            priorityArea === 'bust'
              ? 'Sustentação confortável sem achatar o busto'
              : 'Caimento anatômico no busto',
          waistNote:
            priorityArea === 'waist'
              ? 'Acinturado com liberdade na região abdominal'
              : 'Recorte que valoriza a cintura sem apertar',
          hipNote:
            priorityArea === 'hip'
              ? 'Fluidez pensada para não marcar o quadril'
              : 'Acompanha as curvas com elegância',
        }
      }

      // Procura o tamanho numérico igual ou imediatamente superior disponível na peça
      let bestMatch = sortedUniqueVariants[0]
      for (const v of sortedUniqueVariants) {
        const vNum = parseInt(v.size, 10)
        if (!isNaN(vNum)) {
          bestMatch = v
          if (vNum >= targetNumeric) {
            break
          }
        }
      }

      return {
        variant: bestMatch,
        bustNote:
          priorityArea === 'bust'
            ? 'Acomodação confortável sem repuxar no busto'
            : 'Caimento equilibrado no colo e busto',
        waistNote:
          priorityArea === 'waist'
            ? 'Conforto extra na linha da cintura e abdômen'
            : 'Modelagem acinturada na medida certa',
        hipNote:
          priorityArea === 'hip'
            ? 'Caimento soltinho que não marca o quadril'
            : 'Liberdade de movimento ao caminhar e sentar',
      }
    } else {
      // Modo Fita Métrica (TAPE) — usa a tabela oficial Use Azevedo quando a variante não tem medida customizada
      if (!bust && !waist && !hip) return null

      let matched = sortedUniqueVariants[sortedUniqueVariants.length - 1]
      for (const v of sortedUniqueVariants) {
        const resolved = getResolvedVariantMeasurements(v)
        let fits = true
        // Margem de conforto de 2cm
        if (bust && resolved.bustMax < Number(bust) - 2) fits = false
        if (waist && resolved.waistMax < Number(waist) - 2) fits = false
        if (hip && resolved.hipMax < Number(hip) - 2) fits = false

        if (fits) {
          matched = v
          break
        }
      }

      const resolvedMatch = getResolvedVariantMeasurements(matched)
      return {
        variant: matched,
        bustNote: `Ideal para busto na faixa de ${resolvedMatch.bustLabel} cm`,
        waistNote: `Ideal para cintura na faixa de ${resolvedMatch.waistLabel} cm`,
        hipNote: `Ideal para quadril na faixa de ${resolvedMatch.hipLabel} cm`,
      }
    }
  }, [mode, usualSize, priorityArea, preference, bust, waist, hip, sortedUniqueVariants])

  if (!isOpen) return null

  const handleSelect = () => {
    if (recommendation) {
      saveFitProfile({
        recommendedSize: recommendation.variant.size,
        usualSize: usualSize || recommendation.variant.size,
        priorityArea,
        preference,
        updatedAt: Date.now(),
      })
      onSelectSize(recommendation.variant.size)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto relative rounded-md shadow-2xl border border-[var(--color-brand-muted)]/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--color-brand-green-deep)]/10 flex items-center justify-center rounded-full">
              <Sparkles className="w-4 h-4 text-[var(--color-brand-green-deep)]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif text-[var(--color-brand-dark)] leading-tight">
                Consultor de Caimento Use Azevedo
              </h2>
              <p className="text-[11px] text-[var(--color-brand-muted)]">
                Modelagem pensada para curvas reais do 44 ao 56+
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seletor de Modo: Sem Fita Métrica vs Com Fita Métrica */}
          <div className="grid grid-cols-2 gap-2 bg-[var(--color-brand-canvas)] p-1 rounded-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('SMART')}
              className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'SMART'
                  ? 'bg-[var(--color-brand-green-deep)] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sem Fita Métrica (Rápido)
            </button>
            <button
              type="button"
              onClick={() => setMode('TAPE')}
              className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'TAPE'
                  ? 'bg-[var(--color-brand-green-deep)] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              Tenho Fita Métrica (cm)
            </button>
          </div>

          {mode === 'SMART' ? (
            <div className="space-y-5">
              {/* Passo 1 */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-wider mb-2">
                  1. Qual numeração você costuma usar no dia a dia?
                </label>
                <div className="flex flex-wrap gap-2">
                  {USUAL_SIZES.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setUsualSize(sz)}
                      className={`w-12 h-11 rounded-sm font-bold text-sm border transition-all cursor-pointer ${
                        usualSize === sz
                          ? 'bg-[var(--color-brand-green-deep)] text-white border-[var(--color-brand-green-deep)] shadow-xs'
                          : 'bg-white text-[var(--color-brand-dark)] border-gray-300 hover:border-[var(--color-brand-green-deep)]'
                      }`}
                    >
                      {sz === '56' ? '56+' : sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passo 2 */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-wider mb-2">
                  2. Onde o seu corpo pede mais atenção no caimento?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIORITY_AREAS.map(area => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setPriorityArea(area.id)}
                      className={`p-2.5 text-left rounded-sm border transition-all cursor-pointer ${
                        priorityArea === area.id
                          ? 'border-[var(--color-brand-green-deep)] bg-green-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[var(--color-brand-dark)]">
                        {area.label}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">{area.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passo 3 */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-wider mb-2">
                  3. Como você prefere que a peça vista?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FIT_PREFERENCES.map(pref => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setPreference(pref.id)}
                      className={`p-2.5 text-center rounded-sm border transition-all cursor-pointer ${
                        preference === pref.id
                          ? 'border-[var(--color-brand-green-deep)] bg-green-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[var(--color-brand-dark)]">
                        {pref.label}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">{pref.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Informe suas medidas em centímetros (você pode preencher apenas as que souber):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Busto (cm)
                  </label>
                  <input
                    type="number"
                    value={bust}
                    onChange={e => setBust(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 114"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-sm focus:border-[var(--color-brand-green-deep)] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    value={waist}
                    onChange={e => setWaist(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 96"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-sm focus:border-[var(--color-brand-green-deep)] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Quadril (cm)
                  </label>
                  <input
                    type="number"
                    value={hip}
                    onChange={e => setHip(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 124"
                    className="w-full border border-gray-300 rounded-sm py-2 px-3 text-sm focus:border-[var(--color-brand-green-deep)] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resultado do Diagnóstico */}
          {recommendation ? (
            <div className="bg-[var(--color-brand-canvas)] border border-[var(--color-brand-green-deep)]/25 p-5 rounded-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)]">
                    Tamanho Ideal Recomendado
                  </span>
                </div>
                <span className="text-3xl font-serif font-bold text-[var(--color-brand-green-deep)]">
                  {recommendation.variant.size}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700 mb-5">
                <p>
                  <strong className="text-[var(--color-brand-dark)]">• No Busto:</strong>{' '}
                  {recommendation.bustNote}
                </p>
                <p>
                  <strong className="text-[var(--color-brand-dark)]">• Na Cintura:</strong>{' '}
                  {recommendation.waistNote}
                </p>
                <p>
                  <strong className="text-[var(--color-brand-dark)]">• No Quadril:</strong>{' '}
                  {recommendation.hipNote}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelect}
                className="w-full bg-[var(--color-brand-green-deep)] text-white font-bold py-3.5 px-4 text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-brand-dark)] transition-colors shadow-sm rounded-xs cursor-pointer"
              >
                Selecionar Tamanho {recommendation.variant.size} e Salvar no Meu Perfil
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                {mode === 'SMART'
                  ? 'Selecione acima a numeração que você costuma usar no dia a dia para ver o diagnóstico de caimento.'
                  : 'Preencha pelo menos uma medida em centímetros acima para calcularmos seu tamanho.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
