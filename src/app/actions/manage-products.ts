'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import type { ProductFormState } from '@/components/admin/ProductForm'

const prisma = new PrismaClient()

export async function createProduct(data: ProductFormState) {
  try {
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          availability: data.availability,
          productionTimeDays: data.productionTimeDays,
          fabricDetails: data.fabricDetails,
          featured: data.featured,
          active: data.active,
          images: data.images,
          categoryId: data.categoryId,
          // Create variants inline
          variants: {
            create: data.variants.map(v => ({
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              sku: v.sku,
              stockQuantity: v.stockQuantity,
              bustCm: v.bustCm,
              waistCm: v.waistCm,
              hipCm: v.hipCm,
              lengthCm: v.lengthCm
            }))
          }
        }
      })
      return newProduct
    })

    revalidatePath('/admin/produtos')
    revalidatePath('/')
    return { success: true, productId: product.id }
  } catch (error: any) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message || 'Erro ao criar o produto.' }
  }
}

export async function updateProduct(id: string, data: ProductFormState) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update master product details
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          availability: data.availability,
          productionTimeDays: data.productionTimeDays,
          fabricDetails: data.fabricDetails,
          featured: data.featured,
          active: data.active,
          images: data.images,
          categoryId: data.categoryId,
        }
      })

      // 2. Upsert variants
      for (const variant of data.variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              color: variant.color,
              colorHex: variant.colorHex,
              stockQuantity: variant.stockQuantity,
              bustCm: variant.bustCm,
              waistCm: variant.waistCm,
              hipCm: variant.hipCm,
              lengthCm: variant.lengthCm
            }
          })
        } else {
          // Fallback if somehow a new variant is added
          await tx.productVariant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              sku: variant.sku,
              stockQuantity: variant.stockQuantity,
              bustCm: variant.bustCm,
              waistCm: variant.waistCm,
              hipCm: variant.hipCm,
              lengthCm: variant.lengthCm
            }
          })
        }
      }
    })

    revalidatePath('/admin/produtos')
    revalidatePath(`/produto/${data.slug}`)
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message || 'Erro ao atualizar o produto.' }
  }
}

export async function toggleProductActive(id: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { active: !currentStatus }
    })
    revalidatePath('/admin/produtos')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error toggling product status:', error)
    return { success: false, error: 'Erro ao alterar o status do produto.' }
  }
}
