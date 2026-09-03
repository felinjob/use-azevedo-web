import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductDetailsView from '@/components/products/ProductDetailsView'
import { serializeProduct } from '@/lib/serializers'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug, active: true }
  })

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
  
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug, active: true },
    include: {
      category: true,
      variants: true
    }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Topbar />
      <Header />
      
      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider mb-8">
            <Link href="/" className="hover:text-[var(--color-brand-gold)] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span>{product.category.name}</span>
            <span className="mx-2">/</span>
            <span className="text-[var(--color-brand-dark)] font-bold">{product.name}</span>
          </div>

          <ProductDetailsView product={serializeProduct(product)} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
