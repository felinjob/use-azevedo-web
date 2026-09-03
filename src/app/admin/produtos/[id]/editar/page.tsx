import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import ProductForm, { ProductFormState } from '@/components/admin/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      variants: {
        orderBy: { size: 'asc' }
      }
    }
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  const initialData: ProductFormState = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    description: product.description,
    availability: product.availability,
    productionTimeDays: product.productionTimeDays,
    fabricDetails: product.fabricDetails,
    featured: product.featured,
    active: product.active,
    images: product.images,
    variants: product.variants.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      sku: v.sku,
      stockQuantity: v.stockQuantity,
      bustCm: v.bustCm ? Number(v.bustCm) : null,
      waistCm: v.waistCm ? Number(v.waistCm) : null,
      hipCm: v.hipCm ? Number(v.hipCm) : null,
      lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
    }))
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/produtos" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para o Catálogo
        </Link>
        <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Editar Peça: {product.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Atualize as informações, fotos ou estoque desta peça.</p>
      </div>

      <ProductForm categories={categories} initialData={initialData} />
    </div>
  )
}
