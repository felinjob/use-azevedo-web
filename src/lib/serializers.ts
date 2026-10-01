import { Prisma, Product, ProductVariant, Category } from '@prisma/client'

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
  return {
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    category: {
      name: product.category.name,
    },
    variants: product.variants.map((v: ProductVariant) => ({
      ...v,
      bustCm: v.bustCm ? Number(v.bustCm) : null,
      waistCm: v.waistCm ? Number(v.waistCm) : null,
      hipCm: v.hipCm ? Number(v.hipCm) : null,
      lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
      color: v.color || undefined,
      colorHex: v.colorHex || undefined,
    })),
  }
}
