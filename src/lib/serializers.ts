import { Product, ProductVariant, Category } from '@prisma/client'

type ProductWithRelations = Product & {
  category: Category;
  variants: ProductVariant[];
}

export interface SerializedVariant {
  id: string
  size: string
  color?: string
  colorHex?: string
  stockQuantity: number
  bustCm: number | null
  waistCm: number | null
  hipCm: number | null
  lengthCm: number | null
}

export interface SerializedProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  availability: string
  productionTimeDays: number
  fabricDetails: string
  images: string[]
  slug: string
  category: {
    name: string
  }
  variants: SerializedVariant[]
}

export function serializeProduct(product: ProductWithRelations): SerializedProduct {
  // Filtra variantes arquivadas (sem cor/tamanho ativo) que foram mantidas apenas por integridade de pedidos antigos
  const activeVariants = product.variants.filter(
    (v: ProductVariant) => Boolean(v.size && v.size.trim() !== '' && v.color && v.color.trim() !== '')
  )

  return {
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    category: {
      name: product.category.name,
    },
    variants: activeVariants.map((v: ProductVariant) => ({
      ...v,
      color: v.color.trim(),
      colorHex: (v.colorHex || '#141414').trim(),
      bustCm: v.bustCm ? Number(v.bustCm) : null,
      waistCm: v.waistCm ? Number(v.waistCm) : null,
      hipCm: v.hipCm ? Number(v.hipCm) : null,
      lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
    })),
  }
}
