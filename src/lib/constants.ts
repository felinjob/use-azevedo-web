/**
 * Constantes globais da aplicação Use Azevedo.
 * Centraliza valores reutilizados por múltiplos módulos.
 */

/** Número de produtos exibidos por página no catálogo. */
export const PAGE_SIZE = 24

/** Número máximo de tentativas de retry no upload de imagens. */
export const MAX_UPLOAD_RETRIES = 3

/** Limites de frete grátis por método de pagamento. */
export const FREE_SHIPPING_THRESHOLDS = {
  PIX: 199,
  CREDIT_CARD: 299,
} as const

/** Número de parcelas exibidas na vitrine. */
export const INSTALLMENT_COUNT = 12

/** Tamanhos disponíveis para filtro rápido na Home. */
export const AVAILABLE_SIZES = ['44', '46', '48', '50', '52', '54', '56'] as const
