import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import HomeHeroBanner from '@/components/home/HomeHeroBanner'
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts'
import ProductCard from '@/components/products/ProductCard'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Prisma, AvailabilityType } from '@prisma/client'
import { X, Sparkles, SlidersHorizontal, ArrowLeft, Ruler, RefreshCw, Truck, ShieldCheck } from 'lucide-react'
import PaginationControls from '@/components/ui/PaginationControls'
import { PAGE_SIZE, AVAILABLE_SIZES } from '@/lib/constants'
import { serializeProduct, type SerializedProduct } from '@/lib/serializers'

export const revalidate = 60 // ISR: Cache na borda por 60s, revalidado via revalidatePath('/')

interface HomePageProps {
  searchParams: Promise<{
    filtro?: string
    disponibilidade?: string
    categoria?: string
    busca?: string
    tamanho?: string
    ordem?: string
    page?: string
  }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const { filtro, disponibilidade, categoria, busca, tamanho, ordem, page } = resolvedSearchParams || {}

  const currentPage = Math.max(1, Number(page) || 1)
  const pageSize = PAGE_SIZE

  const where: Prisma.ProductWhereInput = { active: true }

  if (disponibilidade === 'READY_TO_SHIP' || disponibilidade === 'MADE_TO_ORDER') {
    where.availability = disponibilidade as AvailabilityType
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
        color: { not: '' },
      },
    }
  }

  const isFiltered = Boolean(filtro || disponibilidade || categoria || busca || tamanho)
  const isCatalogView = Boolean(isFiltered || page || ordem)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (ordem === 'menor-preco') {
    orderBy = { price: 'asc' }
  } else if (ordem === 'maior-preco') {
    orderBy = { price: 'desc' }
  }

  const [totalProducts, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        variants: true,
      },
      take: isCatalogView ? pageSize : 8,
      skip: isCatalogView ? (currentPage - 1) * pageSize : 0,
    }),
  ])

  const totalPages = Math.ceil(totalProducts / pageSize)

  const serializedProducts = products.map(serializeProduct)

  let title = 'Lançamentos & Curadoria'
  let activeFilterLabel = ''

  if (!isFiltered && isCatalogView) {
    title = 'Nossa Coleção Completa'
  }

  if (filtro === 'novidades') {
    title = 'Novidades da Estação'
    activeFilterLabel = 'Novidades'
  } else if (disponibilidade === 'READY_TO_SHIP') {
    title = 'Peças a Pronta Entrega'
    activeFilterLabel = 'Pronta Entrega'
  } else if (disponibilidade === 'MADE_TO_ORDER') {
    title = 'Peças Sob Encomenda'
    activeFilterLabel = 'Sob Encomenda'
  } else if (categoria === 'vestidos-e-vestidos-curtos') {
    title = 'Vestidos & Vestidos Curtos'
    activeFilterLabel = 'Vestidos & Vestidos Curtos'
  } else if (categoria === 'cropped-e-blusas') {
    title = 'Croppeds & Blusas'
    activeFilterLabel = 'Croppeds & Blusas'
  } else if (categoria === 'macaquinhos-e-conjuntos') {
    title = 'Macaquinhos & Conjuntos'
    activeFilterLabel = 'Macaquinhos & Conjuntos'
  } else if (categoria === 'saias-calcas-e-shorts') {
    title = 'Saias, Calças & Shorts'
    activeFilterLabel = 'Saias, Calças & Shorts'
  } else if (categoria) {
    title = 'Coleção Selecionada'
    activeFilterLabel = categoria
  } else if (busca) {
    title = `Resultados para "${busca}"`
    activeFilterLabel = `Busca: "${busca}"`
  } else if (tamanho) {
    title = `Disponíveis no Tamanho ${tamanho}`
    activeFilterLabel = `Tamanho ${tamanho}`
  }

  const sizes = AVAILABLE_SIZES

  // Helper para construir URLs de ordenação preservando os filtros atuais
  const buildSortUrl = (sortValue: string) => {
    const params = new URLSearchParams()
    if (filtro) params.set('filtro', filtro)
    if (disponibilidade) params.set('disponibilidade', disponibilidade)
    if (categoria) params.set('categoria', categoria)
    if (busca) params.set('busca', busca)
    if (tamanho) params.set('tamanho', tamanho)
    if (sortValue !== 'recentes') params.set('ordem', sortValue)
    else if (!isFiltered) params.set('page', '1')
    const qs = params.toString()
    return qs ? `/?${qs}#colecao` : '/#colecao'
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main>
        <HomeHeroBanner isCatalogView={isCatalogView} />

        {/* Banner Editorial Compacto quando um filtro estiver ativo */}
        {isFiltered && (
          <section className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] py-8 sm:py-10 border-b border-[var(--color-brand-green-surface)]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--color-brand-gold-light)]" />
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-brand-ivory)]/80">
                  Curadoria Filtrada
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-ivory)] mb-3">
                {title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
                <span className="text-xs text-[var(--color-brand-ivory)]/75">
                  {totalProducts} {totalProducts === 1 ? 'peça disponível' : 'peças disponíveis'}
                </span>
                <span className="text-[var(--color-brand-ivory)]/40">•</span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-ivory)] bg-[var(--color-brand-green-surface)] hover:bg-[var(--color-brand-green-surface)]/80 px-3.5 py-1 rounded-full border border-[var(--color-brand-ivory)]/20 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-3 h-3" /> Ver Toda a Loja
                </Link>
              </div>
            </div>
          </section>
        )}
        
        {/* Seletor Rápido de Tamanhos */}
        <section className="bg-[var(--color-brand-canvas)] py-7 border-b border-[var(--color-brand-muted)]/10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-brand-green-deep)]" />
              <p className="text-center text-xs font-bold text-[var(--color-brand-dark)] uppercase tracking-[0.15em]">
                Compre pelo seu Tamanho
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
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-3 text-center">
                {title}
              </h2>
              <div className="w-16 h-[2px] bg-[var(--color-brand-gold)] mb-4"></div>

              {/* Tag / Badge de Filtro Ativo */}
              {isFiltered && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1 mb-4">
                  <span className="text-xs text-[var(--color-brand-muted)]">Filtro ativo:</span>
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

              {/* Barra de Ordenação */}
              {totalProducts > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <span className="text-[var(--color-brand-muted)] font-medium">Ordenar por:</span>
                  <div className="inline-flex rounded-full bg-white border border-[var(--color-brand-muted)]/20 p-0.5 shadow-2xs">
                    <Link
                      href={buildSortUrl('recentes')}
                      className={`px-3 py-1 rounded-full transition-colors font-semibold ${
                        !ordem || ordem === 'recentes'
                          ? 'bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]'
                          : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                      }`}
                    >
                      Mais Recentes
                    </Link>
                    <Link
                      href={buildSortUrl('menor-preco')}
                      className={`px-3 py-1 rounded-full transition-colors font-semibold ${
                        ordem === 'menor-preco'
                          ? 'bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]'
                          : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                      }`}
                    >
                      Menor Preço
                    </Link>
                    <Link
                      href={buildSortUrl('maior-preco')}
                      className={`px-3 py-1 rounded-full transition-colors font-semibold ${
                        ordem === 'maior-preco'
                          ? 'bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]'
                          : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                      }`}
                    >
                      Maior Preço
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Grid de Produtos Editorial */}
            {serializedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
                  {serializedProducts.map((product: SerializedProduct) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {!isCatalogView && totalProducts > serializedProducts.length && (
                  <div className="mt-12 flex justify-center">
                    <Link 
                      href="/?page=1#colecao"
                      className="border border-[var(--color-brand-green-deep)] text-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-ivory)] px-8 py-3.5 text-xs uppercase font-bold tracking-[0.15em] transition-colors rounded-xs"
                    >
                      Ver Toda a Coleção ({totalProducts} peças)
                    </Link>
                  </div>
                )}

                {isCatalogView && (
                  <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalProducts}
                    pageSize={pageSize}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16 max-w-md mx-auto bg-white p-8 rounded-md border border-[var(--color-brand-muted)]/15 shadow-xs">
                <p className="text-base text-[var(--color-brand-dark)] font-serif font-semibold mb-2">
                  Nenhuma peça encontrada com este filtro.
                </p>
                <p className="text-xs text-[var(--color-brand-muted)] mb-6">
                  Experimente selecionar outra numeração ou explorar todas as peças da nossa coleção.
                </p>
                <Link 
                  href="/"
                  className="inline-block bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-6 py-3 text-xs uppercase font-bold tracking-wider rounded-xs hover:opacity-90 transition-opacity"
                >
                  Ver Toda a Coleção
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Seção Destaques / Mais Vendidos (Visível apenas se não houver filtros) */}
        <HomeFeaturedProducts isCatalogView={isCatalogView} />

        {/* Barra Editorial de Diferenciais da Marca */}
        {!isFiltered && (
          <section className="py-12 sm:py-16 bg-white border-t border-[var(--color-brand-muted)]/15">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="flex flex-col items-center text-center px-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] flex items-center justify-center mb-3.5">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[var(--color-brand-dark)] mb-1">
                    Modelagem Real 44 ao 56+
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    Cortes pensados para respeitar e valorizar as curvas femininas com conforto e sustentação.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center px-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] flex items-center justify-center mb-3.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[var(--color-brand-dark)] mb-1">
                    Frete Grátis & Motoboy RJ
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    PAC grátis acima de R$ 199 no PIX (ou R$ 299 no Cartão) e entrega expressa no Rio de Janeiro.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center px-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] flex items-center justify-center mb-3.5">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[var(--color-brand-dark)] mb-1">
                    Primeira Troca Grátis
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    Compre com tranquilidade: o frete da sua primeira troca é por nossa conta em até 7 dias corridos.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center px-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] flex items-center justify-center mb-3.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[var(--color-brand-dark)] mb-1">
                    Compra 100% Protegida
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    Checkout seguro via InfinitePay com aprovação imediata no PIX ou em até 12x no cartão.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

