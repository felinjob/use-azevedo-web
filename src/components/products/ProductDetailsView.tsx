'use client'

import { useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import SizeGuideModal from './SizeGuideModal'
import FitFinderModal from './FitFinderModal'
import ProductFAQ from './ProductFAQ'
import { MessageCircle, ShoppingBag, Truck, ArrowLeftRight, AlertCircle, Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { SerializedProduct } from '@/lib/serializers'
import {
  parseFabricAndFitMeta,
  subscribeToFitProfile,
  getSavedFitSizeSnapshot,
  getServerFitSizeSnapshot,
} from '@/lib/fit-meta'

interface ProductDetailsViewProps {
  product: SerializedProduct
}

export default function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const validImages = (product.images || []).filter((img) => {
    const url = typeof img === 'string' ? img : (img as { url?: string })?.url;
    return Boolean(
      url &&
      typeof url === 'string' &&
      url.trim().length > 0 &&
      !url.includes('undefined') &&
      !url.includes('null')
    );
  }) as string[];

  const [activeImage, setActiveImage] = useState(validImages[0] || '')

  const hasOnlyTamanhoUnico = product.variants.length === 1 && product.variants[0].size === 'Tamanho Único'
  const [userSelectedSize, setSelectedSize] = useState<string>(hasOnlyTamanhoUnico ? 'Tamanho Único' : '')
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transform: 'scale(1)' })

  // Extract unique colors
  const uniqueColorsMap = new Map<string, string>()
  product.variants.forEach(v => {
    if (v.color && v.colorHex) {
      uniqueColorsMap.set(v.color, v.colorHex)
    }
  })
  const uniqueColors = Array.from(uniqueColorsMap.entries())
  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors.length > 0 ? uniqueColors[0][0] : 'Única')

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [isFitFinderOpen, setIsFitFinderOpen] = useState(false)
  const [showSizeError, setShowSizeError] = useState(false)

  const savedProfileSize = useSyncExternalStore(
    subscribeToFitProfile,
    getSavedFitSizeSnapshot,
    getServerFitSizeSnapshot
  )

  const selectedSize =
    userSelectedSize ||
    (savedProfileSize &&
    product.variants.some(
      v => v.color === selectedColor && v.size === savedProfileSize && v.stockQuantity > 0
    )
      ? savedProfileSize
      : '')

  const { fabricText, fitMeta, hasAnyFitMeta } = parseFabricAndFitMeta(product.fabricDetails)

  const { addItem, openCart } = useCartStore()

  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const priceNum = Number(product.price)
  const installmentValue = (priceNum / 12).toFixed(2).replace('.', ',')

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
    const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor)

    if (variant) {
      addItem({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        price: priceNum,
        image: product.images[0] || '',
        size: selectedSize,
        color: selectedColor,
        availability: product.availability as 'READY_TO_SHIP' | 'MADE_TO_ORDER',
        productionTimeDays: product.productionTimeDays,
        quantity: 1,
        maxStock: variant.stockQuantity,
      })
      openCart()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    // Only zoom on desktop (assumed by having mouse events, but you can refine logic if needed)
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

      {/* Image Gallery */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0 no-scrollbar">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative w-20 h-28 md:w-full md:h-32 flex-shrink-0 border-2 transition-all overflow-hidden",
                  activeImage === img ? "border-[var(--color-brand-green-deep)]" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div
          className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden cursor-crosshair group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {activeImage && (
            <div
              className="absolute inset-0 w-full h-full transition-transform duration-200 ease-out"
              style={zoomStyle}
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
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

        {/* Color Swatches */}
        {uniqueColors.length > 0 && (
          <div className="mb-8">
            <span className="block text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
              Cores Disponíveis: <span className="font-normal text-[#4A4A4A] capitalize">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {uniqueColors.map(([colorName, colorHex]) => (
                <button
                  key={colorName}
                  onClick={() => {
                    setSelectedColor(colorName)
                    // Verifica se o tamanho atual existe na nova cor
                    const sizeExistsInNewColor = product.variants.some(v => v.color === colorName && v.size === selectedSize)
                    if (!sizeExistsInNewColor) {
                      setSelectedSize('')
                    }
                  }}
                  title={colorName}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    selectedColor === colorName ? "border-[var(--color-brand-green-deep)]" : "border-transparent hover:border-gray-300"
                  )}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-black/10"
                    style={{ backgroundColor: colorHex }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variáveis dinâmicas para a cor selecionada */}
        {(() => {
          const variantsForColor = product.variants.filter(v => v.color === selectedColor)

          const sortedVariants = [...variantsForColor].sort((a, b) => {
            const aNum = parseInt(a.size)
            const bNum = parseInt(b.size)
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
            return a.size.localeCompare(b.size)
          })

          const sizeStockMap = new Map<string, number>()
          sortedVariants.forEach(v => {
            sizeStockMap.set(v.size, (sizeStockMap.get(v.size) || 0) + v.stockQuantity)
          })
          const uniqueSizes = Array.from(sizeStockMap.keys())

          return (
            <div id="size-selector" className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-dark)]">
                  Tamanho
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFitFinderOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-dark)] font-bold tracking-wide uppercase transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Qual o meu tamanho ideal?
                  </button>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-[var(--color-brand-dark)] hover:text-black font-bold tracking-wide uppercase underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Tabela de Medidas
                  </button>
                </div>
              </div>

              {savedProfileSize && selectedSize === savedProfileSize && (
                <div className="mb-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-200/80 text-[var(--color-brand-green-deep)] px-2.5 py-1 rounded-xs text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Tamanho {savedProfileSize} selecionado pelo seu Consultor de Caimento</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {uniqueSizes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nenhum tamanho disponível para esta cor.</p>
                ) : (
                  uniqueSizes.map((size) => {
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
                  })
                )}
              </div>
              {showSizeError && (
                <p className="text-red-500 text-xs mt-3 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  Por favor, selecione um tamanho antes de adicionar à sacola.
                </p>
              )}
            </div>
          )
        })()}

        {/* Availability Card (replaces the badge) */}
        <div className={cn(
          "flex flex-col gap-1 p-4 mb-8 border-l-4 rounded-r-md bg-white shadow-2xs border border-l-0 border-t-gray-100 border-r-gray-100 border-b-gray-100",
          isReadyToShip
            ? "border-l-[var(--color-brand-green-deep)]"
            : "border-l-[var(--color-brand-gold)]"
        )}>
          <span className="text-sm font-bold text-[var(--color-brand-dark)]">
            {isReadyToShip ? "Peça a Pronta Entrega" : `Confecção Sob Encomenda (${product.productionTimeDays || 7} dias úteis)`}
          </span>
          <p className="text-[13px] text-[var(--color-brand-muted)]">
            {isReadyToShip
              ? "Envio ágil em até 24h úteis após a aprovação do pagamento."
              : `Produzida especialmente para você em nosso ateliê. O prazo de confecção (${product.productionTimeDays || 7} dias úteis) já é somado automaticamente ao cálculo do frete.`
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-10">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-dark)] text-[var(--color-brand-ivory)] font-bold py-4 px-6 tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 shadow-md rounded-xs"
          >
            <ShoppingBag className="w-5 h-5" />
            Adicionar à Sacola
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="w-full border border-[var(--color-brand-green-deep)]/40 hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)]/5 text-[var(--color-brand-green-deep)] text-xs font-bold py-3.5 px-6 tracking-widest uppercase transition-colors flex items-center justify-center gap-2 rounded-xs"
          >
            <MessageCircle className="w-4 h-4" />
            Consultoria de Caimento via WhatsApp
          </button>
        </div>

        {/* Description */}
        {product.description?.trim() && (
          <div className="prose prose-sm text-[var(--color-brand-dark)]/85 max-w-none mb-8 leading-relaxed">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Composição & Toque Sensorial — Só aparece se a administradora preencher o campo */}
        {fabricText && (
          <div className="bg-white border border-[var(--color-brand-muted)]/20 p-5 rounded-sm mb-6 shadow-2xs">
            <h4 className="text-xs font-bold text-[var(--color-brand-green-deep)] uppercase tracking-wider mb-2">
              Composição & Toque Sensorial
            </h4>
            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">{fabricText}</p>
          </div>
        )}

        {/* Raio-X do Caimento — Só aparece se a administradora marcar alguma opção no painel */}
        {hasAnyFitMeta && (
          <div className="bg-[var(--color-brand-canvas)] border border-[var(--color-brand-muted)]/25 p-5 rounded-sm mb-8 space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
              Comportamento no Corpo
            </h4>

            {fitMeta.stretch && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">Elasticidade:</span>
                  <span className="font-bold text-[var(--color-brand-green-deep)]">
                    {fitMeta.stretch === 'none'
                      ? 'Sem Elastano (Tecido Plano Estruturado)'
                      : fitMeta.stretch === 'moderate'
                        ? 'Elasticidade Leve / Confortável'
                        : 'Alta Elasticidade (Com Elastano)'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-brand-green-deep)] rounded-full transition-all"
                    style={{
                      width:
                        fitMeta.stretch === 'none'
                          ? '25%'
                          : fitMeta.stretch === 'moderate'
                            ? '60%'
                            : '100%',
                    }}
                  />
                </div>
              </div>
            )}

            {fitMeta.fitStyle && (
              <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200/60">
                <span className="font-semibold text-gray-700">Modelagem:</span>
                <span className="font-bold text-[var(--color-brand-dark)]">
                  {fitMeta.fitStyle === 'structured'
                    ? 'Mais Ajustada ao Corpo'
                    : fitMeta.fitStyle === 'tailored'
                      ? 'Acinturada com Quadril Soltinho'
                      : 'Fluida / Soltinha (Não marca)'}
                </span>
              </div>
            )}

            {fitMeta.highlights && fitMeta.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60">
                {fitMeta.highlights.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white border border-[var(--color-brand-muted)]/25 text-[var(--color-brand-dark)] px-2.5 py-1 rounded-full text-[11px] font-medium"
                  >
                    <Check className="w-3 h-3 text-[var(--color-brand-green-deep)]" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <ProductFAQ />

        {/* Policies */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[var(--color-brand-green-deep)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--color-brand-dark)]">Entrega para todo o Brasil & Motoboy RJ</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Frete PAC grátis acima de R$ 199 no PIX ou R$ 299 no Cartão. Motoboy expresso disponível na capital do RJ.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowLeftRight className="w-5 h-5 text-[var(--color-brand-green-deep)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[var(--color-brand-dark)]">Primeira troca por nossa conta</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução com total tranquilidade.</p>
            </div>
          </div>
        </div>

      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        variants={product.variants}
      />

      <FitFinderModal
        isOpen={isFitFinderOpen}
        onClose={() => setIsFitFinderOpen(false)}
        variants={product.variants}
        onSelectSize={(size) => {
          setSelectedSize(size)
          setShowSizeError(false)
        }}
      />
    </div>
  )
}
