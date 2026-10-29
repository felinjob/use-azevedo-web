import { SerializedVariant } from './serializers'

export interface SizeMeasurementRange {
  size: string
  bustMin: number
  bustMax: number
  waistMin: number
  waistMax: number
  hipMin: number
  hipMax: number
  lengthCm: number
  bustLabel: string
  waistLabel: string
  hipLabel: string
}

/**
 * Tabela oficial de medidas da Use Azevedo (do 44 ao 56+ e G1 ao G3).
 * Usada como referência quando a peça não possui medidas individuais cadastradas por variante.
 */
export const OFFICIAL_SIZE_CHART: Record<string, SizeMeasurementRange> = {
  '44': {
    size: '44',
    bustMin: 102,
    bustMax: 108,
    waistMin: 84,
    waistMax: 90,
    hipMin: 110,
    hipMax: 116,
    lengthCm: 105,
    bustLabel: '102 – 108',
    waistLabel: '84 – 90',
    hipLabel: '110 – 116',
  },
  '46': {
    size: '46',
    bustMin: 108,
    bustMax: 113,
    waistMin: 90,
    waistMax: 95,
    hipMin: 116,
    hipMax: 121,
    lengthCm: 106,
    bustLabel: '108 – 113',
    waistLabel: '90 – 95',
    hipLabel: '116 – 121',
  },
  '48': {
    size: '48',
    bustMin: 113,
    bustMax: 119,
    waistMin: 95,
    waistMax: 101,
    hipMin: 121,
    hipMax: 127,
    lengthCm: 107,
    bustLabel: '113 – 119',
    waistLabel: '95 – 101',
    hipLabel: '121 – 127',
  },
  '50': {
    size: '50',
    bustMin: 119,
    bustMax: 125,
    waistMin: 101,
    waistMax: 107,
    hipMin: 127,
    hipMax: 133,
    lengthCm: 108,
    bustLabel: '119 – 125',
    waistLabel: '101 – 107',
    hipLabel: '127 – 133',
  },
  '52': {
    size: '52',
    bustMin: 125,
    bustMax: 131,
    waistMin: 107,
    waistMax: 113,
    hipMin: 133,
    hipMax: 139,
    lengthCm: 109,
    bustLabel: '125 – 131',
    waistLabel: '107 – 113',
    hipLabel: '133 – 139',
  },
  '54': {
    size: '54',
    bustMin: 131,
    bustMax: 137,
    waistMin: 113,
    waistMax: 119,
    hipMin: 139,
    hipMax: 145,
    lengthCm: 110,
    bustLabel: '131 – 137',
    waistLabel: '113 – 119',
    hipLabel: '139 – 145',
  },
  '56': {
    size: '56',
    bustMin: 137,
    bustMax: 144,
    waistMin: 119,
    waistMax: 126,
    hipMin: 145,
    hipMax: 152,
    lengthCm: 110,
    bustLabel: '137 – 144',
    waistLabel: '119 – 126',
    hipLabel: '145 – 152',
  },
  '56+': {
    size: '56+',
    bustMin: 137,
    bustMax: 146,
    waistMin: 119,
    waistMax: 128,
    hipMin: 145,
    hipMax: 154,
    lengthCm: 111,
    bustLabel: '137 – 146',
    waistLabel: '119 – 128',
    hipLabel: '145 – 154',
  },
  G1: {
    size: 'G1',
    bustMin: 108,
    bustMax: 116,
    waistMin: 90,
    waistMax: 98,
    hipMin: 116,
    hipMax: 124,
    lengthCm: 107,
    bustLabel: '108 – 116 (46/48)',
    waistLabel: '90 – 98',
    hipLabel: '116 – 124',
  },
  G2: {
    size: 'G2',
    bustMin: 117,
    bustMax: 126,
    waistMin: 99,
    waistMax: 108,
    hipMin: 125,
    hipMax: 134,
    lengthCm: 108,
    bustLabel: '117 – 126 (50/52)',
    waistLabel: '99 – 108',
    hipLabel: '125 – 134',
  },
  G3: {
    size: 'G3',
    bustMin: 127,
    bustMax: 140,
    waistMin: 109,
    waistMax: 122,
    hipMin: 135,
    hipMax: 148,
    lengthCm: 110,
    bustLabel: '127 – 140 (54/56)',
    waistLabel: '109 – 122',
    hipLabel: '135 – 148',
  },
  U: {
    size: 'U',
    bustMin: 106,
    bustMax: 132,
    waistMin: 88,
    waistMax: 114,
    hipMin: 114,
    hipMax: 140,
    lengthCm: 108,
    bustLabel: '106 – 132 (Veste 46 ao 52)',
    waistLabel: '88 – 114',
    hipLabel: '114 – 140',
  },
}

export function getResolvedVariantMeasurements(variant: SerializedVariant) {
  const std = OFFICIAL_SIZE_CHART[variant.size.toUpperCase()] || OFFICIAL_SIZE_CHART[variant.size]
  return {
    size: variant.size,
    bustLabel: variant.bustCm ? `${Number(variant.bustCm)} cm` : std?.bustLabel || 'Sob consulta',
    waistLabel: variant.waistCm ? `${Number(variant.waistCm)} cm` : std?.waistLabel || 'Sob consulta',
    hipLabel: variant.hipCm ? `${Number(variant.hipCm)} cm` : std?.hipLabel || 'Sob consulta',
    lengthLabel: variant.lengthCm
      ? `${Number(variant.lengthCm)} cm`
      : std?.lengthCm
        ? `${std.lengthCm} cm`
        : 'Padrão',
    bustMax: variant.bustCm ? Number(variant.bustCm) : std?.bustMax || 120,
    waistMax: variant.waistCm ? Number(variant.waistCm) : std?.waistMax || 102,
    hipMax: variant.hipCm ? Number(variant.hipCm) : std?.hipMax || 128,
  }
}

/**
 * Metadados opcionais de comportamento e caimento da peça.
 * Só são exibidos na loja quando a administradora os seleciona explicitamente no painel.
 */
export interface ProductFitMeta {
  stretch?: 'none' | 'moderate' | 'high' | ''
  fitStyle?: 'structured' | 'tailored' | 'fluid' | ''
  highlights?: string[]
}

export const STRETCH_OPTIONS = [
  { value: '', label: 'Não informar (Oculto na loja)' },
  { value: 'none', label: 'Sem Elastano (Tecido Plano Estruturado)' },
  { value: 'moderate', label: 'Elasticidade Leve / Confortável' },
  { value: 'high', label: 'Com Elastano (Alta Elasticidade)' },
] as const

export const FIT_STYLE_OPTIONS = [
  { value: '', label: 'Não informar (Oculto na loja)' },
  { value: 'structured', label: 'Modelagem Mais Ajustada ao Corpo' },
  { value: 'tailored', label: 'Acinturada com Quadril Soltinho' },
  { value: 'fluid', label: 'Modelagem Fluida / Soltinha (Não marca)' },
] as const

export const COMFORT_HIGHLIGHT_PRESETS = [
  'Permite usar com sutiã tradicional',
  'Zero transparência (Tecido encorpado / Forrado)',
  'Elástico estratégico nas costas para ajuste perfeito',
  'Não marca o quadril nem o abdômen',
  'Alças com regulagem',
  'Não amassa com facilidade',
] as const

const FIT_META_DELIMITER = '\n<!--UA_FIT_META:'
const FIT_META_END = '-->'

export function parseFabricAndFitMeta(rawFabricDetails: string | null | undefined): {
  fabricText: string
  fitMeta: ProductFitMeta
  hasAnyFitMeta: boolean
} {
  if (!rawFabricDetails) {
    return { fabricText: '', fitMeta: {}, hasAnyFitMeta: false }
  }

  const startIndex = rawFabricDetails.indexOf(FIT_META_DELIMITER)
  if (startIndex === -1) {
    return {
      fabricText: rawFabricDetails.trim(),
      fitMeta: {},
      hasAnyFitMeta: false,
    }
  }

  const fabricText = rawFabricDetails.slice(0, startIndex).trim()
  const jsonStart = startIndex + FIT_META_DELIMITER.length
  const endIndex = rawFabricDetails.indexOf(FIT_META_END, jsonStart)
  const jsonStr =
    endIndex !== -1
      ? rawFabricDetails.slice(jsonStart, endIndex)
      : rawFabricDetails.slice(jsonStart)

  try {
    const parsed = JSON.parse(jsonStr) as ProductFitMeta
    const cleanHighlights = Array.isArray(parsed.highlights)
      ? parsed.highlights.filter(Boolean)
      : []
    const fitMeta: ProductFitMeta = {
      stretch: parsed.stretch || '',
      fitStyle: parsed.fitStyle || '',
      highlights: cleanHighlights,
    }
    const hasAnyFitMeta = Boolean(
      fitMeta.stretch || fitMeta.fitStyle || cleanHighlights.length > 0
    )
    return { fabricText, fitMeta, hasAnyFitMeta }
  } catch {
    return { fabricText: rawFabricDetails.trim(), fitMeta: {}, hasAnyFitMeta: false }
  }
}

export function serializeFabricAndFitMeta(
  fabricText: string,
  fitMeta: ProductFitMeta
): string {
  const cleanText = (fabricText || '').trim()
  const cleanHighlights = (fitMeta.highlights || []).filter(Boolean)
  const hasMeta = Boolean(
    fitMeta.stretch || fitMeta.fitStyle || cleanHighlights.length > 0
  )

  if (!hasMeta) {
    return cleanText
  }

  const payload: ProductFitMeta = {
    ...(fitMeta.stretch ? { stretch: fitMeta.stretch } : {}),
    ...(fitMeta.fitStyle ? { fitStyle: fitMeta.fitStyle } : {}),
    ...(cleanHighlights.length > 0 ? { highlights: cleanHighlights } : {}),
  }

  return `${cleanText}${FIT_META_DELIMITER}${JSON.stringify(payload)}${FIT_META_END}`
}

const PROFILE_STORAGE_KEY = 'use-azevedo-fit-profile'

export interface SavedFitProfile {
  recommendedSize: string
  usualSize?: string
  priorityArea?: 'bust' | 'waist' | 'hip' | 'balanced'
  preference?: 'snug' | 'regular' | 'loose'
  updatedAt: number
}

export function getSavedFitProfile(): SavedFitProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedFitProfile
    if (!parsed?.recommendedSize) return null
    return parsed
  } catch {
    return null
  }
}

export function saveFitProfile(profile: SavedFitProfile): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new CustomEvent('ua-fit-profile-updated', { detail: profile }))
  } catch {
    // ignore storage errors
  }
}

export function clearFitProfile(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('ua-fit-profile-updated', { detail: null }))
  } catch {
    // ignore
  }
}

export function subscribeToFitProfile(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener('ua-fit-profile-updated', handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener('ua-fit-profile-updated', handler)
  }
}

export function getSavedFitSizeSnapshot(): string | null {
  const profile = getSavedFitProfile()
  return profile?.recommendedSize || null
}

export function getServerFitSizeSnapshot(): string | null {
  return null
}


