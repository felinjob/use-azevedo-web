'use client'

import { useState, useRef } from 'react'
import { HighlightType } from '@prisma/client'
import {
  X,
  UploadCloud,
  Loader2,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Monitor,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import { createHighlight, updateHighlight, HighlightFormData } from '@/app/actions/manage-highlights'
import { compressImage } from '@/lib/compress-image'
import {
  parseHeroImage,
  buildHeroImageUrl,
  HeroFramingConfig,
  DEFAULT_HERO_FRAMING,
} from '@/lib/hero-framing'

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
  { label: 'Vestidos & Vestidos Curtos', url: '/?categoria=vestidos-e-vestidos-curtos' },
  { label: 'Conjuntos & Macacões', url: '/?categoria=conjuntos-e-macacoes' },
  { label: 'Blusas & Croppeds', url: '/?categoria=blusas-e-croppeds' },
  { label: 'Saias, Calças & Shorts', url: '/?categoria=saias-calcas-e-shorts' },
  { label: 'Pronta Entrega', url: '/?disponibilidade=READY_TO_SHIP' },
  { label: 'Sob Encomenda', url: '/?disponibilidade=MADE_TO_ORDER' },
]

export default function HighlightModal({
  isOpen,
  onClose,
  initialData,
  defaultType,
}: HighlightModalProps) {
  const initialHasText = Boolean(initialData?.title?.trim() || initialData?.subtitle?.trim())
  const parsedInitial = parseHeroImage(
    initialData?.imageUrl || '',
    initialData ? initialHasText : true
  )

  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [cleanImageUrl, setCleanImageUrl] = useState(parsedInitial.cleanUrl)
  const [framing, setFraming] = useState<HeroFramingConfig>(parsedInitial.framing)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isCleanArtMode, setIsCleanArtMode] = useState<boolean>(
    initialData ? !initialHasText && !parsedInitial.framing.showButton : false
  )

  const [linkUrl, setLinkUrl] = useState(
    initialData?.linkUrl ||
      (defaultType === 'HERO_SLIDE' ? '/?filtro=novidades' : '/?categoria=vestidos-e-vestidos-curtos')
  )
  const [type, setType] = useState<HighlightType>(initialData?.type || defaultType)
  const [order, setOrder] = useState<number>(initialData?.order ?? 0)
  const [active, setActive] = useState<boolean>(initialData?.active ?? true)

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Drag-to-pan state on the Hero preview
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{
    clientX: number
    clientY: number
    startX: number
    startY: number
  } | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const isHero = type === 'HERO_SLIDE'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', await compressImage(file))
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
        setCleanImageUrl(data.url)
      }
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleToggleCleanArt = (enabled: boolean) => {
    setIsCleanArtMode(enabled)
    if (enabled) {
      setTitle('')
      setSubtitle('')
      setFraming(prev => ({
        ...prev,
        overlay: 0,
        showButton: false,
      }))
    } else {
      setFraming(prev => ({
        ...prev,
        overlay: prev.overlay === 0 ? 35 : prev.overlay,
        showButton: true,
      }))
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHero || !cleanImageUrl) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: framing.x,
      startY: framing.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !previewContainerRef.current) return
    const rect = previewContainerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // Dragging right moves image right (which decreases object-position X% in cover mode)
    const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100
    const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100

    const nextX = Math.min(100, Math.max(0, Math.round(dragStartRef.current.startX - deltaXPercent)))
    const nextY = Math.min(100, Math.max(0, Math.round(dragStartRef.current.startY - deltaYPercent)))

    setFraming(prev => ({
      ...prev,
      x: nextX,
      y: nextY,
    }))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId)
      setIsDragging(false)
      dragStartRef.current = null
    }
  }

  const resetFraming = () => {
    const hasText = Boolean(title.trim() || subtitle.trim())
    setFraming({
      ...DEFAULT_HERO_FRAMING,
      overlay: hasText ? 35 : 0,
      showButton: !isCleanArtMode,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isHero && !title.trim()) {
      setErrorMessage('Informe o rótulo do Story (ex: Vestidos).')
      return
    }
    if (!cleanImageUrl.trim()) {
      setErrorMessage('Faça o upload ou informe a URL da imagem.')
      return
    }
    if (!linkUrl.trim()) {
      setErrorMessage('Informe o link de destino.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    const finalTitle = isHero && isCleanArtMode ? '' : title.trim()
    const finalSubtitle = isHero && !isCleanArtMode ? subtitle.trim() || null : null
    const finalImageUrl = isHero
      ? buildHeroImageUrl(cleanImageUrl, framing)
      : cleanImageUrl.trim()

    const payload: HighlightFormData = {
      title: finalTitle,
      subtitle: finalSubtitle,
      imageUrl: finalImageUrl,
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

  const showAmbientBackdrop = framing.fit === 'contain' || framing.zoom < 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`bg-white rounded-md shadow-2xl w-full ${
          isHero ? 'max-w-3xl' : 'max-w-lg'
        } max-h-[92vh] overflow-y-auto border border-gray-200 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-20">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-[var(--color-brand-dark)] font-bold">
              {initialData ? 'Editar Destaque' : isHero ? 'Novo Banner da Capa (Hero)' : 'Novo Story Circular'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isHero
                ? 'Ajuste o enquadramento, zoom e escolha se quer texto ou arte limpa.'
                : 'Círculo de categoria estilo Stories no topo da loja'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm font-medium">
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
                  className={`py-2.5 px-3 text-xs font-semibold rounded-sm border transition-colors cursor-pointer ${
                    type === 'HERO_SLIDE'
                      ? 'border-[var(--color-brand-green-deep)] bg-green-50 text-[var(--color-brand-green-deep)]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Banner Hero (Capa Principal)
                </button>
                <button
                  type="button"
                  onClick={() => setType('STORY_CIRCLE')}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-sm border transition-colors cursor-pointer ${
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

          {/* UPLOAD + PREVIEW INTERATIVO DA CAPA */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                {isHero ? 'Imagem & Enquadramento da Capa *' : 'Imagem do Story *'}
              </label>

              {isHero && cleanImageUrl && (
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white text-[var(--color-brand-dark)] shadow-2xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Preview Computador
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white text-[var(--color-brand-dark)] shadow-2xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Preview Celular
                  </button>
                </div>
              )}
            </div>

            {cleanImageUrl ? (
              <div className="space-y-3">
                {isHero ? (
                  <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-900">
                    {/* MOLDURA DE PREVIEW INTERATIVO */}
                    <div
                      ref={previewContainerRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className={`relative mx-auto overflow-hidden select-none ${
                        previewDevice === 'desktop'
                          ? 'w-full aspect-[16/7]'
                          : 'w-[280px] sm:w-[320px] aspect-[4/5]'
                      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      title="Arraste a imagem com o mouse ou dedo para ajustar a posição"
                    >
                      {/* Fundo desfocado elegante quando usar 'contain' ou zoom < 100% */}
                      {showAmbientBackdrop && (
                        <Image
                          src={cleanImageUrl}
                          alt=""
                          fill
                          className="object-cover scale-110 blur-xl opacity-50 pointer-events-none"
                          sizes="600px"
                        />
                      )}

                      {/* Imagem Principal com Posição e Zoom Ajustáveis */}
                      <div
                        className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out pointer-events-none"
                        style={{
                          transform: `scale(${framing.zoom / 100})`,
                          transformOrigin: `${framing.x}% ${framing.y}%`,
                        }}
                      >
                        <Image
                          src={cleanImageUrl}
                          alt={title || 'Preview da Capa'}
                          fill
                          className={framing.fit === 'contain' ? 'object-contain' : 'object-cover'}
                          style={{
                            objectPosition: `${framing.x}% ${framing.y}%`,
                          }}
                          sizes="800px"
                        />
                      </div>

                      {/* Película de contraste */}
                      {framing.overlay > 0 && (
                        <div
                          className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                          style={{ opacity: framing.overlay / 100 }}
                        />
                      )}

                      {/* Simulação ao Vivo dos Textos e Botão na Capa */}
                      {(!isCleanArtMode && (title.trim() || subtitle.trim() || framing.showButton)) && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                          <div className="text-center max-w-lg">
                            {title.trim() && (
                              <h4 className="font-serif text-xl sm:text-3xl text-[var(--color-brand-ivory)] mb-2 leading-tight drop-shadow-sm">
                                {title}
                              </h4>
                            )}
                            {subtitle.trim() && (
                              <p className="text-xs sm:text-sm text-[var(--color-brand-ivory)]/90 mb-4 font-light drop-shadow-xs line-clamp-2">
                                {subtitle}
                              </p>
                            )}
                            {framing.showButton && (
                              <span className="inline-block bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] px-4 py-2 uppercase tracking-[0.2em] text-[10px] font-bold shadow-md">
                                Explorar Coleção
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dica de arraste + Botão Remover Imagem */}
                      <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                        <Move className="w-3 h-3" />
                        <span>Arraste a foto para mover ({framing.x}%, {framing.y}%)</span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="bg-white/90 hover:bg-white text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xs shadow-sm cursor-pointer"
                        >
                          Trocar Foto
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCleanImageUrl('')
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-xs shadow-sm cursor-pointer"
                          title="Remover imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* PAINEL DE CONTROLES DE ENQUADRAMENTO E ZOOM */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                            Encaixe na Moldura:
                          </span>
                          <button
                            type="button"
                            onClick={() => setFraming(prev => ({ ...prev, fit: 'cover' }))}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs border transition-colors cursor-pointer ${
                              framing.fit === 'cover'
                                ? 'bg-[var(--color-brand-green-deep)] text-white border-[var(--color-brand-green-deep)]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            Preencher Tudo (Capa)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFraming(prev => ({ ...prev, fit: 'contain', zoom: 100 }))}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs border transition-colors cursor-pointer ${
                              framing.fit === 'contain'
                                ? 'bg-[var(--color-brand-green-deep)] text-white border-[var(--color-brand-green-deep)]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            Arte Inteira (Sem Cortar)
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={resetFraming}
                          className="text-[11px] text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1 px-2 py-1 rounded-xs hover:bg-gray-200/60 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Resetar Ajuste
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        {/* Zoom Control */}
                        <div className="bg-white p-2.5 rounded-xs border border-gray-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-1">
                              {framing.zoom < 100 ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                              Zoom da Imagem
                            </span>
                            <span className="text-[var(--color-brand-green-deep)]">{framing.zoom}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFraming(prev => ({ ...prev, zoom: Math.max(70, prev.zoom - 5) }))}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-xs text-xs font-bold flex items-center justify-center cursor-pointer"
                              title="Diminuir zoom"
                            >
                              -
                            </button>
                            <input
                              type="range"
                              min={70}
                              max={180}
                              step={2}
                              value={framing.zoom}
                              onChange={(e) => setFraming(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                              className="flex-1 accent-[var(--color-brand-green-deep)] cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setFraming(prev => ({ ...prev, zoom: Math.min(180, prev.zoom + 5) }))}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-xs text-xs font-bold flex items-center justify-center cursor-pointer"
                              title="Aumentar zoom"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Vertical Position */}
                        <div className="bg-white p-2.5 rounded-xs border border-gray-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                            <span>Posição Vertical (Topo/Base)</span>
                            <span className="text-[var(--color-brand-green-deep)]">{framing.y}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={framing.y}
                            onChange={(e) => setFraming(prev => ({ ...prev, y: Number(e.target.value) }))}
                            className="w-full accent-[var(--color-brand-green-deep)] cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, y: 10 }))} className="hover:text-gray-700 cursor-pointer">Focar Rosto/Topo</button>
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, y: 50 }))} className="hover:text-gray-700 cursor-pointer">Centro</button>
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, y: 85 }))} className="hover:text-gray-700 cursor-pointer">Base</button>
                          </div>
                        </div>

                        {/* Horizontal Position */}
                        <div className="bg-white p-2.5 rounded-xs border border-gray-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1.5">
                            <span>Posição Horizontal (Esq/Dir)</span>
                            <span className="text-[var(--color-brand-green-deep)]">{framing.x}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={framing.x}
                            onChange={(e) => setFraming(prev => ({ ...prev, x: Number(e.target.value) }))}
                            className="w-full accent-[var(--color-brand-green-deep)] cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, x: 15 }))} className="hover:text-gray-700 cursor-pointer">Esquerda</button>
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, x: 50 }))} className="hover:text-gray-700 cursor-pointer">Centro</button>
                            <button type="button" onClick={() => setFraming(prev => ({ ...prev, x: 85 }))} className="hover:text-gray-700 cursor-pointer">Direita</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preview do Story Circular */
                  <div className="relative mb-2 rounded-sm overflow-hidden border border-gray-200 bg-gray-50 p-4 flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--color-brand-green-deep)] shadow-sm">
                      <Image src={cleanImageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCleanImageUrl('')}
                      className="mt-2 text-xs text-red-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remover / Trocar foto
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando imagem para o Supabase...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-gray-400 mb-1.5" />
                    <span className="text-xs font-semibold text-gray-700">Clique para enviar a imagem</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      {isHero
                        ? 'Você poderá ajustar o zoom, posição e escolher se quer com ou sem texto.'
                        : 'Recomendado: Proporção quadrada (1:1)'}
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
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Ou URL da Imagem:</span>
              <input
                type="url"
                value={cleanImageUrl}
                onChange={(e) => setCleanImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs border border-gray-200 rounded-sm px-2.5 py-1 focus:outline-none focus:border-gray-400 text-gray-600"
              />
            </div>
          </div>

          {/* OPÇÃO DE ARTE LIMPA vs COM TEXTO (APENAS HERO) */}
          {isHero ? (
            <div className="bg-[var(--color-brand-canvas)] p-4 rounded-sm border border-[var(--color-brand-muted)]/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/70">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
                    Textos sobre a Imagem (Opcional)
                  </span>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Subiu uma arte pronta? Ative &ldquo;Arte Limpa&rdquo; para exibir a imagem pura sem textos em cima.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border border-gray-200 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isCleanArtMode}
                    onChange={(e) => handleToggleCleanArt(e.target.checked)}
                    className="w-4 h-4 accent-[var(--color-brand-green-deep)]"
                  />
                  <span className="text-xs font-bold text-[var(--color-brand-green-deep)]">
                    Arte Limpa (Sem Textos)
                  </span>
                </label>
              </div>

              {!isCleanArtMode && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Título do Banner (Opcional)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Deixe em branco se não quiser título"
                        className="w-full text-sm bg-white border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Subtítulo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Frase complementar opcional"
                        className="w-full text-sm bg-white border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={framing.showButton}
                        onChange={(e) =>
                          setFraming(prev => ({ ...prev, showButton: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[var(--color-brand-green-deep)]"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Exibir botão &ldquo;Explorar Coleção&rdquo; sobre o banner
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-600">
                        Película escura ({framing.overlay}%):
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={65}
                        step={5}
                        value={framing.overlay}
                        onChange={(e) =>
                          setFraming(prev => ({ ...prev, overlay: Number(e.target.value) }))
                        }
                        className="w-24 accent-[var(--color-brand-green-deep)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Rótulo obrigatório apenas para Story Circular */
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Rótulo do Story (ex: Vestidos) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vestidos"
                className="w-full text-sm border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                required
              />
            </div>
          )}

          {/* Link de Destino */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Link de Destino (ao clicar no banner) *
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
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-xs transition-colors cursor-pointer"
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
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-[var(--color-brand-green-deep)] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {initialData ? 'Salvar Alterações' : 'Salvar na Loja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
