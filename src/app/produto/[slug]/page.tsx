import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductDetailsView from '@/components/products/ProductDetailsView'
import ProductCard from '@/components/products/ProductCard'
import MobileStickyCartBar from '@/components/products/MobileStickyCartBar'
import { serializeProduct } from '@/lib/serializers'

export const revalidate = 120 // Cache ISR de 2 minutos, revalidado sob demanda ao salvar no admin

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.slug)
  
  let product = await prisma.product.findUnique({
    where: { slug: decodedSlug, active: true }
  })

  if (!product) {
    product = await prisma.product.findFirst({
      where: {
        active: true,
        OR: [
          { slug: { equals: decodedSlug, mode: 'insensitive' } },
          { name: { equals: decodedSlug, mode: 'insensitive' } }
        ]
      }
    })
  }

  if (!product) {
    return { title: 'Produto não encontrado | Use Azevedo' }
  }

  return {
    title: `${product.name} | Use Azevedo`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Use Azevedo`,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.slug)
  
  let product = await prisma.product.findUnique({
    where: { slug: decodedSlug, active: true },
    include: {
      category: true,
      variants: true
    }
  })

  if (!product) {
    product = await prisma.product.findFirst({
      where: {
        active: true,
        OR: [
          { slug: { equals: decodedSlug, mode: 'insensitive' } },
          { name: { equals: decodedSlug, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        variants: true
      }
    })
  }

  if (!product) {
    notFound()
  }

  // Buscar peças relacionadas (mesma categoria ou outras peças ativas)
  const relatedProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
    },
    include: {
      category: true,
      variants: true,
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 4,
  })

  const serializedProduct = serializeProduct(product)
  const serializedRelated = relatedProducts.map(serializeProduct)

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Topbar />
      <Header />
      
      <main className="flex-grow bg-[var(--color-brand-canvas)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider mb-8">
            <Link href="/" className="hover:text-[var(--color-brand-green-deep)] transition-colors">Início</Link>
            <span className="mx-2">/</span>
            <Link href={`/?categoria=${product.category.slug}#colecao`} className="hover:text-[var(--color-brand-green-deep)] transition-colors">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-brand-dark)] font-bold">{product.name}</span>
          </nav>

          <ProductDetailsView product={serializedProduct} />
        </div>

        {/* Peças Relacionadas */}
        {serializedRelated.length > 0 && (
          <section className="py-12 sm:py-16 border-t border-[var(--color-brand-muted)]/15 bg-white/50">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-serif text-[var(--color-brand-dark)] mb-2 text-center">
                  Complete o Seu Closet
                </h2>
                <div className="w-12 h-[2px] bg-[var(--color-brand-gold)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:gap-8">
                {serializedRelated.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <MobileStickyCartBar product={serializedProduct} />
      <Footer />
    </div>
  )
}
