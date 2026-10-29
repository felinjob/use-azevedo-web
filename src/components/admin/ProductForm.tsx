'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AvailabilityType } from '@prisma/client'
import ImageUploader from './ImageUploader'
import { createProduct, updateProduct } from '@/app/actions/manage-products'
import { BRAND_COLOR_PRESETS } from '@/lib/constants'
import {
  parseFabricAndFitMeta,
  serializeFabricAndFitMeta,
  ProductFitMeta,
  STRETCH_OPTIONS,
  FIT_STYLE_OPTIONS,
  COMFORT_HIGHLIGHT_PRESETS,
} from '@/lib/fit-meta'
import { Plus, Trash2, Sparkles, Check, AlertCircle, Layers } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export interface VariantFormState {
  id?: string
  colorLocalId?: string
  size: string
  color: string
  colorHex: string
  sku: string
  stockQuantity: number
  bustCm: number | null
  waistCm: number | null
  hipCm: number | null
  lengthCm: number | null
}

export interface ProductFormState {
  id?: string
  name: string
  slug: string
  categoryId: string
  price: number
  originalPrice: number | null
  description: string
  availability: AvailabilityType
  productionTimeDays: number
  fabricDetails: string
  featured: boolean
  active: boolean
  images: string[]
  variants: VariantFormState[]
}

interface ProductFormProps {
  categories: Category[]
  initialData?: ProductFormState
}

const ALL_AVAILABLE_SIZES = ['44', '46', '48', '50', '52', '54', '56', 'G1', 'G2', 'G3', 'P', 'M', 'G', 'GG', 'Tamanho Único']
const NUMERIC_PLUS_SIZES = ['44', '46', '48', '50', '52', '54', '56']
const G_PLUS_SIZES = ['G1', 'G2', 'G3']

let localIdSeed = 0
function generateLocalId() {
  localIdSeed += 1
  return `color-${Date.now()}-${localIdSeed}-${Math.random().toString(36).substring(2, 6)}`
}

function generateSkuHash() {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}

function buildSku(slug: string, colorName: string, size: string) {
  const colorSlug = (colorName || 'COR')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .substring(0, 3)
    .toUpperCase() || 'COR'
  const slugPrefix = (slug || 'NEW').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5) || 'NEW'
  return `UA-${slugPrefix}-${colorSlug}-${size}-${generateSkuHash()}`
}

interface ColorBlock {
  localId: string
  name: string
  hex: string
}

function initializeColorAndVariantState(initialData?: ProductFormState): {
  colors: ColorBlock[]
  variants: VariantFormState[]
} {
  if (initialData && initialData.variants.length > 0) {
    const colorBlocks: ColorBlock[] = []
    const colorKeyToBlock = new Map<string, ColorBlock>()
    const hydratedVariants: VariantFormState[] = []

    for (const v of initialData.variants) {
      const cleanName = (v.color || '').trim()
      if (!cleanName) continue
      const key = cleanName.toLowerCase()
      let block = colorKeyToBlock.get(key)
      if (!block) {
        block = {
          localId: generateLocalId(),
          name: cleanName,
          hex: (v.colorHex || '#141414').trim(),
        }
        colorKeyToBlock.set(key, block)
        colorBlocks.push(block)
      }
      hydratedVariants.push({
        ...v,
        colorLocalId: block.localId,
        color: block.name,
        colorHex: block.hex,
      })
    }

    if (colorBlocks.length > 0) {
      return { colors: colorBlocks, variants: hydratedVariants }
    }
  }

  const defaultBlock: ColorBlock = {
    localId: generateLocalId(),
    name: 'Preto',
    hex: '#141414',
  }
  return { colors: [defaultBlock], variants: [] }
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [initialMapped] = useState(() => initializeColorAndVariantState(initialData))
  const [initialFabricParsed] = useState(() => parseFabricAndFitMeta(initialData?.fabricDetails))

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [queueStatus, setQueueStatus] = useState({
    isPending: false,
    completed: 0,
    total: 0,
    urls: [] as string[],
  })

  const [fitMeta, setFitMeta] = useState<ProductFitMeta>(() => ({
    stretch: initialFabricParsed.fitMeta.stretch || '',
    fitStyle: initialFabricParsed.fitMeta.fitStyle || '',
    highlights: initialFabricParsed.fitMeta.highlights || [],
  }))

  const [formData, setFormData] = useState<ProductFormState>(() => ({
    id: initialData?.id,
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    price: initialData?.price ?? 0,
    originalPrice: initialData?.originalPrice ?? null,
    description: initialData?.description || '',
    availability: initialData?.availability || 'READY_TO_SHIP',
    productionTimeDays: initialData?.productionTimeDays ?? 7,
    fabricDetails: initialFabricParsed.fabricText || '',
    featured: initialData?.featured ?? false,
    active: initialData?.active ?? true,
    images: initialData?.images || [],
    variants: initialMapped.variants,
  }))

  const [colors, setColors] = useState<ColorBlock[]>(initialMapped.colors)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

      let suggestedCategoryId = formData.categoryId
      const lowerName = name.toLowerCase()
      if (!suggestedCategoryId || categories[0]?.id === suggestedCategoryId) {
        if (lowerName.includes('vestido')) {
          suggestedCategoryId = categories.find(c => c.name.toLowerCase().includes('vestido'))?.id || suggestedCategoryId
        } else if (lowerName.includes('cropped') || lowerName.includes('blusa')) {
          suggestedCategoryId = categories.find(c => c.name.toLowerCase().includes('cropped'))?.id || suggestedCategoryId
        } else if (lowerName.includes('conjunto') || lowerName.includes('macaquinho')) {
          suggestedCategoryId = categories.find(c => c.name.toLowerCase().includes('conjunto'))?.id || suggestedCategoryId
        } else if (lowerName.includes('saia') || lowerName.includes('short') || lowerName.includes('calça') || lowerName.includes('calca')) {
          suggestedCategoryId = categories.find(c => c.name.toLowerCase().includes('saia'))?.id || suggestedCategoryId
        }
      }

      setFormData(prev => ({ ...prev, name, slug, categoryId: suggestedCategoryId }))
    } else {
      setFormData(prev => ({ ...prev, name }))
    }
  }

  const addColor = (preset?: { name: string; hex: string }) => {
    const newLocalId = generateLocalId()
    let chosenName = preset?.name || 'Nova Cor'
    const chosenHex = preset?.hex || '#0B3B24'

    // Evita nomes idênticos ao adicionar múltiplas cores
    const existingNames = new Set(colors.map(c => c.name.trim().toLowerCase()))
    if (existingNames.has(chosenName.toLowerCase())) {
      let counter = 2
      while (existingNames.has(`${chosenName.toLowerCase()} ${counter}`)) {
        counter += 1
      }
      chosenName = `${chosenName} ${counter}`
    }

    setColors(prev => [...prev, { localId: newLocalId, name: chosenName, hex: chosenHex }])
  }

  const removeColor = (localId: string) => {
    const colorToRemove = colors.find(c => c.localId === localId)
    if (!colorToRemove) return

    const variantsOfColor = formData.variants.filter(v => v.colorLocalId === localId)
    if (variantsOfColor.length > 0) {
      const confirmed = window.confirm(
        `Remover a cor "${colorToRemove.name || 'Sem nome'}" e seus ${variantsOfColor.length} tamanho(s) vinculados?`
      )
      if (!confirmed) return
    }

    if (colors.length <= 1) {
      // Se for a única cor, limpa os tamanhos e reseta para que a usuária escolha outra cor livremente
      const freshId = generateLocalId()
      setColors([{ localId: freshId, name: 'Preto', hex: '#141414' }])
      setFormData(prev => ({ ...prev, variants: [] }))
      return
    }

    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.colorLocalId !== localId),
    }))
    setColors(prev => prev.filter(c => c.localId !== localId))
  }

  const updateColorInfo = (localId: string, field: 'name' | 'hex', value: string) => {
    setColors(prev =>
      prev.map(c => (c.localId === localId ? { ...c, [field]: value } : c))
    )

    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.colorLocalId === localId) {
          return field === 'name'
            ? { ...v, color: value }
            : { ...v, colorHex: value }
        }
        return v
      }),
    }))
  }

  const applyPresetToColorBlock = (localId: string, presetName: string, presetHex: string) => {
    setColors(prev =>
      prev.map(c => (c.localId === localId ? { ...c, name: presetName, hex: presetHex } : c))
    )
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.colorLocalId === localId ? { ...v, color: presetName, colorHex: presetHex } : v
      ),
    }))
  }

  const toggleSizeForColor = (colorBlock: ColorBlock, size: string) => {
    const existingIndex = formData.variants.findIndex(
      v => v.colorLocalId === colorBlock.localId && v.size === size
    )

    if (existingIndex >= 0) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, idx) => idx !== existingIndex),
      }))
    } else {
      const sku = buildSku(formData.slug, colorBlock.name, size)
      const defaultStock = formData.availability === 'READY_TO_SHIP' ? 2 : 10

      setFormData(prev => ({
        ...prev,
        variants: [
          ...prev.variants,
          {
            colorLocalId: colorBlock.localId,
            size,
            color: colorBlock.name,
            colorHex: colorBlock.hex,
            sku,
            stockQuantity: defaultStock,
            bustCm: null,
            waistCm: null,
            hipCm: null,
            lengthCm: null,
          },
        ],
      }))
    }
  }

  const selectSizeGroupForColor = (colorBlock: ColorBlock, sizeList: string[]) => {
    setFormData(prev => {
      const existingSizes = new Set(
        prev.variants
          .filter(v => v.colorLocalId === colorBlock.localId)
          .map(v => v.size)
      )
      const defaultStock = prev.availability === 'READY_TO_SHIP' ? 2 : 10
      const additions: VariantFormState[] = []

      for (const size of sizeList) {
        if (!existingSizes.has(size)) {
          additions.push({
            colorLocalId: colorBlock.localId,
            size,
            color: colorBlock.name,
            colorHex: colorBlock.hex,
            sku: buildSku(prev.slug, colorBlock.name, size),
            stockQuantity: defaultStock,
            bustCm: null,
            waistCm: null,
            hipCm: null,
            lengthCm: null,
          })
        }
      }

      return {
        ...prev,
        variants: [...prev.variants, ...additions],
      }
    })
  }

  const setBatchStockForColor = (localId: string, stock: number) => {
    const cleanStock = Math.max(0, stock)
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.colorLocalId === localId ? { ...v, stockQuantity: cleanStock } : v
      ),
    }))
  }

  const handleVariantChange = (
    colorLocalId: string,
    size: string,
    field: keyof VariantFormState,
    value: string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.colorLocalId === colorLocalId && v.size === size) {
          return { ...v, [field]: value }
        }
        return v
      }),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (queueStatus.isPending) return
    setIsSaving(true)
    setError('')

    try {
      const allRawImages = [...formData.images, ...queueStatus.urls]
      const validImages = allRawImages.filter(img => {
        return Boolean(
          img &&
          typeof img === 'string' &&
          img.trim().length > 0 &&
          !img.includes('undefined') &&
          !img.includes('null')
        )
      })

      if (validImages.length === 0) {
        throw new Error('Adicione pelo menos uma foto da peça antes de salvar.')
      }

      if (!formData.categoryId) {
        throw new Error('Selecione uma categoria para a peça.')
      }

      // Validar blocos de cor
      const seenColorNames = new Set<string>()
      for (const c of colors) {
        const cleanColorName = c.name.trim()
        if (!cleanColorName) {
          throw new Error('Todas as cores adicionadas precisam ter um nome (ex: Preto, Verde Esmeralda).')
        }
        const lower = cleanColorName.toLowerCase()
        if (seenColorNames.has(lower)) {
          throw new Error(`A cor "${cleanColorName}" está duplicada. Mantenha apenas um bloco para cada cor.`)
        }
        seenColorNames.add(lower)

        const sizesForThisColor = formData.variants.filter(v => v.colorLocalId === c.localId)
        if (sizesForThisColor.length === 0) {
          throw new Error(
            `A cor "${cleanColorName}" não tem nenhum tamanho selecionado. Clique nos tamanhos disponíveis (ex: 44, 46, 48...) ou remova essa cor.`
          )
        }
      }

      // Sincroniza o nome e hex de cada variante diretamente a partir do seu ColorBlock (fonte da verdade)
      const colorById = new Map(colors.map(c => [c.localId, c]))
      const syncedVariants: VariantFormState[] = formData.variants
        .filter(v => v.colorLocalId && colorById.has(v.colorLocalId))
        .map(v => {
          const block = colorById.get(v.colorLocalId!)!
          return {
            ...v,
            color: block.name.trim(),
            colorHex: block.hex.trim() || '#141414',
          }
        })

      if (syncedVariants.length === 0) {
        throw new Error('É necessário adicionar pelo menos uma cor e selecionar seus tamanhos.')
      }

      const payload: ProductFormState = {
        ...formData,
        fabricDetails: serializeFabricAndFitMeta(formData.fabricDetails, fitMeta),
        images: validImages,
        variants: syncedVariants,
      }

      const res = isEditing
        ? await updateProduct(payload.id!, payload)
        : await createProduct(payload)

      if (!res.success) {
        throw new Error(res.error)
      }

      router.push('/admin/produtos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o produto.')
      setIsSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded-md flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* BLOCO 1: DADOS GERAIS */}
      <div className="bg-white p-6 border border-gray-200 rounded-md space-y-6 shadow-2xs">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">
          1. Identificação & Preço
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Nome da Peça *
            </label>
            <input
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Ex: Vestido Midi Alfaiataria Esmeralda"
              className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Slug / Link da Página *
            </label>
            <input
              required
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="vestido-midi-alfaiataria-esmeralda"
              className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none bg-gray-50 rounded-sm font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Categoria *
            </label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map(c => {
                const isSelected = formData.categoryId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryId: c.id })}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--color-brand-green-deep)] text-white border-[var(--color-brand-green-deep)] shadow-xs'
                        : 'bg-white text-[var(--color-brand-dark)] border-gray-200 hover:border-[var(--color-brand-green-deep)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={Number.isNaN(formData.price) ? '' : formData.price}
                onChange={e =>
                  setFormData({
                    ...formData,
                    price: e.target.value === '' ? 0 : parseFloat(e.target.value),
                  })
                }
                className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Preço Antigo / &ldquo;De&rdquo; (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice ?? ''}
                placeholder="Ex: 349.90"
                onChange={e =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
            Descrição da Peça *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Descreva o caimento, ocasiões de uso, detalhes de modelagem (ex: pences estratégicas, elástico nas costas, forro duplo)..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
          />
        </div>
      </div>

      {/* BLOCO 2: LOGÍSTICA E TECIDO */}
      <div className="bg-white p-6 border border-gray-200 rounded-md space-y-6 shadow-2xs">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">
          2. Disponibilidade & Composição
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
              Modalidade de Venda
            </label>
            <select
              value={formData.availability}
              onChange={e =>
                setFormData({ ...formData, availability: e.target.value as AvailabilityType })
              }
              className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm bg-white"
            >
              <option value="READY_TO_SHIP">Pronta Entrega (Envio em até 24h úteis)</option>
              <option value="MADE_TO_ORDER">Sob Encomenda (Produção sob demanda)</option>
            </select>
          </div>

          {formData.availability === 'MADE_TO_ORDER' && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                Prazo de Confecção (Dias Úteis)
              </label>
              <input
                type="number"
                min="1"
                required
                value={Number.isNaN(formData.productionTimeDays) ? '' : formData.productionTimeDays}
                onChange={e =>
                  setFormData({
                    ...formData,
                    productionTimeDays: e.target.value === '' ? 7 : parseInt(e.target.value, 10),
                  })
                }
                className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
            Tecido & Toque Sensorial (Opcional)
          </label>
          <input
            placeholder="Ex: Viscolinho pré-lavado ou Alfaiataria encorpada. (Se deixar em branco, não aparece na loja)"
            value={formData.fabricDetails}
            onChange={e => setFormData({ ...formData, fabricDetails: e.target.value })}
            className="w-full text-sm border-gray-300 border p-2.5 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Se você não preencher este campo, o quadro de composição ficará oculto na página do produto.
          </p>
        </div>

        {/* RAIO-X DO CAIMENTO (100% OPCIONAL) */}
        <div className="bg-[var(--color-brand-canvas)] p-4 rounded-sm border border-[var(--color-brand-muted)]/20 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
              Detalhes de Caimento na Loja (Opcional — Só aparece o que você marcar)
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Se você não selecionar nada abaixo, nenhuma informação extra de elasticidade ou modelagem será mostrada na loja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Elasticidade do Tecido (Opcional)
              </label>
              <select
                value={fitMeta.stretch || ''}
                onChange={e =>
                  setFitMeta(prev => ({
                    ...prev,
                    stretch: e.target.value as ProductFitMeta['stretch'],
                  }))
                }
                className="w-full text-xs sm:text-sm border border-gray-300 bg-white p-2 rounded-sm focus:border-[var(--color-brand-green-deep)] outline-none"
              >
                {STRETCH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Comportamento da Modelagem (Opcional)
              </label>
              <select
                value={fitMeta.fitStyle || ''}
                onChange={e =>
                  setFitMeta(prev => ({
                    ...prev,
                    fitStyle: e.target.value as ProductFitMeta['fitStyle'],
                  }))
                }
                className="w-full text-xs sm:text-sm border border-gray-300 bg-white p-2 rounded-sm focus:border-[var(--color-brand-green-deep)] outline-none"
              >
                {FIT_STYLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">
              Selos de Conforto desta Peça (Clique apenas nos que se aplicam)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMFORT_HIGHLIGHT_PRESETS.map(tag => {
                const isSelected = (fitMeta.highlights || []).includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setFitMeta(prev => {
                        const current = prev.highlights || []
                        const next = current.includes(tag)
                          ? current.filter(t => t !== tag)
                          : [...current, tag]
                        return { ...prev, highlights: next }
                      })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-brand-green-deep)] text-white border-[var(--color-brand-green-deep)] shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--color-brand-green-deep)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-[var(--color-brand-green-deep)] w-4 h-4"
            />
            Exibir em &ldquo;Destaques da Coleção&rdquo; na Home
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
              className="accent-[var(--color-brand-green-deep)] w-4 h-4"
            />
            Peça Ativa (Visível na Loja)
          </label>
        </div>
      </div>

      {/* BLOCO 3: IMAGENS */}
      <div className="bg-white p-6 border border-gray-200 rounded-md space-y-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-lg font-serif text-[var(--color-brand-dark)]">3. Galeria de Fotos</h2>
          <span className="text-xs text-gray-500">{formData.images.length} foto(s) na galeria</span>
        </div>
        <ImageUploader
          images={formData.images}
          onChange={images => setFormData(prev => ({ ...prev, images }))}
          onQueueStatusChange={(isPending, completed, total, urls) => {
            setQueueStatus({ isPending, completed, total, urls })
          }}
        />
      </div>

      {/* BLOCO 4: MATRIZ DE CORES E TAMANHOS */}
      <div className="bg-white p-6 border border-gray-200 rounded-md space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-serif text-[var(--color-brand-dark)]">
              4. Cores (Bolinhas) & Grade de Tamanhos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Adicione as cores da peça e clique nos tamanhos disponíveis para cada cor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addColor()}
            className="flex items-center gap-2 bg-[var(--color-brand-green-deep)] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" /> Adicionar Nova Cor
          </button>
        </div>

        {/* Barra Rápida para Adicionar Cor Direto da Paleta */}
        <div className="bg-[var(--color-brand-canvas)] p-3.5 rounded-md border border-gray-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-gold)]" />
            Adicionar Cor Rápida (1 Clique):
          </span>
          <div className="flex flex-wrap gap-2">
            {BRAND_COLOR_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => addColor(preset)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-[var(--color-brand-green-deep)] hover:shadow-2xs transition-all"
                title={`Adicionar bloco na cor ${preset.name}`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {colors.map((colorBlock, blockIdx) => {
            const variantsForBlock = formData.variants.filter(
              v => v.colorLocalId === colorBlock.localId
            )
            const activeSizes = variantsForBlock.map(v => v.size)

            return (
              <div
                key={colorBlock.localId}
                className="border border-gray-200 rounded-md p-5 bg-gray-50/60 space-y-5"
              >
                {/* Cabeçalho da Cor */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Preview Grande da Bolinha */}
                    <div className="flex items-center gap-3">
                      <label
                        className="relative w-11 h-11 rounded-full border-2 border-white ring-2 ring-gray-300 shadow-sm flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
                        style={{ backgroundColor: colorBlock.hex }}
                        title="Clique para escolher a cor personalizada"
                      >
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(colorBlock.hex) ? colorBlock.hex : '#141414'}
                          onChange={e => updateColorInfo(colorBlock.localId, 'hex', e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Cor #{blockIdx + 1}
                        </span>
                        <span className="text-sm font-bold text-[var(--color-brand-dark)]">
                          {colorBlock.name || 'Sem nome'}
                        </span>
                      </div>
                    </div>

                    {/* Input Nome da Cor */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        Nome da Cor *
                      </label>
                      <input
                        type="text"
                        value={colorBlock.name}
                        onChange={e => updateColorInfo(colorBlock.localId, 'name', e.target.value)}
                        className="text-sm bg-white border-gray-300 border px-3 py-1.5 w-44 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm font-medium"
                        placeholder="Ex: Verde Esmeralda"
                        required
                      />
                    </div>

                    {/* Input Hex */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        Código da Cor (Hex)
                      </label>
                      <div className="flex items-center gap-1.5 border border-gray-300 px-2 py-1 bg-white rounded-sm w-32 focus-within:border-[var(--color-brand-green-deep)]">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(colorBlock.hex) ? colorBlock.hex : '#141414'}
                          onChange={e => updateColorInfo(colorBlock.localId, 'hex', e.target.value)}
                          className="w-5 h-5 cursor-pointer p-0 border-0 rounded-xs shrink-0"
                        />
                        <input
                          type="text"
                          value={colorBlock.hex}
                          onChange={e => updateColorInfo(colorBlock.localId, 'hex', e.target.value)}
                          className="text-xs w-20 outline-none uppercase bg-transparent font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão Remover Cor (sempre visível!) */}
                  <button
                    type="button"
                    onClick={() => removeColor(colorBlock.localId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider transition-colors border border-red-200 bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                    {colors.length > 1 ? 'Remover Cor' : 'Limpar Cor'}
                  </button>
                </div>

                {/* Seletor rápido para trocar a cor deste bloco */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">
                    Trocar bolinha para:
                  </span>
                  {BRAND_COLOR_PRESETS.map(preset => {
                    const isCurrent =
                      colorBlock.name.trim().toLowerCase() === preset.name.toLowerCase()
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          applyPresetToColorBlock(colorBlock.localId, preset.name, preset.hex)
                        }
                        title={`${preset.name} (${preset.hex})`}
                        className={`w-6 h-6 rounded-full border transition-transform flex items-center justify-center ${
                          isCurrent
                            ? 'ring-2 ring-[var(--color-brand-green-deep)] scale-110 border-white'
                            : 'border-black/20 hover:scale-110'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    )
                  })}
                </div>

                {/* Grade de Tamanhos da Cor */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
                      Tamanhos e Estoque para &ldquo;{colorBlock.name || 'Esta Cor'}&rdquo;
                      <span className="text-gray-400 font-normal">
                        ({activeSizes.length} selecionado{activeSizes.length === 1 ? '' : 's'})
                      </span>
                    </label>

                    {/* Atalhos de Grade e Estoque em Lote */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => selectSizeGroupForColor(colorBlock, NUMERIC_PLUS_SIZES)}
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-white border border-gray-300 text-gray-700 hover:border-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-green-deep)] transition-colors"
                      >
                        + Grade 44 ao 56
                      </button>
                      <button
                        type="button"
                        onClick={() => selectSizeGroupForColor(colorBlock, G_PLUS_SIZES)}
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-white border border-gray-300 text-gray-700 hover:border-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-green-deep)] transition-colors"
                      >
                        + Grade G1 ao G3
                      </button>
                      {activeSizes.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setBatchStockForColor(colorBlock.localId, 3)}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Estoque = 3 em todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setBatchStockForColor(colorBlock.localId, 5)}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Estoque = 5 em todos
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {activeSizes.length === 0 && (
                    <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Clique nos tamanhos abaixo para ativar esta cor na vitrine.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {ALL_AVAILABLE_SIZES.map(size => {
                      const variant = variantsForBlock.find(v => v.size === size)
                      const isActive = Boolean(variant)

                      return (
                        <div
                          key={size}
                          className={`flex items-center border rounded-sm transition-all ${
                            isActive
                              ? 'border-[var(--color-brand-green-deep)] bg-white shadow-2xs ring-1 ring-[var(--color-brand-green-deep)]/20'
                              : 'border-gray-200 bg-white/70 hover:border-gray-400'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSizeForColor(colorBlock, size)}
                            className={`px-3 py-2 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 ${
                              isActive
                                ? 'bg-[var(--color-brand-green-deep)] text-white'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            {size}
                          </button>
                          {isActive && variant && (
                            <div className="flex items-center pl-2 pr-2 py-1 bg-white">
                              <span className="text-[10px] text-gray-500 mr-1 uppercase font-bold">
                                Qtd:
                              </span>
                              <input
                                type="number"
                                min="0"
                                required
                                value={
                                  Number.isNaN(variant.stockQuantity) ? 0 : variant.stockQuantity
                                }
                                onChange={e =>
                                  handleVariantChange(
                                    colorBlock.localId,
                                    size,
                                    'stockQuantity',
                                    e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                                  )
                                }
                                className="w-12 text-xs sm:text-sm p-0.5 text-center outline-none bg-transparent font-bold text-[var(--color-brand-dark)] border-b border-gray-300 focus:border-[var(--color-brand-green-deep)]"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Configurações Avançadas por Tamanho (SKU e Medidas) */}
                {variantsForBlock.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <details>
                      <summary className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[var(--color-brand-green-deep)]">
                        Medidas em cm e SKU individual ({variantsForBlock.length} tamanho
                        {variantsForBlock.length === 1 ? '' : 's'})
                      </summary>
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-xs text-left bg-white border border-gray-200 rounded-sm">
                          <thead className="bg-gray-50 border-b border-gray-200 uppercase font-semibold text-gray-600 tracking-wider">
                            <tr>
                              <th className="px-3 py-2">Tamanho</th>
                              <th className="px-3 py-2">SKU Único</th>
                              <th className="px-3 py-2">Busto (cm)</th>
                              <th className="px-3 py-2">Cintura (cm)</th>
                              <th className="px-3 py-2">Quadril (cm)</th>
                              <th className="px-3 py-2">Compr. (cm)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {variantsForBlock.map(variant => (
                              <tr key={variant.size} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-3 py-2 font-bold text-[var(--color-brand-dark)] bg-gray-50/50">
                                  {variant.size}
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    value={variant.sku}
                                    onChange={e =>
                                      handleVariantChange(
                                        colorBlock.localId,
                                        variant.size,
                                        'sku',
                                        e.target.value
                                      )
                                    }
                                    className="border border-gray-200 p-1.5 w-full max-w-[160px] outline-none focus:border-[var(--color-brand-green-deep)] font-mono text-[10px] rounded-xs uppercase bg-gray-50"
                                    required
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    placeholder="Ex: 112"
                                    value={variant.bustCm ?? ''}
                                    onChange={e =>
                                      handleVariantChange(
                                        colorBlock.localId,
                                        variant.size,
                                        'bustCm',
                                        e.target.value ? parseFloat(e.target.value) : null
                                      )
                                    }
                                    className="border border-gray-200 p-1.5 w-20 outline-none focus:border-[var(--color-brand-green-deep)] rounded-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    placeholder="Ex: 94"
                                    value={variant.waistCm ?? ''}
                                    onChange={e =>
                                      handleVariantChange(
                                        colorBlock.localId,
                                        variant.size,
                                        'waistCm',
                                        e.target.value ? parseFloat(e.target.value) : null
                                      )
                                    }
                                    className="border border-gray-200 p-1.5 w-20 outline-none focus:border-[var(--color-brand-green-deep)] rounded-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    placeholder="Ex: 122"
                                    value={variant.hipCm ?? ''}
                                    onChange={e =>
                                      handleVariantChange(
                                        colorBlock.localId,
                                        variant.size,
                                        'hipCm',
                                        e.target.value ? parseFloat(e.target.value) : null
                                      )
                                    }
                                    className="border border-gray-200 p-1.5 w-20 outline-none focus:border-[var(--color-brand-green-deep)] rounded-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    placeholder="Ex: 108"
                                    value={variant.lengthCm ?? ''}
                                    onChange={e =>
                                      handleVariantChange(
                                        colorBlock.localId,
                                        variant.size,
                                        'lengthCm',
                                        e.target.value ? parseFloat(e.target.value) : null
                                      )
                                    }
                                    className="border border-gray-200 p-1.5 w-20 outline-none focus:border-[var(--color-brand-green-deep)] rounded-xs"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* BARRA DE SALVAR FIXA */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 px-6 md:px-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span>
            <strong>{colors.length}</strong> cor(es) •{' '}
            <strong>{formData.variants.length}</strong> variação(ões) ativa(s)
          </span>
        </div>
        <button
          type="submit"
          disabled={isSaving || queueStatus.isPending}
          className="bg-[var(--color-brand-green-deep)] text-white px-8 py-3.5 text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md rounded-sm w-full sm:w-auto"
        >
          {isSaving
            ? 'Salvando Alterações...'
            : queueStatus.isPending
              ? `Finalizando envio de fotos...`
              : isEditing
                ? 'Salvar Alterações da Peça'
                : 'Publicar Peça na Loja'}
        </button>
      </div>
    </form>
  )
}

