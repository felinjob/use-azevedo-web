'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    // 1. Atualização periódica apenas se a aba estiver visível e ativa
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        router.refresh()
      }
    }, intervalMs)

    // 2. Quando o usuário voltar para a aba do painel (foco), atualiza imediatamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router, intervalMs])

  return null
}
