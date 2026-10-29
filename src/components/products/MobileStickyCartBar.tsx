'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { motion, AnimatePresence } from 'framer-motion'
import { SerializedProduct } from '@/lib/serializers'
import { formatCurrency } from '@/lib/formatters'

interface MobileStickyCartBarProps {
  product: SerializedProduct
}

export default function MobileStickyCartBar({ product }: MobileStickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, openCart } = useCartStore()

  const uniqueColors = Array.from(
    new Set(product.variants.map(v => v.color?.trim()).filter((c): c is string => Boolean(c)))
  )
  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>('')

  const activeColor = selectedColor && uniqueColors.includes(selectedColor) ? selectedColor : (uniqueColors[0] || '')
  const variantsForColor = activeColor
    ? product.variants.filter(v => v.color?.trim() === activeColor)
    : product.variants

  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const availableVariants = variantsForColor.filter(v => !isReadyToShip || v.stockQuantity > 0)
  const priceNum = Number(product.price)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 520)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAdd = () => {
    if (!selectedSize) return

    setIsAdding(true)
    const variant = variantsForColor.find(v => v.size === selectedSize) || product.variants.find(v => v.size === selectedSize)
    if (!variant) {
      setIsAdding(false)
      return
    }

    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      image: product.images[0] || '',
      size: selectedSize,
      color: variant.color || activeColor || 'Padrão',
      availability: product.availability as 'READY_TO_SHIP' | 'MADE_TO_ORDER',
      productionTimeDays: product.availability === 'MADE_TO_ORDER' ? (product.productionTimeDays || 7) : 0,
      quantity: 1,
      maxStock: variant.stockQuantity || 10
    })

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 250)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="md:hidden fixed bottom-16 left-0 right-0 bg-[var(--color-brand-canvas)]/95 backdrop-blur-md border-t border-[var(--color-brand-muted)]/20 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3"
        >
          <div className="flex items-center gap-3">
            {/* Image */}
            <div className="relative w-11 h-15 bg-gray-100 rounded-xs overflow-hidden shrink-0">
              {product.images[0] && (
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                  sizes="44px"
                />
              )}
            </div>

            {/* Info & Selectors */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[var(--color-brand-dark)] truncate">{product.name}</p>
                <span className="text-xs font-bold text-[var(--color-brand-green-deep)] shrink-0">
                  {formatCurrency(priceNum)}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 mt-1.5">
                {uniqueColors.length > 1 && (
                  <select
                    value={activeColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value)
                      setSelectedSize('')
                    }}
                    aria-label="Selecionar cor"
                    className="w-24 text-xs border border-[var(--color-brand-muted)]/30 rounded-xs px-1.5 py-2 bg-white text-[var(--color-brand-dark)] focus:outline-none focus:border-[var(--color-brand-green-deep)] truncate"
                  >
                    {uniqueColors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}

                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  aria-label="Selecionar tamanho"
                  className="flex-1 text-xs border border-[var(--color-brand-muted)]/30 rounded-xs px-2 py-2 bg-white text-[var(--color-brand-dark)] focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                >
                  <option value="" disabled>Tamanho</option>
                  {availableVariants.map(v => (
                    <option key={v.id} value={v.size}>Tam {v.size}</option>
                  ))}
                </select>

                <button 
                  onClick={handleAdd}
                  disabled={!selectedSize || isAdding}
                  className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] text-[10px] font-bold uppercase tracking-widest px-3.5 py-2.5 rounded-xs disabled:opacity-40 whitespace-nowrap"
                >
                  {isAdding ? '...' : 'Comprar'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

