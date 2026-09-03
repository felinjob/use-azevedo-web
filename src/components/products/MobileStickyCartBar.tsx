'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { Prisma } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileStickyCartBarProps {
  product: {
    id: string
    name: string
    slug: string
    price: Prisma.Decimal | number
    images: string[]
    availability: string
    variants: { id: string, size: string, color?: string, stockQuantity?: number }[]
  }
}

export default function MobileStickyCartBar({ product }: MobileStickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, openCart } = useCartStore()

  const priceNum = typeof product.price === 'number' ? product.price : Number(product.price)
  const sizes = Array.from(new Set(product.variants.map(v => v.size))).sort()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past the main product info (approx 800px)
      setIsVisible(window.scrollY > 800)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAdd = () => {
    if (!selectedSize) return

    setIsAdding(true)
    const variant = product.variants.find(v => v.size === selectedSize)
    const variantId = variant?.id || `${product.id}-${selectedSize}`

    addItem({
      productId: product.id,
      variantId: variantId,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      image: product.images[0],
      size: selectedSize,
      color: variant?.color || 'Padrão',
      availability: product.availability as 'READY_TO_SHIP' | 'MADE_TO_ORDER',
      productionTimeDays: product.availability === 'MADE_TO_ORDER' ? 15 : 0, // Mock fallback
      quantity: 1,
      maxStock: variant?.stockQuantity || 10
    })

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="md:hidden fixed bottom-16 left-0 right-0 bg-[var(--color-brand-canvas)] border-t border-[var(--color-brand-muted)]/15 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3 pb-safe"
        >
          <div className="flex items-center gap-3">
            {/* Image */}
            <div className="relative w-12 h-16 bg-gray-100 flex-shrink-0">
              {product.images[0] && (
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
              )}
            </div>

            {/* Info & Selectors */}
            <div className="flex-1 flex flex-col justify-between h-16">
              <p className="text-[11px] font-bold text-[var(--color-brand-dark)] line-clamp-1">{product.name}</p>
              
              <div className="flex items-center justify-between gap-2 mt-1">
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="flex-1 text-xs border border-[var(--color-brand-muted)]/30 rounded-sm px-2 py-2 bg-[var(--color-brand-canvas)] focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                >
                  <option value="" disabled>Tamanho</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>

                <button 
                  onClick={handleAdd}
                  disabled={!selectedSize || isAdding}
                  className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {isAdding ? '...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
