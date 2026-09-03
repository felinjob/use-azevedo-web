import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Prisma } from '@prisma/client'

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    price: Prisma.Decimal; // Prisma Decimal
    originalPrice?: Prisma.Decimal | null;
    availability: string;
    images: string[];
    variants: { size: string }[];
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const isReadyToShip = product.availability === 'READY_TO_SHIP'
  const sizes = Array.from(new Set(product.variants.map(v => v.size))).sort()
  const priceNum = Number(product.price)
  const installmentValue = (priceNum / 12).toFixed(2).replace('.', ',')

  return (
    <Link href={`/produto/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        )}
        
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn(
            "text-[0.65rem] font-bold tracking-wider px-2 py-1 uppercase shadow-sm",
            isReadyToShip 
              ? "bg-[var(--color-brand-green-deep)] text-white" 
              : "bg-[var(--color-brand-gold)] text-[var(--color-brand-dark)]"
          )}>
            {isReadyToShip ? 'Pronta Entrega' : 'Sob Encomenda'}
          </span>
        </div>

        {/* Sizes Hover */}
        <div className="absolute bottom-0 left-0 w-full bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out py-3 px-2 text-center border-t border-gray-200">
          <p className="text-xs text-[var(--color-brand-muted)] font-medium mb-1 uppercase tracking-wider">Tamanhos Disponíveis</p>
          <p className="text-sm font-semibold text-[var(--color-brand-dark)]">
            {sizes.join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start">
        <h3 className="text-sm md:text-base font-medium text-[var(--color-brand-dark)] group-hover:text-[var(--color-brand-gold)] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-brand-dark)]">
              R$ {priceNum.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-[var(--color-brand-muted)] line-through">
                R$ {Number(product.originalPrice).toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--color-brand-muted)]">
            ou 12x de R$ {installmentValue}
          </span>
        </div>
      </div>
    </Link>
  )
}
