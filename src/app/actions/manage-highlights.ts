'use server'

import prisma from '@/lib/prisma'
import { HighlightType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface HighlightFormData {
  title: string
  subtitle?: string | null
  imageUrl: string
  linkUrl: string
  type: HighlightType
  order?: number
  active?: boolean
}

export async function createHighlight(data: HighlightFormData) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: 'O título é obrigatório.' }
    }
    if (!data.imageUrl?.trim()) {
      return { success: false, error: 'A imagem é obrigatória.' }
    }
    if (!data.linkUrl?.trim()) {
      return { success: false, error: 'O link de destino é obrigatório.' }
    }

    const highlight = await prisma.bannerHighlight.create({
      data: {
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        imageUrl: data.imageUrl.trim(),
        linkUrl: data.linkUrl.trim(),
        type: data.type,
        order: Number(data.order) || 0,
        active: data.active !== undefined ? data.active : true,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/personalizacao')
    return { success: true, highlight }
  } catch (error: any) {
    console.error('Error creating banner highlight:', error)
    return { success: false, error: error.message || 'Erro ao criar o destaque.' }
  }
}

export async function updateHighlight(id: string, data: Partial<HighlightFormData>) {
  try {
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle?.trim() || null
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim()
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl.trim()
    if (data.type !== undefined) updateData.type = data.type
    if (data.order !== undefined) updateData.order = Number(data.order)
    if (data.active !== undefined) updateData.active = data.active

    const highlight = await prisma.bannerHighlight.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/')
    revalidatePath('/admin/personalizacao')
    return { success: true, highlight }
  } catch (error: any) {
    console.error('Error updating banner highlight:', error)
    return { success: false, error: error.message || 'Erro ao atualizar o destaque.' }
  }
}

export async function deleteHighlight(id: string) {
  try {
    await prisma.bannerHighlight.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin/personalizacao')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting banner highlight:', error)
    return { success: false, error: error.message || 'Erro ao excluir o destaque.' }
  }
}

export async function toggleHighlightActive(id: string, currentStatus: boolean) {
  try {
    await prisma.bannerHighlight.update({
      where: { id },
      data: { active: !currentStatus },
    })

    revalidatePath('/')
    revalidatePath('/admin/personalizacao')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggling banner highlight status:', error)
    return { success: false, error: error.message || 'Erro ao alterar o status do destaque.' }
  }
}
