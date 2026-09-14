'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/lib/store/cart'

export default function OrderClientLogic() {
  const { clearCart } = useCartStore()
  const cleared = useRef(false)

  useEffect(() => {
    if (!cleared.current) {
      clearCart()
      cleared.current = true
    }
  }, [clearCart])

  return null // Headless component
}
