import { Prisma } from '@prisma/client'

export interface SerializedVariant {
  id: string
  size: string
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

export function serializeProduct(product: any): SerializedProduct {
  return {
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    variants: product.variants.map((v: any) => ({
      ...v,
      bustCm: v.bustCm ? Number(v.bustCm) : null,
      waistCm: v.waistCm ? Number(v.waistCm) : null,
      hipCm: v.hipCm ? Number(v.hipCm) : null,
      lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
    })),
  }
}
