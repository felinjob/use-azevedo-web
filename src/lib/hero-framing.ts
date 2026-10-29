export interface HeroFramingConfig {
  /** Horizontal focal point percentage (0 = left, 50 = center, 100 = right) */
  x: number
  /** Vertical focal point percentage (0 = top, 50 = center, 100 = bottom) */
  y: number
  /** Zoom percentage (70 to 180, default 100) */
  zoom: number
  /** How the image fits inside the Hero frame */
  fit: 'cover' | 'contain'
  /** Dark overlay opacity percentage (0 to 70) */
  overlay: number
  /** Whether to show the CTA button ("Explorar Coleção") */
  showButton: boolean
}

export const DEFAULT_HERO_FRAMING: HeroFramingConfig = {
  x: 50,
  y: 30,
  zoom: 100,
  fit: 'cover',
  overlay: 35,
  showButton: true,
}

const HASH_PREFIX = '#ua-frame='

/**
 * Extracts the clean image URL (for Next.js <Image />) and the framing configuration
 * stored in the URL hash fragment.
 */
export function parseHeroImage(
  rawImageUrl: string,
  hasTextContent: boolean = true
): { cleanUrl: string; framing: HeroFramingConfig } {
  if (!rawImageUrl) {
    return { cleanUrl: '', framing: { ...DEFAULT_HERO_FRAMING } }
  }

  const hashIndex = rawImageUrl.indexOf(HASH_PREFIX)
  if (hashIndex === -1) {
    return {
      cleanUrl: rawImageUrl,
      framing: {
        ...DEFAULT_HERO_FRAMING,
        overlay: hasTextContent ? 35 : 0,
        showButton: hasTextContent,
      },
    }
  }

  const cleanUrl = rawImageUrl.slice(0, hashIndex)
  const hashString = rawImageUrl.slice(hashIndex + HASH_PREFIX.length)
  const params = new URLSearchParams(hashString)

  const x = clampNumber(params.get('x'), 0, 100, DEFAULT_HERO_FRAMING.x)
  const y = clampNumber(params.get('y'), 0, 100, DEFAULT_HERO_FRAMING.y)
  const zoom = clampNumber(params.get('zoom'), 60, 200, DEFAULT_HERO_FRAMING.zoom)
  const fit = params.get('fit') === 'contain' ? 'contain' : 'cover'
  const overlay = clampNumber(
    params.get('overlay'),
    0,
    75,
    hasTextContent ? 35 : 0
  )
  const btnParam = params.get('btn')
  const showButton = btnParam !== null ? btnParam === '1' : hasTextContent

  return {
    cleanUrl,
    framing: {
      x,
      y,
      zoom,
      fit,
      overlay,
      showButton,
    },
  }
}

/**
 * Combines a clean image URL and framing config into a single string stored in `imageUrl`.
 */
export function buildHeroImageUrl(
  rawImageUrl: string,
  framing: HeroFramingConfig
): string {
  const { cleanUrl } = parseHeroImage(rawImageUrl)
  if (!cleanUrl.trim()) return ''

  const params = new URLSearchParams()
  params.set('x', Math.round(framing.x).toString())
  params.set('y', Math.round(framing.y).toString())
  params.set('zoom', Math.round(framing.zoom).toString())
  params.set('fit', framing.fit)
  params.set('overlay', Math.round(framing.overlay).toString())
  params.set('btn', framing.showButton ? '1' : '0')

  return `${cleanUrl.trim()}${HASH_PREFIX}${params.toString()}`
}

function clampNumber(
  raw: string | null,
  min: number,
  max: number,
  fallback: number
): number {
  if (raw === null || raw.trim() === '') return fallback
  const num = Number(raw)
  if (Number.isNaN(num)) return fallback
  return Math.min(max, Math.max(min, num))
}

