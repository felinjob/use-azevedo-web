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
export const AVAILABLE_SIZES = ['44', '46', '48', '50', '52', '54', '56', 'G1', 'G2', 'G3'] as const

/** Contato oficial da marca. */
export const BRAND_CONTACT = {
  whatsappRaw: '5521978594358',
  whatsappDisplay: '(21) 97859-4358',
  email: 'useazevedoo@gmail.com',
  instagramUrl: 'https://instagram.com/useazevedo',
  instagramHandle: '@useazevedo',
  location: 'Rio de Janeiro - RJ',
  cnpj: '63.157.524/0001-00',
} as const

/** Paleta de cores sugeridas para agilizar o cadastro no painel Admin. */
export const BRAND_COLOR_PRESETS = [
  { name: 'Preto', hex: '#141414' },
  { name: 'Off-White', hex: '#F4F0E8' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Verde Esmeralda', hex: '#0B3B24' },
  { name: 'Verde Militar', hex: '#3B4D3B' },
  { name: 'Areia / Nude', hex: '#D8C8B8' },
  { name: 'Terracota', hex: '#B85D3B' },
  { name: 'Chocolate / Marrom', hex: '#4A2C2A' },
  { name: 'Vinho / Bordô', hex: '#5E1924' },
  { name: 'Vermelho', hex: '#B22222' },
  { name: 'Azul Marinho', hex: '#1B2A4A' },
  { name: 'Azul Serenity', hex: '#8DA9C4' },
  { name: 'Rosa Antigo', hex: '#C98CA7' },
  { name: 'Fúcsia', hex: '#C72C6C' },
  { name: 'Amarelo Manteiga', hex: '#F3E5AB' },
  { name: 'Cinza Mescla', hex: '#8E9196' },
] as const

