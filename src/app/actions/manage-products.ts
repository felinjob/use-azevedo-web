'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import type { ProductFormState } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

const prisma = new PrismaClient()

export async function createProduct(data: ProductFormState) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Acesso restrito a administradores.' }
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      // Garantir SKU único se estiver em branco
      const variantsWithSku = data.variants.map(v => {
        let finalSku = v.sku?.trim()
        if (!finalSku) {
          const slugPrefix = data.slug ? data.slug.substring(0, 5).toUpperCase() : 'NEW'
          const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
          finalSku = `UA-${slugPrefix}-${randomSuffix}`
        }
        return {
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          sku: finalSku,
          stockQuantity: v.stockQuantity,
          bustCm: v.bustCm,
          waistCm: v.waistCm,
          hipCm: v.hipCm,
          lengthCm: v.lengthCm
        }
      })

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
            create: variantsWithSku
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
    if (error.code === 'P2002') {
      const target = error.meta?.target || []
      const targetStr = Array.isArray(target) ? target.join(',') : String(target)
      if (targetStr.includes('sku')) {
        return { success: false, error: 'O código SKU gerado já existe. Tente salvar novamente.' }
      }
      if (targetStr.includes('slug')) {
        return { success: false, error: 'Já existe um produto cadastrado com essa URL/Slug.' }
      }
    }
    return { success: false, error: error.message || 'Erro ao criar o produto.' }
  }
}

export async function updateProduct(id: string, data: ProductFormState) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Acesso restrito a administradores.' }
  }

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
        let finalSku = variant.sku?.trim()
        if (!finalSku) {
          const slugPrefix = data.slug ? data.slug.substring(0, 5).toUpperCase() : 'NEW'
          const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
          finalSku = `UA-${slugPrefix}-${randomSuffix}`
        }

        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: finalSku,
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
              sku: finalSku,
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
    if (error.code === 'P2002') {
      const target = error.meta?.target || []
      const targetStr = Array.isArray(target) ? target.join(',') : String(target)
      if (targetStr.includes('sku')) {
        return { success: false, error: 'O código SKU gerado já existe. Tente salvar novamente.' }
      }
      if (targetStr.includes('slug')) {
        return { success: false, error: 'Já existe um produto cadastrado com essa URL/Slug.' }
      }
    }
    return { success: false, error: error.message || 'Erro ao atualizar o produto.' }
  }
}

export async function toggleProductActive(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Acesso restrito a administradores.' }
  }

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

