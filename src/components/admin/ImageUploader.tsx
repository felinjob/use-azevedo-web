'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UploadCloud, X, Loader2, GripVertical } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        alert('Erro ao fazer upload da imagem.')
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path)
        newUrls.push(publicUrl)
      }
    }

    onChange([...images, ...newUrls])
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = async (index: number) => {
    // Note: We don't delete from storage here to prevent accidental deletion 
    // before the form is saved, we just remove from the array.
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
        {isUploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">Enviando imagens...</span>
          </div>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Clique para fazer upload das fotos</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP. Múltiplos arquivos permitidos.</p>
          </>
        )}
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
      {images.length > 0 && (
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
                    onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center bg-black/60 rounded p-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveImage(index, 'up') }}
                    disabled={index === 0}
                    className="text-white disabled:opacity-30 hover:text-[var(--color-brand-gold)] px-1"
                  >
                    &larr;
                  </button>
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <button 
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
        </div>
      )}
    </div>
  )
}
