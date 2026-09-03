'use client'

import { useState } from 'react'
import Image from 'next/image'
import SizeGuideModal from './SizeGuideModal'
import { MessageCircle, ShoppingBag, Truck, ArrowLeftRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { SerializedProduct, SerializedVariant } from '@/lib/serializers'

interface ProductDetailsViewProps {
  product: SerializedProduct
}

export default function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const [activeImage, setActiveImage] = useState(product.images[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [showSizeError, setShowSizeError] = useState(false)

  const { addItem, openCart } = useCartStore()

  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const priceNum = Number(product.price)
  const installmentValue = (priceNum / 12).toFixed(2).replace('.', ',')

  // Sorting and deduplicating sizes for the selector
  const sortedVariants = [...product.variants].sort((a, b) => {
    const aNum = parseInt(a.size)
    const bNum = parseInt(b.size)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    return a.size.localeCompare(b.size)
  })
  
  // Create a map to ensure unique sizes and their total stock
  const sizeStockMap = new Map<string, number>()
  const sizeVariantMap = new Map<string, SerializedVariant>()
  
  sortedVariants.forEach(v => {
    sizeStockMap.set(v.size, (sizeStockMap.get(v.size) || 0) + v.stockQuantity)
    if (!sizeVariantMap.has(v.size)) {
      sizeVariantMap.set(v.size, v)
    }
  })

  const uniqueSizes = Array.from(sizeStockMap.keys())

  const handleWhatsAppClick = () => {
    const text = `Olá, Amanda! Estou na loja olhando o ${product.name} no tamanho ${selectedSize || '[Não Selecionado]'} e gostaria de uma ajuda com o caimento.`
    window.open(`https://wa.me/5521978594358?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true)
      // Scroll to size selector smoothly
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setShowSizeError(false)
    const variant = sizeVariantMap.get(selectedSize)
    
    if (variant) {
      addItem({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        price: priceNum,
        image: product.images[0] || '',
        size: selectedSize,
        color: 'Única', // Could be dynamic if colors exist
        availability: product.availability as 'READY_TO_SHIP' | 'MADE_TO_ORDER',
        productionTimeDays: product.productionTimeDays,
        quantity: 1,
        maxStock: variant.stockQuantity,
      })
      openCart()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      
      {/* Image Gallery */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0 no-scrollbar">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-20 h-28 md:w-full md:h-32 flex-shrink-0 border-2 transition-all overflow-hidden",
                  activeImage === img ? "border-[var(--color-brand-gold)]" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
        
        {/* Main Image */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
          {activeImage && (
            <Image 
              src={activeImage} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col py-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-muted)] mb-3">
          {product.category.name}
        </span>
        
        <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-4">
          {product.name}
        </h1>
        
        <div className="flex items-end gap-3 mb-6">
          <span className="text-2xl font-bold text-[var(--color-brand-green-deep)]">
            R$ {priceNum.toFixed(2).replace('.', ',')}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-[var(--color-brand-muted)] line-through mb-0.5">
              R$ {Number(product.originalPrice).toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
        
        <p className="text-sm text-[var(--color-brand-muted)] mb-8">
          ou em até <strong>12x de R$ {installmentValue}</strong> no cartão de crédito
        </p>

        {/* Availability Badge */}
        <div className={cn(
          "inline-flex items-center self-start px-4 py-2 mb-8 text-sm font-semibold border",
          isReadyToShip 
            ? "bg-[var(--color-brand-green-deep)]/10 border-[var(--color-brand-green-deep)]/20 text-[var(--color-brand-green-deep)]" 
            : "bg-[var(--color-brand-gold)]/10 border-[var(--color-brand-gold)]/30 text-[var(--color-brand-gold)]"
        )}>
          {isReadyToShip 
            ? "📦 Pronta Entrega - Despacho Imediato" 
            : `⏳ Sob Encomenda: Produzido especialmente para você em até ${product.productionTimeDays} dias úteis.`
          }
        </div>

        {/* Size Selector */}
        <div id="size-selector" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-dark)]">
              Tamanho
            </span>
            <button 
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs text-[var(--color-brand-gold)] hover:text-[var(--color-brand-gold-light)] font-bold tracking-wide uppercase underline underline-offset-4 transition-colors"
            >
              Descubra seu tamanho / Tabela
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {uniqueSizes.map((size) => {
              const stock = sizeStockMap.get(size) || 0
              const isOutOfStock = stock === 0
              
              return (
                <button
                  key={size}
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedSize(size)
                    setShowSizeError(false)
                  }}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center border transition-all text-sm font-bold rounded-sm",
                    isOutOfStock 
                      ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400 relative overflow-hidden before:absolute before:inset-0 before:border-t before:border-gray-300 before:rotate-45 before:scale-150" 
                      : selectedSize === size
                        ? "border-[var(--color-brand-green-deep)] bg-[var(--color-brand-green-deep)] text-white"
                        : "border-gray-300 hover:border-[var(--color-brand-green-deep)] text-[var(--color-brand-dark)]",
                    showSizeError && !selectedSize ? "border-red-500 animate-pulse" : ""
                  )}
                >
                  <span className="relative z-10">{size}</span>
                </button>
              )
            })}
          </div>
          {showSizeError && (
            <p className="text-red-500 text-xs mt-3 flex items-center gap-1 font-bold">
              <AlertCircle className="w-4 h-4" />
              Por favor, selecione um tamanho antes de adicionar à sacola.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-10">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[var(--color-brand-dark)] hover:bg-black text-white font-bold py-4 px-6 tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            Adicionar à Sacola
          </button>
          
          <button 
            onClick={handleWhatsAppClick}
            className="w-full border-2 border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-white text-[var(--color-brand-green-deep)] font-bold py-4 px-6 tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Dúvida no caimento? Fale com a Amanda
          </button>
        </div>

        {/* Description & Fabric */}
        <div className="prose prose-sm text-[var(--color-brand-muted)] max-w-none mb-8">
          <p>{product.description}</p>
        </div>

        <div className="bg-[var(--color-brand-offwhite)] border border-gray-200 p-5 rounded-sm mb-8">
          <h4 className="text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-wider mb-2">Composição & Sensorial</h4>
          <p className="text-sm text-[var(--color-brand-muted)]">{product.fabricDetails}</p>
        </div>

        {/* Policies */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[var(--color-brand-gold)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--color-brand-dark)]">Envio para todo o Brasil</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Entrega via Motoboy disponível para a capital do RJ.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowLeftRight className="w-5 h-5 text-[var(--color-brand-gold)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--color-brand-dark)]">Primeira troca grátis</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Você tem até 7 dias úteis para solicitar a troca ou devolução.</p>
            </div>
          </div>
        </div>

      </div>

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
        variants={product.variants} 
      />
    </div>
  )
}
