'use client'

import { useRef, useEffect } from 'react'
import { UploadCloud, X, Loader2, GripVertical, RefreshCw, WifiOff, Star } from 'lucide-react'
import Image from 'next/image'
import { useImageUploadQueue } from '@/hooks/useImageUploadQueue'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  onQueueStatusChange?: (isPending: boolean, completed: number, total: number, urls: string[]) => void
}

export default function ImageUploader({ images, onChange, onQueueStatusChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { queue, addImagesToQueue, removeImageFromQueue, retryUpload } = useImageUploadQueue()

  const onChangeRef = useRef(onChange)
  const imagesRef = useRef(images)
  const onQueueStatusChangeRef = useRef(onQueueStatusChange)

  useEffect(() => {
    onChangeRef.current = onChange
    imagesRef.current = images
    onQueueStatusChangeRef.current = onQueueStatusChange
  })

  // Assim que um upload conclui com sucesso na fila, promove a URL direto para a galeria principal (images)
  // para que a administradora possa reordenar ou definir como Capa imediatamente.
  useEffect(() => {
    const succeeded = queue.filter(img => img.status === 'success' && img.publicUrl)
    if (succeeded.length > 0) {
      const currentImages = imagesRef.current
      const newUrls = succeeded
        .map(img => img.publicUrl as string)
        .filter(url => !currentImages.includes(url))

      if (newUrls.length > 0) {
        onChangeRef.current([...currentImages, ...newUrls])
      }
      succeeded.forEach(img => removeImageFromQueue(img.id))
      return
    }

    const cb = onQueueStatusChangeRef.current
    if (cb) {
      const isPending = queue.some(img => img.status === 'uploading' || img.status === 'waiting_network' || img.status === 'idle')
      const completed = queue.filter(img => img.status === 'success').length
      cb(isPending, completed, queue.length, [])
    }
  }, [queue, removeImageFromQueue])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    addImagesToQueue(Array.from(files))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const setAsCover = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const [selected] = newImages.splice(index, 1)
    newImages.unshift(selected)
    onChange(newImages)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === images.length - 1) return

    const newImages = [...images]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newImages[index]
    newImages[index] = newImages[targetIndex]
    newImages[targetIndex] = temp
    
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-canvas)]/60 transition-colors cursor-pointer flex flex-col items-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-8 h-8 text-[var(--color-brand-green-deep)] mb-2" />
        <p className="text-sm text-[var(--color-brand-dark)] font-semibold">Clique para adicionar fotos da peça</p>
        <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WEBP • A primeira foto será a capa na vitrine.</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          multiple 
          className="hidden" 
        />
      </div>

      {/* Gallery Preview */}
      {(images.length > 0 || queue.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative aspect-[3/4] bg-gray-100 border border-gray-200 group rounded-md overflow-hidden shadow-2xs">
              <Image 
                src={url}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
              
              {/* Badge for cover image */}
              {index === 0 ? (
                <div className="absolute top-2 left-2 bg-[var(--color-brand-green-deep)] text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 z-10 rounded-xs flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-current" /> Capa Principal
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAsCover(index) }}
                  className="absolute top-2 left-2 bg-black/65 hover:bg-[var(--color-brand-green-deep)] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 z-10 rounded-xs opacity-0 group-hover:opacity-100 transition-all"
                  title="Definir como foto principal"
                >
                  Tornar Capa
                </button>
              )}

              {/* Remove Button */}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors z-10 shadow-sm"
                title="Remover foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Reorder Bar */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/70 backdrop-blur-xs rounded-xs px-2 py-1 z-10">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveImage(index, 'up') }}
                  disabled={index === 0}
                  className="text-white disabled:opacity-30 hover:text-[var(--color-brand-ivory)] px-1.5 py-0.5 text-xs font-bold"
                  title="Mover para trás"
                >
                  &larr;
                </button>
                <span className="text-[10px] text-white/80 font-mono flex items-center gap-1">
                  <GripVertical className="w-3 h-3 text-white/50" /> #{index + 1}
                </span>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveImage(index, 'down') }}
                  disabled={index === images.length - 1}
                  className="text-white disabled:opacity-30 hover:text-[var(--color-brand-ivory)] px-1.5 py-0.5 text-xs font-bold"
                  title="Mover para frente"
                >
                  &rarr;
                </button>
              </div>
            </div>
          ))}

          {/* Active Upload Queue Items */}
          {queue.map((item, index) => (
            <div key={item.id} className="relative aspect-[3/4] bg-gray-100 border border-gray-200 rounded-md overflow-hidden flex flex-col">
              <div className="relative flex-1">
                <Image 
                  src={item.previewUrl}
                  alt={`Upload ${index}`}
                  fill
                  className="object-cover opacity-50"
                />
                
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  {(item.status === 'uploading' || item.status === 'idle') && (
                    <div className="bg-black/75 text-white text-[10px] font-bold px-2 py-1 rounded-xs flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enviando {item.progress}%
                    </div>
                  )}
                  {item.status === 'waiting_network' && (
                    <div className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-xs flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> Aguardando Rede
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-xs flex items-center gap-1">
                      <X className="w-3 h-3" /> Falha
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImageFromQueue(item.id) }}
                    className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors ml-auto shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {item.status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-3 text-center">
                    {item.errorMessage && (
                      <p className="text-white text-[11px] leading-tight font-medium">{item.errorMessage}</p>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); retryUpload(item.id) }}
                      className="bg-white text-red-600 px-3 py-1.5 rounded-xs text-xs font-bold flex items-center gap-1 hover:bg-gray-100"
                    >
                      <RefreshCw className="w-3 h-3" /> Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
              
              {item.status !== 'error' && (
                <div className="h-1.5 w-full bg-gray-200">
                  <div 
                    className="h-full bg-[var(--color-brand-green-deep)] transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

