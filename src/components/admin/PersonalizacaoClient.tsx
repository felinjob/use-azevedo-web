'use client'

import { useState } from 'react'
import { HighlightType } from '@prisma/client'
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import HighlightModal from './HighlightModal'
import { toggleHighlightActive, deleteHighlight } from '@/app/actions/manage-highlights'

export interface SerializedHighlight {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string
  type: HighlightType
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface PersonalizacaoClientProps {
  heroSlides: SerializedHighlight[]
  storyCircles: SerializedHighlight[]
}

export default function PersonalizacaoClient({
  heroSlides,
  storyCircles,
}: PersonalizacaoClientProps) {
  const [activeTab, setActiveTab] = useState<'HERO' | 'STORIES'>('HERO')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<SerializedHighlight | null>(null)
  const [modalType, setModalType] = useState<HighlightType>('HERO_SLIDE')
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)

  const handleOpenCreate = (type: HighlightType) => {
    setSelectedHighlight(null)
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (highlight: SerializedHighlight) => {
    setSelectedHighlight(highlight)
    setModalType(highlight.type)
    setIsModalOpen(true)
  }

  const handleToggle = async (highlight: SerializedHighlight) => {
    setIsTogglingId(highlight.id)
    await toggleHighlightActive(highlight.id, highlight.active)
    setIsTogglingId(null)
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o destaque "${title}"?`)) {
      await deleteHighlight(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Abas e CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-brand-dark)] font-medium">
            Personalização Visual
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Gerencie os banners do Carrossel Hero e os Destaques Circulares da vitrine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'HERO' ? (
            <button
              onClick={() => handleOpenCreate('HERO_SLIDE')}
              className="bg-[var(--color-brand-green-deep)] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Novo Slide Hero
            </button>
          ) : (
            <button
              onClick={() => handleOpenCreate('STORY_CIRCLE')}
              className="bg-[var(--color-brand-green-deep)] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Novo Story
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('HERO')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'HERO'
              ? 'border-[var(--color-brand-green-deep)] text-[var(--color-brand-green-deep)]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Carrossel Hero ({heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab('STORIES')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'STORIES'
              ? 'border-[var(--color-brand-green-deep)] text-[var(--color-brand-green-deep)]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Destaques Stories ({storyCircles.length})
        </button>
      </div>

      {/* ABA 1: CARROSSEL HERO */}
      {activeTab === 'HERO' && (
        <div className="space-y-4">
          {heroSlides.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-sm border border-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium text-sm">Nenhum slide cadastrado no Hero.</p>
              <p className="text-xs text-gray-400 mt-1">Cadastre banners em alta resolução para a tela inicial.</p>
              <button
                onClick={() => handleOpenCreate('HERO_SLIDE')}
                className="mt-4 inline-flex items-center gap-2 bg-[var(--color-brand-green-deep)] text-white px-4 py-2 text-xs font-bold uppercase rounded-sm"
              >
                <Plus className="w-4 h-4" /> Criar Primeiro Slide
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {heroSlides.map((slide) => (
                <div 
                  key={slide.id}
                  className={`bg-white rounded-md border overflow-hidden shadow-xs transition-all ${
                    slide.active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
                  }`}
                >
                  {/* Banner Preview */}
                  <div className="relative aspect-[16/8] bg-gray-100">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                      <h3 className="font-serif text-lg font-bold leading-tight">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-xs text-gray-200 line-clamp-1 mt-0.5">{slide.subtitle}</p>
                      )}
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                        Ordem #{slide.order}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider ${
                        slide.active ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {slide.active ? 'Ativo' : 'Oculto'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Info Footer */}
                  <div className="p-4 flex items-center justify-between gap-4 border-t border-gray-100">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Link de Destino</span>
                      <a 
                        href={slide.linkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-[var(--color-brand-green-deep)] font-medium truncate flex items-center gap-1 hover:underline"
                      >
                        {slide.linkUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(slide)}
                        disabled={isTogglingId === slide.id}
                        title={slide.active ? 'Ocultar slide' : 'Ativar slide'}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-sm transition-colors"
                      >
                        {slide.active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(slide)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-sm transition-colors"
                        title="Editar slide"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id, slide.title)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                        title="Excluir slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: STORIES CIRCULARES */}
      {activeTab === 'STORIES' && (
        <div className="space-y-4">
          {storyCircles.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-sm border border-gray-200">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium text-sm">Nenhum story circular cadastrado.</p>
              <p className="text-xs text-gray-400 mt-1">Crie bolinhas de destaques para guiar as clientes por categorias.</p>
              <button
                onClick={() => handleOpenCreate('STORY_CIRCLE')}
                className="mt-4 inline-flex items-center gap-2 bg-[var(--color-brand-green-deep)] text-white px-4 py-2 text-xs font-bold uppercase rounded-sm"
              >
                <Plus className="w-4 h-4" /> Criar Primeiro Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {storyCircles.map((story) => (
                <div
                  key={story.id}
                  className={`bg-white p-4 rounded-md border flex flex-col items-center text-center shadow-xs transition-all ${
                    story.active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
                  }`}
                >
                  {/* Story Circle Preview */}
                  <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-[var(--color-brand-green-deep)] ring-2 ring-[var(--color-brand-ivory)] shadow-sm mb-3">
                    <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-white">
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[var(--color-brand-dark)] truncate max-w-full">
                    {story.title}
                  </span>

                  <span className="text-[10px] text-gray-400 truncate max-w-full mt-0.5">
                    {story.linkUrl}
                  </span>

                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-xs">
                      #{story.order}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs ${
                      story.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {story.active ? 'Ativo' : 'Oculto'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100 w-full">
                    <button
                      onClick={() => handleToggle(story)}
                      disabled={isTogglingId === story.id}
                      className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-sm transition-colors"
                      title={story.active ? 'Ocultar' : 'Ativar'}
                    >
                      {story.active ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(story)}
                      className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-sm transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <HighlightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedHighlight}
        defaultType={modalType}
      />
    </div>
  )
}
