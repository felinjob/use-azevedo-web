'use server'

import prisma from '@/lib/prisma'

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const couponCode = code.toUpperCase().trim()
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    })

    if (!coupon) {
      return { valid: false, error: 'Cupom inválido ou inexistente.' }
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Este cupom não está mais ativo.' }
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, error: 'Este cupom já expirou.' }
    }

    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      return { valid: false, error: 'Este cupom atingiu o limite de usos.' }
    }

    const minOrderValue = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      return { valid: false, error: `O valor mínimo para este cupom é R$ ${minOrderValue.toFixed(2).replace('.', ',')}.` }
    }

    const discountValue = Number(coupon.discountValue)
    let discountAmount = 0

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * discountValue) / 100
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = Math.min(subtotal, discountValue)
    }

    return { 
      valid: true, 
      discountAmount, 
      code: coupon.code,
      type: coupon.discountType,
      value: discountValue,
      id: coupon.id
    }
  } catch (error: any) {
    return { valid: false, error: 'Erro ao validar cupom.' }
  }
}
