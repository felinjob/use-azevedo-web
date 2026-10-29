'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'
import type { SerializedProduct } from '@/lib/serializers'
import { formatCurrency, formatCurrencyValue } from '@/lib/formatters'

interface ProductCardProps {
  product: SerializedProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const priceNum = Number(product.price)
  const installmentValue = formatCurrencyValue(priceNum / 12)

  const uniqueColorsMap = new Map<string, string>()
  if (product.variants) {
    product.variants.forEach(v => {
      const cName = v.color?.trim()
      if (cName && !uniqueColorsMap.has(cName)) {
        uniqueColorsMap.set(cName, (v.colorHex || '#141414').trim())
      }
    })
  }
  const uniqueColors = Array.from(uniqueColorsMap.entries())
  const [selectedColor, setSelectedColor] = useState<string>(
    uniqueColors.length > 0 ? uniqueColors[0][0] : ''
  )

  const activeColor =
    selectedColor && uniqueColorsMap.has(selectedColor)
      ? selectedColor
      : uniqueColors[0]?.[0] || ''

  const variantsForColor = activeColor
    ? product.variants.filter(v => v.color?.trim() === activeColor)
    : product.variants

  const sortedVariants = [...variantsForColor].sort((a, b) => {
    const aNum = parseInt(a.size)
    const bNum = parseInt(b.size)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    return a.size.localeCompare(b.size)
  })

  const primaryImage = product.images[0]
  const secondaryImage = product.images[1] || product.images[0]

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    
    const variant =
      variantsForColor.find(v => v.size === size) ||
      product.variants.find(v => v.size === size)
    if (isReadyToShip && variant && variant.stockQuantity <= 0) {
      setIsAdding(false)
      return
    }

    const variantId = variant?.id || `${product.id || product.slug}-${activeColor}-${size}`

    addItem({
      productId: product.id || product.slug,
      variantId: variantId,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      image: primaryImage,
      size: size,
      color: variant?.color || activeColor || 'Padrão',
      availability: product.availability as 'READY_TO_SHIP' | 'MADE_TO_ORDER',
      productionTimeDays: product.availability === 'MADE_TO_ORDER' ? (product.productionTimeDays || 7) : 0,
      quantity: 1,
      maxStock: variant?.stockQuantity || 10
    })
    
    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 250)
  }

  const safeSlug = product.slug || product.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  return (
    <Link href={`/produto/${safeSlug}`} className="group flex flex-col gap-2.5">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFECE6] rounded-sm">
        {primaryImage && (
          <div className="w-full h-full relative">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className={cn(
                "object-cover object-center transition-all duration-500 ease-out",
                secondaryImage !== primaryImage ? "group-hover:opacity-0" : "group-hover:scale-105"
              )}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
            {secondaryImage !== primaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} - Detalhe`}
                fill
                className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            )}
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && Number(product.originalPrice) > priceNum && (
          <span className="absolute top-2.5 left-2.5 bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs z-10">
            -{Math.round(((Number(product.originalPrice) - priceNum) / Number(product.originalPrice)) * 100)}%
          </span>
        )}

        {/* Quick Add Sizes Hover (Desktop) */}
        {sortedVariants.length > 0 && (
          <div className="hidden sm:block absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 text-center border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] text-[var(--color-brand-muted)] font-bold mb-2 uppercase tracking-wider truncate">
              Adicionar Rápido {activeColor ? `• ${activeColor}` : ''}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {sortedVariants.map(v => {
                const outOfStock = isReadyToShip && v.stockQuantity <= 0
                return (
                  <button 
                    key={`${v.color}-${v.size}`}
                    onClick={(e) => handleQuickAdd(e, v.size)}
                    disabled={isAdding || outOfStock}
                    title={outOfStock ? 'Esgotado nesta cor' : `Adicionar Tam ${v.size} (${activeColor})`}
                    className={cn(
                      "min-w-8 h-8 px-1.5 text-xs font-semibold border rounded-xs transition-colors",
                      outOfStock
                        ? "border-gray-200 text-gray-300 line-through cursor-not-allowed bg-gray-50"
                        : "border-[var(--color-brand-muted)]/30 text-[var(--color-brand-dark)] hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-ivory)]"
                    )}
                  >
                    {v.size}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start px-0.5 mt-1">
        <span className={cn(
          "text-[10px] md:text-[11px] font-bold tracking-wider uppercase mb-1 flex items-center gap-1",
          isReadyToShip 
            ? "text-[var(--color-brand-green-deep)]" 
            : "text-[var(--color-brand-gold)]"
        )}>
          {isReadyToShip ? <span className="text-[14px] leading-none mb-0.5">•</span> : <span className="text-[11px] leading-none">✦</span>}
          {isReadyToShip ? 'Pronta Entrega' : 'Sob Encomenda'}
        </span>
        
        <h3 className="text-sm md:text-[15px] font-medium text-[var(--color-brand-dark)] group-hover:text-[var(--color-brand-green-deep)] transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="mt-1 flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] md:text-base font-bold text-[var(--color-brand-dark)]">
              {formatCurrency(priceNum)}
            </span>
            {product.originalPrice && Number(product.originalPrice) > priceNum && (
              <span className="text-[11px] md:text-xs text-[var(--color-brand-muted)] line-through">
                {formatCurrency(Number(product.originalPrice))}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-[var(--color-brand-muted)]">
            ou em até 12x de R$ {installmentValue}
          </span>
        </div>

        {uniqueColors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {uniqueColors.map(([colorName, colorHex]) => {
              const isSelected = activeColor === colorName
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedColor(colorName)
                  }}
                  title={colorName}
                  aria-label={`Cor ${colorName}`}
                  className={cn(
                    "w-4 h-4 rounded-full border transition-all",
                    isSelected
                      ? "ring-1 ring-offset-1 ring-[var(--color-brand-green-deep)] border-white scale-110"
                      : "border-black/20 hover:scale-110"
                  )}
                  style={{ backgroundColor: colorHex }}
                />
              )
            })}
            {uniqueColors.length > 1 && (
              <span className="text-[10px] text-[var(--color-brand-muted)] ml-1">
                {activeColor}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

