import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react'
import { compressImage } from '@/lib/compress-image'

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

const MAX_AUTO_RETRIES = 3

class UploadError extends Error {
  constructor(message: string, public retryable: boolean) {
    super(message)
  }
}

/**
 * Envia o arquivo para /api/upload (rota autenticada que grava com a service role).
 * O upload direto do navegador para o Supabase não funciona porque o bucket
 * não possui políticas RLS de INSERT para usuários autenticados.
 * Usa XMLHttpRequest para reportar progresso real.
 */
function uploadViaApi(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new FormData()
    body.append('file', file)
    body.append('bucket', 'products')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.responseType = 'json'

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      const data = (xhr.response ?? {}) as { url?: string; error?: string }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) {
        resolve(data.url)
        return
      }
      // 4xx (exceto 408/429) são erros definitivos: não adianta tentar de novo.
      const retryable = xhr.status >= 500 || xhr.status === 408 || xhr.status === 429
      reject(new UploadError(data.error || `Falha no upload (HTTP ${xhr.status}).`, retryable))
    }

    xhr.onerror = () => reject(new UploadError('Falha de rede.', true))
    xhr.ontimeout = () => reject(new UploadError('Tempo esgotado.', true))
    xhr.timeout = 120_000

    xhr.send(body)
  })
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useImageUploadQueue() {
  const [rawQueue, setQueue] = useState<QueueImage[]>([])
  const isOnline = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)

  // IDs com upload em andamento. Fica num ref (síncrono) para evitar
  // disparos duplicados — o estado do React não é atualizado a tempo
  // quando vários arquivos são processados no mesmo ciclo.
  const inFlight = useRef<Set<string>>(new Set())
  const queueRef = useRef<QueueImage[]>([])
  useEffect(() => {
    queueRef.current = rawQueue
  }, [rawQueue])

  const patch = useCallback((id: string, changes: Partial<QueueImage>) => {
    setQueue(prev => prev.map(i => (i.id === id ? { ...i, ...changes } : i)))
  }, [])

  // Offline: itens ainda não enviados aparecem como "aguardando rede".
  const queue = useMemo(
    () => (isOnline ? rawQueue : rawQueue.map(img => (img.status === 'idle' ? { ...img, status: 'waiting_network' as const } : img))),
    [rawQueue, isOnline]
  )

  const uploadImage = useCallback(async (item: QueueImage) => {
    if (inFlight.current.has(item.id)) return
    inFlight.current.add(item.id)
    patch(item.id, { status: 'uploading', progress: 5, errorMessage: undefined })

    try {
      const compressed = await compressImage(item.file)
      patch(item.id, { progress: 15 })

      const publicUrl = await uploadViaApi(compressed, (pct) => {
        // 15% → 95% reservado para a transferência
        patch(item.id, { progress: 15 + Math.round(pct * 0.8) })
      })

      patch(item.id, { status: 'success', progress: 100, publicUrl })
    } catch (err) {
      const retryable = err instanceof UploadError ? err.retryable : true
      const message = err instanceof Error ? err.message : 'Falha no upload.'

      if (!navigator.onLine) {
        patch(item.id, { status: 'waiting_network' })
        return
      }

      const current = queueRef.current.find(i => i.id === item.id)
      const nextRetry = (current?.retryCount ?? 0) + 1

      if (retryable && nextRetry < MAX_AUTO_RETRIES) {
        patch(item.id, { status: 'error', retryCount: nextRetry, errorMessage: 'Tentando novamente...' })
        const delay = Math.pow(2, nextRetry - 1) * 1000
        setTimeout(() => patch(item.id, { status: 'idle' }), delay)
      } else {
        patch(item.id, { status: 'error', retryCount: nextRetry, errorMessage: message })
      }
    } finally {
      inFlight.current.delete(item.id)
    }
  }, [patch])

  // Processa itens pendentes sempre que a fila ou a conectividade mudar.
  useEffect(() => {
    if (!isOnline) return

    for (const img of rawQueue) {
      if ((img.status === 'idle' || img.status === 'waiting_network') && !inFlight.current.has(img.id)) {
        uploadImage(img)
      }
    }
  }, [rawQueue, isOnline, uploadImage])

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      queueRef.current.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      })
    }
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
