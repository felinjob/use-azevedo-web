'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { ProductFormState } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

function normalizeHex(hex?: string): string {
  const clean = (hex || '').trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(clean)) return clean.toUpperCase()
  if (/^[0-9A-Fa-f]{6}$/.test(clean)) return `#${clean.toUpperCase()}`
  return '#141414'
}

function generateUniqueSku(slug: string, color: string, size: string): string {
  const slugPrefix = (slug || 'PECA').replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase() || 'PECA'
  const colorPrefix = (color || 'COR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'COR'
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `UA-${slugPrefix}-${colorPrefix}-${size}-${randomSuffix}`
}

export async function createProduct(data: ProductFormState) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado: Acesso restrito a administradores.' }
  }

  try {
    const cleanName = data.name.trim()
    const cleanSlug = data.slug.trim().toLowerCase()

    const product = await prisma.$transaction(async (tx) => {
      const usedSkus = new Set<string>()
      const variantsWithSku = data.variants
        .filter(v => v.size?.trim() && v.color?.trim())
        .map(v => {
          const cleanColor = v.color.trim()
          const cleanSize = v.size.trim()
          const cleanHex = normalizeHex(v.colorHex)
          let finalSku = v.sku?.trim().toUpperCase()
          if (!finalSku || usedSkus.has(finalSku)) {
            finalSku = generateUniqueSku(cleanSlug, cleanColor, cleanSize)
          }
          usedSkus.add(finalSku)

          return {
            size: cleanSize,
            color: cleanColor,
            colorHex: cleanHex,
            sku: finalSku,
            stockQuantity: Math.max(0, Number(v.stockQuantity) || 0),
            bustCm: v.bustCm ? Number(v.bustCm) : null,
            waistCm: v.waistCm ? Number(v.waistCm) : null,
            hipCm: v.hipCm ? Number(v.hipCm) : null,
            lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
          }
        })

      const newProduct = await tx.product.create({
        data: {
          name: cleanName,
          slug: cleanSlug,
          description: data.description.trim(),
          price: Math.max(0, Number(data.price) || 0),
          originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          availability: data.availability,
          productionTimeDays: data.availability === 'MADE_TO_ORDER' ? Math.max(1, Number(data.productionTimeDays) || 7) : 0,
          fabricDetails: data.fabricDetails.trim(),
          featured: Boolean(data.featured),
          active: Boolean(data.active),
          images: data.images,
          categoryId: data.categoryId,
          variants: {
            create: variantsWithSku
          }
        }
      })
      return newProduct
    })

    revalidatePath('/admin/produtos')
    revalidatePath(`/produto/${cleanSlug}`)
    revalidatePath('/', 'layout')
    return { success: true, productId: product.id }
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const meta = (error as { meta?: { target?: unknown } }).meta
      const target = meta?.target || []
      const targetStr = Array.isArray(target) ? target.join(',') : String(target)
      if (targetStr.includes('sku')) {
        return { success: false, error: 'Um código SKU gerado coincidiu com outro existente. Clique em salvar novamente.' }
      }
      if (targetStr.includes('slug')) {
        return { success: false, error: 'Já existe uma peça cadastrada com essa URL (Slug).' }
      }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar o produto.' }
  }
}

export async function updateProduct(id: string, data: ProductFormState) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado: Acesso restrito a administradores.' }
  }

  try {
    const cleanName = data.name.trim()
    const cleanSlug = data.slug.trim().toLowerCase()

    await prisma.$transaction(async (tx) => {
      // 1. Update master product details
      await tx.product.update({
        where: { id },
        data: {
          name: cleanName,
          slug: cleanSlug,
          description: data.description.trim(),
          price: Math.max(0, Number(data.price) || 0),
          originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
          availability: data.availability,
          productionTimeDays: data.availability === 'MADE_TO_ORDER' ? Math.max(1, Number(data.productionTimeDays) || 7) : 0,
          fabricDetails: data.fabricDetails.trim(),
          featured: Boolean(data.featured),
          active: Boolean(data.active),
          images: data.images,
          categoryId: data.categoryId,
        }
      })

      // 2. Identificar variantes mantidas vs removidas
      const validSubmittedVariants = data.variants.filter(v => v.size?.trim() && v.color?.trim())
      const keptIds = validSubmittedVariants
        .map(v => v.id)
        .filter((vId): vId is string => Boolean(vId))

      // 2.1 Excluir fisicamente todas as variantes removidas que não possuem pedidos históricos vinculados
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          id: { notIn: keptIds },
          orderItems: { none: {} }
        }
      })

      // 2.2 Caso alguma variante removida já tenha pedido histórico (FK em OrderItem), arquivá-la (color = '', stock = 0)
      await tx.productVariant.updateMany({
        where: {
          productId: id,
          id: { notIn: keptIds },
        },
        data: {
          color: '',
          colorHex: '',
          stockQuantity: 0,
        }
      })

      // 3. Upsert das variantes ativas submetidas
      const usedSkus = new Set<string>()
      for (const variant of validSubmittedVariants) {
        const cleanColor = variant.color.trim()
        const cleanSize = variant.size.trim()
        const cleanHex = normalizeHex(variant.colorHex)

        let finalSku = variant.sku?.trim().toUpperCase()
        if (!finalSku || usedSkus.has(finalSku)) {
          finalSku = generateUniqueSku(cleanSlug, cleanColor, cleanSize)
        }
        usedSkus.add(finalSku)

        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              size: cleanSize,
              color: cleanColor,
              colorHex: cleanHex,
              sku: finalSku,
              stockQuantity: Math.max(0, Number(variant.stockQuantity) || 0),
              bustCm: variant.bustCm ? Number(variant.bustCm) : null,
              waistCm: variant.waistCm ? Number(variant.waistCm) : null,
              hipCm: variant.hipCm ? Number(variant.hipCm) : null,
              lengthCm: variant.lengthCm ? Number(variant.lengthCm) : null,
            }
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: cleanSize,
              color: cleanColor,
              colorHex: cleanHex,
              sku: finalSku,
              stockQuantity: Math.max(0, Number(variant.stockQuantity) || 0),
              bustCm: variant.bustCm ? Number(variant.bustCm) : null,
              waistCm: variant.waistCm ? Number(variant.waistCm) : null,
              hipCm: variant.hipCm ? Number(variant.hipCm) : null,
              lengthCm: variant.lengthCm ? Number(variant.lengthCm) : null,
            }
          })
        }
      }
    })

    revalidatePath('/admin/produtos')
    revalidatePath(`/admin/produtos/${id}/editar`)
    revalidatePath(`/produto/${cleanSlug}`)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const meta = (error as { meta?: { target?: unknown } }).meta
      const target = meta?.target || []
      const targetStr = Array.isArray(target) ? target.join(',') : String(target)
      if (targetStr.includes('sku')) {
        return { success: false, error: 'O código SKU informado já pertence a outra variante. Tente salvar novamente.' }
      }
      if (targetStr.includes('slug')) {
        return { success: false, error: 'Já existe um produto cadastrado com essa URL/Slug.' }
      }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar o produto.' }
  }
}

export async function toggleProductActive(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado: Acesso restrito a administradores.' }
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { active: !currentStatus }
    })
    revalidatePath('/admin/produtos')
    revalidatePath(`/admin/produtos/${id}/editar`)
    revalidatePath(`/produto/${updated.slug}`)
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error toggling product status:', error)
    return { success: false, error: 'Erro ao alterar o status do produto.' }
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autorizado: Acesso restrito a administradores.' }
  }

  try {
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderItemsCount > 0) {
      // Produto já possui histórico de pedidos: desativa da vitrine para preservar histórico fiscal/contábil
      await prisma.product.update({
        where: { id },
        data: { active: false, featured: false }
      })
      revalidatePath('/admin/produtos')
      revalidatePath('/', 'layout')
      return {
        success: true,
        archived: true,
        message: 'Esta peça possui pedidos vinculados no histórico e foi arquivada (ocultada da loja) para preservar o registro das vendas.'
      }
    }

    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ])

    revalidatePath('/admin/produtos')
    revalidatePath('/', 'layout')
    return { success: true, archived: false }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Erro ao excluir a peça.' }
  }
}


