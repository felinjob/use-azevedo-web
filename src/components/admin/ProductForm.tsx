'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AvailabilityType } from '@prisma/client'
import ImageUploader from './ImageUploader'
import { createProduct, updateProduct } from '@/app/actions/manage-products'

interface Category {
  id: string
  name: string
}

export interface VariantFormState {
  id?: string
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

const DEFAULT_SIZES = ['44', '46', '48', '50', '52', '54', '56']
const DEFAULT_COLOR = 'Preto'
const DEFAULT_COLOR_HEX = '#000000'

const createDefaultVariants = (productSlug: string): VariantFormState[] => {
  return DEFAULT_SIZES.map(size => ({
    size,
    color: DEFAULT_COLOR,
    colorHex: DEFAULT_COLOR_HEX,
    sku: `UA-${productSlug ? productSlug.toUpperCase().substring(0, 5) : 'NEW'}-${size}`,
    stockQuantity: 0,
    bustCm: null,
    waistCm: null,
    hipCm: null,
    lengthCm: null
  }))
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ProductFormState>(initialData || {
    name: '',
    slug: '',
    categoryId: categories[0]?.id || '',
    price: 0,
    originalPrice: null,
    description: '',
    availability: 'READY_TO_SHIP',
    productionTimeDays: 0,
    fabricDetails: '',
    featured: false,
    active: true,
    images: [],
    variants: createDefaultVariants('')
  })

  // Global color for the MVP
  const [globalColor, setGlobalColor] = useState(initialData?.variants?.[0]?.color || DEFAULT_COLOR)
  const [globalColorHex, setGlobalColorHex] = useState(initialData?.variants?.[0]?.colorHex || DEFAULT_COLOR_HEX)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (!isEditing) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const newVariants = formData.variants.map(v => ({
        ...v,
        sku: `UA-${slug.toUpperCase().substring(0, 5)}-${v.size}`
      }))
      setFormData({ ...formData, name, slug, variants: newVariants })
    } else {
      setFormData({ ...formData, name })
    }
  }

  const handleGlobalColorChange = (field: 'color' | 'colorHex', value: string) => {
    if (field === 'color') setGlobalColor(value)
    if (field === 'colorHex') setGlobalColorHex(value)
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => ({ ...v, [field]: value }))
    }))
  }

  const handleVariantChange = (index: number, field: keyof VariantFormState, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (formData.images.length === 0) {
        throw new Error('É necessário pelo menos uma imagem.')
      }

      const res = isEditing 
        ? await updateProduct(formData.id!, formData)
        : await createProduct(formData)

      if (!res.success) {
        throw new Error(res.error)
      }

      router.push('/admin/produtos')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o produto.')
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 border border-red-200">
          {error}
        </div>
      )}

      {/* BLOCO 1: DADOS GERAIS */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">1. Dados Gerais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nome da Peça</label>
            <input 
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Slug (URL)</label>
            <input 
              required
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-gray-50" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Categoria</label>
            <select 
              required
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none"
            >
              <option value="">Selecione...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Preço (R$)</label>
              <input 
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Preço De (Opcional)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.originalPrice || ''}
                onChange={e => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Descrição Comercial</label>
          <textarea 
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
          />
        </div>
      </div>

      {/* BLOCO 2: LOGÍSTICA E CAIMENTO */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">2. Produção & Tecido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Modalidade</label>
            <select 
              value={formData.availability}
              onChange={e => setFormData({ ...formData, availability: e.target.value as AvailabilityType })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none"
            >
              <option value="READY_TO_SHIP">Pronta Entrega</option>
              <option value="MADE_TO_ORDER">Sob Encomenda</option>
            </select>
          </div>
          
          {formData.availability === 'MADE_TO_ORDER' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Prazo de Confecção (Dias Úteis)</label>
              <input 
                type="number"
                required
                value={formData.productionTimeDays}
                onChange={e => setFormData({ ...formData, productionTimeDays: parseInt(e.target.value) })}
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Detalhes do Tecido</label>
          <input 
            required
            placeholder="Ex: Alfaiataria encorpada com 5% de elastano. Não marca e não fica transparente."
            value={formData.fabricDetails}
            onChange={e => setFormData({ ...formData, fabricDetails: e.target.value })}
            className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none" 
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox"
              checked={formData.featured}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-[var(--color-brand-green-deep)] w-4 h-4"
            />
            Destaque na Home
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
              className="accent-[var(--color-brand-green-deep)] w-4 h-4"
            />
            Produto Ativo (Visível)
          </label>
        </div>
      </div>

      {/* BLOCO 3: IMAGENS */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">3. Galeria de Fotos</h2>
        <ImageUploader 
          images={formData.images} 
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </div>

      {/* BLOCO 4: GRADE E VARIANTES */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6">
        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
          <h2 className="text-lg font-serif text-[var(--color-brand-dark)]">4. Grade e Medidas</h2>
          
          <div className="flex gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Cor Base</label>
              <input 
                type="text"
                value={globalColor}
                onChange={e => handleGlobalColorChange('color', e.target.value)}
                className="text-xs border-gray-300 border p-1 w-24 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Hex</label>
              <div className="flex items-center gap-1 border border-gray-300 p-1 bg-white w-24">
                <input 
                  type="color"
                  value={globalColorHex}
                  onChange={e => handleGlobalColorChange('colorHex', e.target.value)}
                  className="w-4 h-4 cursor-pointer p-0 border-0"
                />
                <input 
                  type="text"
                  value={globalColorHex}
                  onChange={e => handleGlobalColorChange('colorHex', e.target.value)}
                  className="text-xs w-12 outline-none uppercase"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-3 py-3">Tamanho</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Estoque</th>
                <th className="px-3 py-3">Busto (cm)</th>
                <th className="px-3 py-3">Cintura (cm)</th>
                <th className="px-3 py-3">Quadril (cm)</th>
                <th className="px-3 py-3">Compr. (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.variants.map((variant, index) => (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-bold text-gray-900">{variant.size}</td>
                  <td className="px-3 py-2">
                    <input 
                      value={variant.sku}
                      onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                      className="border border-gray-200 p-1 w-28 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="number"
                      value={variant.stockQuantity}
                      onChange={e => handleVariantChange(index, 'stockQuantity', parseInt(e.target.value))}
                      className="border border-gray-200 p-1 w-20 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="number"
                      value={variant.bustCm || ''}
                      onChange={e => handleVariantChange(index, 'bustCm', e.target.value ? parseFloat(e.target.value) : null)}
                      className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="number"
                      value={variant.waistCm || ''}
                      onChange={e => handleVariantChange(index, 'waistCm', e.target.value ? parseFloat(e.target.value) : null)}
                      className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="number"
                      value={variant.hipCm || ''}
                      onChange={e => handleVariantChange(index, 'hipCm', e.target.value ? parseFloat(e.target.value) : null)}
                      className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="number"
                      value={variant.lengthCm || ''}
                      onChange={e => handleVariantChange(index, 'lengthCm', e.target.value ? parseFloat(e.target.value) : null)}
                      className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          disabled={isSaving}
          className="bg-[var(--color-brand-dark)] text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </button>
      </div>
    </form>
  )
}
