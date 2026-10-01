'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadCloud, X, Loader2, GripVertical, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react'
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

  useEffect(() => {
    if (onQueueStatusChange) {
      const isPending = queue.some(img => img.status === 'uploading' || img.status === 'waiting_network' || img.status === 'idle')
      const completed = queue.filter(img => img.status === 'success').length
      const urls = queue.filter(img => img.status === 'success' && img.publicUrl).map(img => img.publicUrl as string)
      onQueueStatusChange(isPending, completed, queue.length, urls)
    }
  }, [queue, onQueueStatusChange])

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
        className="border-2 border-dashed border-gray-300 rounded-sm p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">Clique para fazer upload das fotos</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP. Múltiplos arquivos permitidos.</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-[3/4] bg-gray-100 border border-gray-200 group rounded-sm overflow-hidden">
              <Image 
                src={url}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Badge for cover image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[var(--color-brand-green-deep)] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 z-10 rounded-sm">
                  Capa
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center bg-black/60 rounded p-1">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveImage(index, 'up') }}
                    disabled={index === 0}
                    className="text-white disabled:opacity-30 hover:text-[var(--color-brand-gold)] px-1"
                  >
                    &larr;
                  </button>
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveImage(index, 'down') }}
                    disabled={index === images.length - 1}
                    className="text-white disabled:opacity-30 hover:text-[var(--color-brand-gold)] px-1"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Queue Items */}
          {queue.map((item, index) => (
            <div key={item.id} className="relative aspect-[3/4] bg-gray-100 border border-gray-200 rounded-sm overflow-hidden flex flex-col">
              <div className="relative flex-1">
                <Image 
                  src={item.previewUrl}
                  alt={`Upload ${index}`}
                  fill
                  className={`object-cover ${item.status === 'success' ? '' : 'opacity-60'}`}
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  {item.status === 'uploading' && (
                    <div className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {item.progress}%
                    </div>
                  )}
                  {item.status === 'waiting_network' && (
                    <div className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> Rede
                    </div>
                  )}
                  {item.status === 'success' && (
                    <div className="bg-[var(--color-brand-green-deep)] text-white text-[10px] font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pronta
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm flex flex-col gap-1">
                      <span className="flex items-center gap-1"><X className="w-3 h-3" /> Erro</span>
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImageFromQueue(item.id) }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors ml-auto shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {item.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); retryUpload(item.id) }}
                      className="bg-white text-red-500 px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1 hover:bg-gray-100"
                    >
                      <RefreshCw className="w-3 h-3" /> Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              {item.status !== 'success' && item.status !== 'error' && (
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
