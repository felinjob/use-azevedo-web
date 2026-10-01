import prisma from '@/lib/prisma'
import ProductCard from '@/components/products/ProductCard'
import Link from 'next/link'
import { serializeProduct } from '@/lib/serializers'

export default async function HomeFeaturedProducts({ isCatalogView }: { isCatalogView: boolean }) {
  if (isCatalogView) return null

  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: 'asc' },
    include: {
      category: true,
      variants: true,
    },
    take: 4,
  })

  if (featuredProducts.length === 0) return null

  const serializedFeaturedProducts = featuredProducts.map(serializeProduct)

  return (
    <section className="py-12 sm:py-16 bg-[var(--color-brand-offwhite)] border-t border-[var(--color-brand-muted)]/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-3 text-center">
            Destaques da Coleção
          </h2>
          <div className="w-16 h-[2px] bg-[var(--color-brand-gold)] mb-4"></div>
          <p className="text-sm text-[var(--color-brand-muted)] text-center max-w-xl">
            As peças mais amadas pelas nossas clientes, com caimento impecável e modelagem que abraça suas curvas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {serializedFeaturedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link 
            href="/?categoria=vestidos-e-conjuntos#colecao"
            className="bg-[var(--color-brand-dark)] text-white hover:opacity-90 px-8 py-3 text-xs uppercase font-bold tracking-[0.15em] transition-opacity shadow-md"
          >
            Ver Peças Essenciais
          </Link>
        </div>
      </div>
    </section>
  )
}
