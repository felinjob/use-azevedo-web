'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HighlightType } from '@prisma/client'
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { createHighlight, updateHighlight, HighlightFormData } from '@/app/actions/manage-highlights'

interface HighlightModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string
    title: string
    subtitle?: string | null
    imageUrl: string
    linkUrl: string
    type: HighlightType
    order: number
    active: boolean
  } | null
  defaultType: HighlightType
}

const LINK_PRESETS = [
  { label: 'Novidades', url: '/?filtro=novidades' },
  { label: 'Vestidos & Conjuntos', url: '/?categoria=vestidos-e-conjuntos' },
  { label: 'Pronta Entrega', url: '/?disponibilidade=READY_TO_SHIP' },
  { label: 'Sob Encomenda', url: '/?disponibilidade=MADE_TO_ORDER' },
  { label: 'Conjuntos (Busca)', url: '/?busca=conjunto' },
  { label: 'Blusas (Busca)', url: '/?busca=blusa' },
  { label: 'Linho (Busca)', url: '/?busca=linho' },
  { label: 'Alfaiataria (Busca)', url: '/?busca=alfaiataria' },
]

export default function HighlightModal({
  isOpen,
  onClose,
  initialData,
  defaultType,
}: HighlightModalProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [type, setType] = useState<HighlightType>(defaultType)
  const [order, setOrder] = useState<number>(0)
  const [active, setActive] = useState<boolean>(true)
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setSubtitle(initialData.subtitle || '')
      setImageUrl(initialData.imageUrl)
      setLinkUrl(initialData.linkUrl)
      setType(initialData.type)
      setOrder(initialData.order)
      setActive(initialData.active)
    } else {
      setTitle('')
      setSubtitle('')
      setImageUrl('')
      setLinkUrl(defaultType === 'HERO_SLIDE' ? '/?filtro=novidades' : '/?categoria=vestidos-e-conjuntos')
      setType(defaultType)
      setOrder(0)
      setActive(true)
    }
    setErrorMessage('')
  }, [initialData, defaultType, isOpen])

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'banners')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer upload da imagem.')
      }

      if (data.url) {
        setImageUrl(data.url)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setErrorMessage(err.message || 'Erro ao fazer upload da imagem.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Informe o título.')
      return
    }
    if (!imageUrl.trim()) {
      setErrorMessage('Faça o upload ou informe a URL da imagem.')
      return
    }
    if (!linkUrl.trim()) {
      setErrorMessage('Informe o link de destino.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    const payload: HighlightFormData = {
      title: title.trim(),
      subtitle: type === 'HERO_SLIDE' ? subtitle.trim() || null : null,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      type,
      order: Number(order) || 0,
      active,
    }

    let result
    if (initialData?.id) {
      result = await updateHighlight(initialData.id, payload)
    } else {
      result = await createHighlight(payload)
    }

    setIsSaving(false)

    if (result.success) {
      onClose()
    } else {
      setErrorMessage(result.error || 'Erro ao salvar o destaque.')
    }
  }

  const isHero = type === 'HERO_SLIDE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-lg text-[var(--color-brand-dark)] font-bold">
              {initialData ? 'Editar Destaque' : isHero ? 'Novo Banner (Hero)' : 'Novo Story Circular'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isHero ? 'Carrossel principal com foto widescreen' : 'Círculo de categoria estilo Stories'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
              {errorMessage}
            </div>
          )}

          {/* Tipo (se for criação) */}
          {!initialData && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Tipo de Destaque
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('HERO_SLIDE')}
                  className={`py-2 px-3 text-xs font-semibold rounded-sm border transition-colors ${
                    type === 'HERO_SLIDE'
                      ? 'border-[var(--color-brand-green-deep)] bg-green-50 text-[var(--color-brand-green-deep)]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Banner Hero (Principal)
                </button>
                <button
                  type="button"
                  onClick={() => setType('STORY_CIRCLE')}
                  className={`py-2 px-3 text-xs font-semibold rounded-sm border transition-colors ${
                    type === 'STORY_CIRCLE'
                      ? 'border-[var(--color-brand-green-deep)] bg-green-50 text-[var(--color-brand-green-deep)]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Story Circular
                </button>
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              {isHero ? 'Título do Banner' : 'Rótulo do Story (ex: Vestidos)'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isHero ? 'Ex: Nova Coleção Essência' : 'Ex: Vestidos'}
              className="w-full text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
              required
            />
          </div>

          {/* Subtítulo (apenas Hero) */}
          {isHero && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Subtítulo / Frase de Impacto
              </label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder="Ex: Moda autoral do 44 ao 56, feita para abraçar as suas curvas."
                className="w-full text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
              />
            </div>
          )}

          {/* Upload de Imagem */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Imagem do Destaque *
            </label>
            
            {imageUrl ? (
              <div className="relative mb-2 rounded-sm overflow-hidden border border-gray-200 bg-gray-50">
                <div className={`relative ${isHero ? 'aspect-[16/9]' : 'aspect-square w-24 h-24 mx-auto rounded-full my-2 overflow-hidden border-2 border-[var(--color-brand-green-deep)]'}`}>
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-sm"
                  title="Trocar imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-sm p-5 text-center hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando para o Supabase...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs font-medium text-gray-700">Clique para enviar imagem</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {isHero ? 'Recomendado: 1920x800 ou alta resolução (PNG/JPG)' : 'Recomendado: Proporção quadrada (1:1)'}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* Ou colar URL direta */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Ou URL:</span>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-gray-400 text-gray-600"
              />
            </div>
          </div>

          {/* Link de Destino */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Link de Destino (ao clicar) *
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Ex: /?filtro=novidades ou /produto/slug"
              className="w-full text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
              required
            />
            {/* Presets rápidos */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {LINK_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setLinkUrl(p.url)}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-xs transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordem & Ativo */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Ordem de Exibição
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-full text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                min={0}
              />
              <span className="text-[10px] text-gray-400">0 aparece primeiro</span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Status
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-brand-green-deep)] focus:ring-[var(--color-brand-green-deep)]"
                />
                <span className="text-xs font-medium text-gray-700">
                  {active ? 'Ativo na loja' : 'Inativo (oculto)'}
                </span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-[var(--color-brand-green-deep)] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {initialData ? 'Salvar Alterações' : 'Cadastrar Destaque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
