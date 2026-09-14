import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Hero from '@/components/home/Hero'
import CategoryStories from '@/components/home/CategoryStories'
import ProductCard from '@/components/products/ProductCard'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { X, Sparkles, SlidersHorizontal, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

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

  const orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }

  const [products, highlights, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
      },
      take: isFiltered ? 24 : 4,
    }),
    prisma.bannerHighlight.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    !isFiltered ? prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
        variants: true,
      },
      take: 4,
    }) : Promise.resolve([]),
  ])

  // Fix: Next.js cannot pass Prisma Decimal objects to Client Components. Serialize them to primitive types.
  const serializedProducts = JSON.parse(JSON.stringify(products))
  const serializedFeaturedProducts = JSON.parse(JSON.stringify(featuredProducts))

  const heroSlides = highlights.filter((h) => h.type === 'HERO_SLIDE')
  const storyCircles = highlights.filter((h) => h.type === 'STORY_CIRCLE')

  let title = 'Lançamentos'
  let activeFilterLabel = ''

  if (filtro === 'novidades') {
    title = 'Novidades'
    activeFilterLabel = 'Novidades'
  } else if (disponibilidade === 'READY_TO_SHIP') {
    title = 'Pronta Entrega'
    activeFilterLabel = 'Pronta Entrega'
  } else if (disponibilidade === 'MADE_TO_ORDER') {
    title = 'Peças Sob Encomenda'
    activeFilterLabel = 'Sob Encomenda'
  } else if (categoria === 'vestidos-e-conjuntos') {
    title = 'Vestidos & Conjuntos'
    activeFilterLabel = 'Vestidos & Conjuntos'
  } else if (categoria) {
    title = 'Coleção Selecionada'
    activeFilterLabel = categoria
  } else if (busca) {
    title = `Resultados para "${busca}"`
    activeFilterLabel = `Busca: "${busca}"`
  } else if (tamanho) {
    title = `Tamanho ${tamanho}`
    activeFilterLabel = `Tamanho ${tamanho}`
  }

  const sizes = ['44', '46', '48', '50', '52', '54', '56']

  return (
    <div className="min-h-screen bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main>
        {/* Banner Hero completo apenas quando nenhum filtro estiver ativo */}
        {!isFiltered && <Hero slides={heroSlides} />}
        
        {/* Círculos Stories de Categorias */}
        <CategoryStories stories={storyCircles} />

        {/* Banner Editorial Compacto quando um filtro estiver ativo */}
        {isFiltered && (
          <section className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] py-8 sm:py-10 border-b border-[var(--color-brand-green-surface)]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--color-brand-ivory)]/80" />
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-brand-ivory)]/80">
                  Filtro Aplicado
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-ivory)] mb-3">
                {title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                <span className="text-xs text-[var(--color-brand-ivory)]/75">
                  {serializedProducts.length} {serializedProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
                </span>
                <span className="text-[var(--color-brand-ivory)]/40">•</span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-ivory)] bg-[var(--color-brand-green-surface)] hover:bg-[var(--color-brand-green-surface)]/80 px-3 py-1 rounded-full border border-[var(--color-brand-ivory)]/20 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-3 h-3" /> Ver Toda a Loja
                </Link>
              </div>
            </div>
          </section>
        )}
        
        {/* Seletor Rápido de Tamanhos */}
        <section className="bg-[var(--color-brand-canvas)] py-8 border-b border-[var(--color-brand-muted)]/10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-brand-muted)]" />
              <p className="text-center text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-[0.15em]">
                Encontre o seu tamanho
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
              {sizes.map((size) => {
                const isSelected = tamanho === size
                return (
                  <Link 
                    key={size}
                    href={isSelected ? '/#colecao' : `/?tamanho=${size}#colecao`}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                      isSelected 
                        ? 'border-[var(--color-brand-green-deep)] bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] ring-2 ring-[var(--color-brand-green-deep)]/20 scale-105' 
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
        <section id="colecao" className="py-12 sm:py-16 scroll-mt-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header da Seção */}
            <div className="flex flex-col items-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-3 text-center">
                {title}
              </h2>
              <div className="w-16 h-[2px] bg-[var(--color-brand-green-deep)] mb-4"></div>

              {/* Tag / Badge de Filtro Ativo */}
              {isFiltered && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <span className="text-xs text-[var(--color-brand-muted)]">Filtrando por:</span>
                  <span className="inline-flex items-center gap-1.5 bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
                    {activeFilterLabel}
                    <Link href="/" className="hover:opacity-75 transition-opacity" title="Remover filtro">
                      <X className="w-3.5 h-3.5" />
                    </Link>
                  </span>
                  <Link 
                    href="/" 
                    className="text-xs font-semibold text-[var(--color-brand-green-deep)] hover:underline ml-2"
                  >
                    Limpar Filtros
                  </Link>
                </div>
              )}
            </div>

            {/* Grid de Produtos Editorial */}
            {serializedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
                  {serializedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {!isFiltered && (
                  <div className="mt-10 flex justify-center">
                    <Link 
                      href="/?filtro=novidades#colecao"
                      className="border border-[var(--color-brand-green-deep)] text-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-white px-8 py-3 text-xs uppercase font-bold tracking-[0.15em] transition-colors"
                    >
                      Ver todos os Lançamentos
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-md border border-[var(--color-brand-muted)]/15 shadow-xs">
                <p className="text-base text-[var(--color-brand-dark)] font-semibold mb-2">
                  Nenhuma peça encontrada com este filtro.
                </p>
                <p className="text-xs text-[var(--color-brand-muted)] mb-6">
                  Tente outros tamanhos ou explore nossa coleção completa do 44 ao 56+.
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

        {/* Seção Destaques / Mais Vendidos (Visível apenas se não houver filtros) */}
        {!isFiltered && serializedFeaturedProducts.length > 0 && (
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
                {serializedFeaturedProducts.map((product: any) => (
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
        )}
      </main>

      <Footer />
    </div>
  )
}
