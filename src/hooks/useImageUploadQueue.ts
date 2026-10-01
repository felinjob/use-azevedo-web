import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface QueueImage {
  id: string
  file: File
  previewUrl: string
  status: 'idle' | 'uploading' | 'success' | 'error' | 'waiting_network'
  progress: number
  publicUrl?: string
  errorMessage?: string
  retryCount: number
}

export function useImageUploadQueue() {
  const [queue, setQueue] = useState<QueueImage[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isOnline) {
      setQueue(prev => prev.map(img => 
        (img.status === 'uploading' || img.status === 'idle') 
          ? { ...img, status: 'waiting_network' } 
          : img
      ))
      return
    }

    const processQueue = async () => {
      const pendingUploads = queue.filter(img => 
        img.status === 'idle' || 
        img.status === 'waiting_network'
      )

      for (const img of pendingUploads) {
        uploadImage(img.id)
      }
    }

    processQueue()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, isOnline])

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addImagesToQueue = (files: File[]) => {
    const newImages: QueueImage[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: isOnline ? 'idle' : 'waiting_network',
      progress: 0,
      retryCount: 0
    }))

    setQueue(prev => [...prev, ...newImages])
  }

  const removeImageFromQueue = (id: string) => {
    setQueue(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.previewUrl) {
        URL.revokeObjectURL(img.previewUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const uploadImage = async (id: string) => {
    // Avoid double processing
    let shouldUpload = false
    setQueue(prev => {
      const img = prev.find(i => i.id === id)
      if (!img || img.status === 'uploading' || img.status === 'success') return prev
      shouldUpload = true
      return prev.map(i => i.id === id ? { ...i, status: 'uploading', progress: 10 } : i)
    })

    if (!shouldUpload) return

    const targetImg = queue.find(i => i.id === id)
    if (!targetImg) return

    const file = targetImg.file

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    try {
      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      setQueue(prev => prev.map(i => i.id === id ? { ...i, progress: 80 } : i))

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setQueue(prev => prev.map(i => i.id === id ? { 
        ...i, 
        status: 'success', 
        progress: 100, 
        publicUrl 
      } : i))

    } catch (err) {
      const isNetworkError = err instanceof Error && (err.message === 'Failed to fetch' || err.name === 'TypeError')
      
      setQueue(prev => {
        const img = prev.find(i => i.id === id)
        if (!img) return prev

        if (isNetworkError && !navigator.onLine) {
          return prev.map(i => i.id === id ? { ...i, status: 'waiting_network' } : i)
        }

        const newRetryCount = img.retryCount + 1
        if (newRetryCount < 3) {
          const delay = Math.pow(2, newRetryCount - 1) * 1000
          setTimeout(() => {
            setQueue(q => q.map(i => i.id === id ? { ...i, status: 'idle' } : i))
          }, delay)
          return prev.map(i => i.id === id ? { ...i, status: 'error', retryCount: newRetryCount, errorMessage: 'Tentando novamente...' } : i)
        }

        return prev.map(i => i.id === id ? { ...i, status: 'error', errorMessage: 'Falha no upload.' } : i)
      })
    }
  }

  const retryUpload = (id: string) => {
    setQueue(prev => prev.map(i => i.id === id ? { ...i, status: 'idle', retryCount: 0, errorMessage: undefined } : i))
  }

  return {
    queue,
    addImagesToQueue,
    removeImageFromQueue,
    retryUpload,
    isOnline
  }
}
