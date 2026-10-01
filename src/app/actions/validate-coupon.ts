'use server'

import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/formatters'

/**
 * Valida um código de cupom de desconto contra o banco de dados.
 *
 * Checagens realizadas em ordem:
 * 1. Existência do cupom (case-insensitive, trimmed).
 * 2. Status ativo (`isActive`).
 * 3. Data de expiração (`expiresAt`).
 * 4. Limite de usos (`maxUses` vs `usageCount`).
 * 5. Valor mínimo do pedido (`minOrderValue`).
 *
 * Cálculo do desconto:
 * - PERCENTAGE: `subtotal * (discountValue / 100)`
 * - FIXED: `min(subtotal, discountValue)` (nunca excede o subtotal).
 *
 * @param code - Código do cupom informado pelo usuário.
 * @param subtotal - Valor subtotal do pedido para validação de mínimo e cálculo.
 * @returns Objeto com `valid`, `discountAmount`, `code`, `type`, `value` e `id`.
 */
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
      return { valid: false, error: `O valor mínimo para este cupom é ${formatCurrency(minOrderValue)}.` }
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
  } catch (error: unknown) {
    return { valid: false, error: 'Erro ao validar cupom.' }
  }
}
