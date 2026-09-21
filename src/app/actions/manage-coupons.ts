'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCoupon(data: {
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  expiresAt?: Date
}) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || null,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt || null,
      }
    })
    
    revalidatePath('/admin/cupons')
    revalidatePath('/checkout')
    
    return { success: true, coupon }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Já existe um cupom com este código.' }
    }
    return { success: false, error: error.message || 'Erro ao criar cupom.' }
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive }
    })
    
    revalidatePath('/admin/cupons')
    revalidatePath('/checkout')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar cupom.' }
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id }
    })
    
    revalidatePath('/admin/cupons')
    revalidatePath('/checkout')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao excluir cupom.' }
  }
}
