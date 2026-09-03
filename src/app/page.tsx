import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Hero from '@/components/home/Hero'
import CategoryStories from '@/components/home/CategoryStories'
import ProductCard from '@/components/products/ProductCard'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

interface HomePageProps {
  searchParams: Promise<{
    filtro?: string
    disponibilidade?: string
    categoria?: string
    busca?: string
    tamanho?: string
  }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const { filtro, disponibilidade, categoria, busca, tamanho } = resolvedSearchParams || {}

  const where: Prisma.ProductWhereInput = { active: true }

  if (disponibilidade) {
    where.availability = disponibilidade as any
  }

  if (categoria) {
    where.category = {
      slug: categoria,
    }
  }

  if (busca) {
    where.OR = [
      { name: { contains: busca, mode: 'insensitive' } },
      { description: { contains: busca, mode: 'insensitive' } },
      { fabricDetails: { contains: busca, mode: 'insensitive' } },
      { category: { name: { contains: busca, mode: 'insensitive' } } },
    ]
  }

  if (tamanho) {
    where.variants = {
      some: {
        size: tamanho,
      },
    }
  }

  const isFiltered = Boolean(filtro || disponibilidade || categoria || busca || tamanho)

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      variants: true,
    },
    take: 16,
  })

  let title = 'Lançamentos'
  if (filtro === 'novidades') title = 'Novidades'
  else if (disponibilidade === 'READY_TO_SHIP') title = 'Pronta Entrega'
  else if (disponibilidade === 'MADE_TO_ORDER') title = 'Peças Sob Encomenda'
  else if (categoria) title = 'Vestidos & Conjuntos'
  else if (busca) title = `Resultados para "${busca}"`
  else if (tamanho) title = `Peças no Tamanho ${tamanho}`

  const sizes = ['44', '46', '48', '50', '52', '54', '56']

  return (
    <div className="min-h-screen bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main>
        {/* Only show Hero banner when not actively searching/filtering */}
        {!busca && !tamanho && <Hero />}
        
        <CategoryStories />
        
        {/* Seletor Rápido de Tamanhos */}
        <section className="bg-[var(--color-brand-canvas)] py-8 border-b border-[var(--color-brand-muted)]/10">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-[0.15em] mb-4">
              Encontre o seu tamanho
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {sizes.map((size) => {
                const isSelected = tamanho === size
                return (
                  <Link 
                    key={size}
                    href={isSelected ? '/' : `/?tamanho=${size}`}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                      isSelected 
                        ? 'border-[var(--color-brand-green-deep)] bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] ring-2 ring-[var(--color-brand-green-deep)]/20' 
                        : 'border-[var(--color-brand-muted)]/30 text-[var(--color-brand-dark)] bg-white hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-ivory)]'
                    }`}
                  >
                    {size}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Vitrine de Produtos */}
        <section id="colecao" className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-3 text-center">
                {title}
              </h2>
              <div className="w-16 h-[2px] bg-[var(--color-brand-green-deep)]"></div>
              {isFiltered && (
                <Link 
                  href="/" 
                  className="mt-3 text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] underline"
                >
                  Limpar filtros e ver todas as peças
                </Link>
              )}
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 max-w-md mx-auto">
                <p className="text-base text-[var(--color-brand-dark)] font-medium mb-2">
                  Nenhuma peça encontrada com os filtros selecionados.
                </p>
                <p className="text-xs text-[var(--color-brand-muted)] mb-6">
                  Tente outros tamanhos ou confira nossa coleção completa.
                </p>
                <Link 
                  href="/"
                  className="inline-block bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-sm hover:opacity-90 transition-opacity"
                >
                  Ver Toda a Coleção
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
