'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AvailabilityType } from '@prisma/client'
import ImageUploader from './ImageUploader'
import { createProduct, updateProduct } from '@/app/actions/manage-products'
import { Plus, Trash2 } from 'lucide-react'

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

const ALL_AVAILABLE_SIZES = ['P', 'M', 'G', 'GG', 'G1', 'G2', 'G3', '44', '46', '48', '50', '52', '54', '56', 'Tamanho Único']

// Local state for Color Blocks
interface ColorBlock {
  localId: string
  name: string
  hex: string
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
    variants: []
  })

  // Derive unique colors from initialData variants
  const initialColors: ColorBlock[] = []
  if (initialData && initialData.variants.length > 0) {
    const colorMap = new Map<string, string>()
    initialData.variants.forEach(v => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, v.colorHex)
      }
    })
    colorMap.forEach((hex, name) => {
      initialColors.push({ localId: Math.random().toString(36).substr(2, 9), name, hex })
    })
  } else {
    // Default single color
    initialColors.push({ localId: Math.random().toString(36).substr(2, 9), name: 'Preto', hex: '#000000' })
  }

  const [colors, setColors] = useState<ColorBlock[]>(initialColors)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (!isEditing) {
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setFormData({ ...formData, name, slug })
    } else {
      setFormData({ ...formData, name })
    }
  }

  const addColor = () => {
    setColors([...colors, { localId: Math.random().toString(36).substr(2, 9), name: 'Nova Cor', hex: '#cccccc' }])
  }

  const removeColor = (localId: string) => {
    const colorToRemove = colors.find(c => c.localId === localId)
    if (!colorToRemove) return
    
    // Remove all variants for this color
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.color !== colorToRemove.name)
    }))
    
    setColors(colors.filter(c => c.localId !== localId))
  }

  const updateColorInfo = (localId: string, field: 'name' | 'hex', value: string) => {
    const colorToUpdate = colors.find(c => c.localId === localId)
    if (!colorToUpdate) return

    const oldName = colorToUpdate.name

    setColors(colors.map(c => c.localId === localId ? { ...c, [field]: value } : c))

    // Update variants that matched the old color info
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.color === oldName) {
          if (field === 'name') return { ...v, color: value }
          if (field === 'hex') return { ...v, colorHex: value }
        }
        return v
      })
    }))
  }

  const toggleSizeForColor = (colorName: string, colorHex: string, size: string) => {
    const existingIndex = formData.variants.findIndex(v => v.color === colorName && v.size === size)
    
    if (existingIndex >= 0) {
      // Remove variant
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, idx) => idx !== existingIndex)
      }))
    } else {
      // Add variant
      const colorSlug = colorName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const newSkuHash = Math.random().toString(36).substring(2, 7).toUpperCase()
      const slugPrefix = formData.slug ? formData.slug.toUpperCase().substring(0, 5) : 'NEW'
      const sku = `UA-${slugPrefix}-${colorSlug.toUpperCase().substring(0,3)}-${size}-${newSkuHash}`

      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, {
          size,
          color: colorName,
          colorHex: colorHex,
          sku,
          stockQuantity: 0,
          bustCm: null,
          waistCm: null,
          hipCm: null,
          lengthCm: null
        }]
      }))
    }
  }

  const handleVariantChange = (colorName: string, size: string, field: keyof VariantFormState, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.color === colorName && v.size === size) {
          return { ...v, [field]: value }
        }
        return v
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (formData.images.length === 0) {
        throw new Error('É necessário pelo menos uma imagem.')
      }
      
      if (formData.variants.length === 0) {
        throw new Error('É necessário adicionar pelo menos um tamanho a uma cor.')
      }

      // Check for SKU uniqueness inside the form payload
      const skuSet = new Set()
      for (const v of formData.variants) {
        if (skuSet.has(v.sku)) {
          throw new Error(`SKU duplicado detectado: ${v.sku}`)
        }
        skuSet.add(v.sku)
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
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-sm">
          {error}
        </div>
      )}

      {/* BLOCO 1: DADOS GERAIS */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6 shadow-xs">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">1. Dados Gerais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nome da Peça</label>
            <input 
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Slug (URL)</label>
            <input 
              required
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-gray-50 rounded-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Categoria</label>
            <select 
              required
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
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
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Preço De (Opcional)</label>
              <input 
                type="number"
                step="0.01"
                value={formData.originalPrice || ''}
                onChange={e => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
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
            className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
          />
        </div>
      </div>

      {/* BLOCO 2: LOGÍSTICA E CAIMENTO */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6 shadow-xs">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">2. Produção & Tecido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Modalidade</label>
            <select 
              value={formData.availability}
              onChange={e => setFormData({ ...formData, availability: e.target.value as AvailabilityType })}
              className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm"
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
                className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
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
            className="w-full text-sm border-gray-300 border p-2 focus:border-[var(--color-brand-green-deep)] outline-none rounded-sm" 
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
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6 shadow-xs">
        <h2 className="text-lg font-serif text-[var(--color-brand-dark)] border-b border-gray-100 pb-2">3. Galeria de Fotos</h2>
        <ImageUploader 
          images={formData.images} 
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </div>

      {/* BLOCO 4: MATRIZ DE CORES E TAMANHOS */}
      <div className="bg-white p-6 border border-gray-200 rounded-sm space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
          <h2 className="text-lg font-serif text-[var(--color-brand-dark)]">4. Grade de Cores e Tamanhos</h2>
          <button 
            type="button" 
            onClick={addColor}
            className="flex items-center gap-2 bg-[var(--color-brand-green-deep)] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Adicionar Cor
          </button>
        </div>

        <div className="space-y-6">
          {colors.map((colorBlock, colorIndex) => {
            const activeSizes = formData.variants.filter(v => v.color === colorBlock.name).map(v => v.size)

            return (
              <div key={colorBlock.localId} className="border border-gray-200 rounded-sm p-4 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Nome da Cor</label>
                      <input 
                        type="text"
                        value={colorBlock.name}
                        onChange={e => updateColorInfo(colorBlock.localId, 'name', e.target.value)}
                        className="text-sm border-gray-300 border p-1.5 w-32 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm"
                        placeholder="Ex: Preto"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Referência Hex</label>
                      <div className="flex items-center gap-1 border border-gray-300 p-1 bg-white rounded-sm w-28 focus-within:border-[var(--color-brand-green-deep)]">
                        <input 
                          type="color"
                          value={colorBlock.hex}
                          onChange={e => updateColorInfo(colorBlock.localId, 'hex', e.target.value)}
                          className="w-5 h-5 cursor-pointer p-0 border-0 rounded-sm"
                        />
                        <input 
                          type="text"
                          value={colorBlock.hex}
                          onChange={e => updateColorInfo(colorBlock.localId, 'hex', e.target.value)}
                          className="text-xs w-16 outline-none uppercase bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {colors.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeColor(colorBlock.localId)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs uppercase font-bold tracking-wider"
                    >
                      <Trash2 className="w-4 h-4" /> Remover Cor
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Grade de Tamanhos ({colorBlock.name})</label>
                  <div className="flex flex-wrap gap-3">
                    {ALL_AVAILABLE_SIZES.map(size => {
                      const isActive = activeSizes.includes(size)
                      const variant = formData.variants.find(v => v.color === colorBlock.name && v.size === size)
                      
                      return (
                        <div key={size} className={`flex items-center border rounded-sm transition-all ${isActive ? 'border-[var(--color-brand-green-deep)] bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <button 
                            type="button"
                            onClick={() => toggleSizeForColor(colorBlock.name, colorBlock.hex, size)}
                            className={`px-3 py-1.5 text-sm font-bold transition-colors ${isActive ? 'text-[var(--color-brand-green-deep)]' : 'text-gray-500'}`}
                          >
                            {size}
                          </button>
                          {isActive && (
                            <div className="flex items-center border-l border-gray-100 pl-2 pr-2 bg-gray-50/50">
                              <span className="text-[10px] text-gray-500 mr-1 uppercase font-bold">Estoque:</span>
                              <input 
                                type="number"
                                min="0"
                                required
                                value={variant?.stockQuantity || 0}
                                onChange={(e) => handleVariantChange(colorBlock.name, size, 'stockQuantity', parseInt(e.target.value) || 0)}
                                className="w-14 text-sm p-1 outline-none bg-transparent font-bold text-[var(--color-brand-dark)] border-b border-dashed border-gray-300 focus:border-[var(--color-brand-green-deep)]"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {activeSizes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <details>
                      <summary className="text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-[var(--color-brand-green-deep)] mb-2">
                        Configurações Avançadas por Tamanho (SKU e Medidas)
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
                            {formData.variants.filter(v => v.color === colorBlock.name).map((variant, index) => (
                              <tr key={variant.size} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-3 py-2 font-bold text-[var(--color-brand-dark)] bg-gray-50/50">{variant.size}</td>
                                <td className="px-3 py-2">
                                  <input 
                                    value={variant.sku}
                                    onChange={e => handleVariantChange(colorBlock.name, variant.size, 'sku', e.target.value)}
                                    className="border border-gray-200 p-1 w-full max-w-[150px] outline-none focus:border-[var(--color-brand-green-deep)] font-mono text-[10px] rounded-sm uppercase bg-gray-50"
                                    required
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input 
                                    type="number"
                                    value={variant.bustCm || ''}
                                    onChange={e => handleVariantChange(colorBlock.name, variant.size, 'bustCm', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input 
                                    type="number"
                                    value={variant.waistCm || ''}
                                    onChange={e => handleVariantChange(colorBlock.name, variant.size, 'waistCm', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input 
                                    type="number"
                                    value={variant.hipCm || ''}
                                    onChange={e => handleVariantChange(colorBlock.name, variant.size, 'hipCm', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input 
                                    type="number"
                                    value={variant.lengthCm || ''}
                                    onChange={e => handleVariantChange(colorBlock.name, variant.size, 'lengthCm', e.target.value ? parseFloat(e.target.value) : null)}
                                    className="border border-gray-200 p-1 w-16 outline-none focus:border-[var(--color-brand-green-deep)] rounded-sm"
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

      {/* BOTÃO DE SALVAR FLUTUANTE / FINAL */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 p-4 px-6 md:px-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex justify-end">
        <button 
          type="submit"
          disabled={isSaving}
          className="bg-[var(--color-brand-dark)] text-white px-8 py-3.5 font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md w-full md:w-auto"
        >
          {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </button>
      </div>
    </form>
  )
}
