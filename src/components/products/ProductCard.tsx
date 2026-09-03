'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id?: string;
    slug: string;
    name: string;
    price: Prisma.Decimal; 
    originalPrice?: Prisma.Decimal | null;
    availability: string;
    images: string[];
    variants: { id?: string, size: string, color?: string, stockQuantity?: number }[];
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const sizes = Array.from(new Set(product.variants.map(v => v.size))).sort()
  const priceNum = Number(product.price)
  const installmentValue = (priceNum / 12).toFixed(2).replace('.', ',')

  const primaryImage = product.images[0]
  const secondaryImage = product.images[1] || product.images[0]

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault() // Prevent Link click
    e.stopPropagation()
    setIsAdding(true)
    
    // Find the variant
    const variant = product.variants.find(v => v.size === size)
    const variantId = variant?.id || `${product.id || product.slug}-${size}`

    addItem({
      productId: product.id || product.slug,
      variantId: variantId,
      name: product.name,
      slug: product.slug,
      price: priceNum,
      image: primaryImage,
      size: size,
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
    <Link href={`/produto/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 rounded-sm">
        {primaryImage && (
          <div className="w-full h-full relative">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className={cn(
                "object-cover object-center transition-opacity duration-500 ease-in-out",
                secondaryImage !== primaryImage ? "group-hover:opacity-0" : "group-hover:scale-105 transition-transform"
              )}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
            {secondaryImage !== primaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} - Detalhe`}
                fill
                className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            )}
          </div>
        )}
        
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn(
            "text-[10px] font-bold tracking-wider px-2 py-1 uppercase shadow-sm rounded-sm",
            isReadyToShip 
              ? "bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]" 
              : "bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] border border-[var(--color-brand-muted)]/20"
          )}>
            {isReadyToShip ? 'Pronta Entrega' : 'Sob Encomenda'}
          </span>
        </div>

        {/* Quick Add Sizes Hover */}
        <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 text-center border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] text-[var(--color-brand-muted)] font-bold mb-2 uppercase tracking-wider">Adicionar Rápido</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {sizes.map(size => (
              <button 
                key={size}
                onClick={(e) => handleQuickAdd(e, size)}
                disabled={isAdding}
                className="w-8 h-8 md:w-9 md:h-9 text-xs font-semibold border border-[var(--color-brand-muted)]/30 rounded-sm hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-ivory)] transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start px-1">
        <h3 className="text-sm md:text-base font-medium text-[var(--color-brand-dark)] group-hover:opacity-70 transition-opacity line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[15px] md:text-lg font-bold text-[var(--color-brand-dark)]">
              R$ {priceNum.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] md:text-sm text-[var(--color-brand-muted)] line-through">
                R$ {Number(product.originalPrice).toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs text-[var(--color-brand-muted)]">
            ou 12x de R$ {installmentValue}
          </span>
        </div>
      </div>
    </Link>
  )
}
