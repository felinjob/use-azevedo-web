import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CouponClient from '@/components/admin/CouponClient'

export const dynamic = 'force-dynamic'

export default async function AdminCuponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Prisma Decimal serialization for client components
  const serializedCoupons = coupons.map(c => ({
    ...c,
    discountValue: Number(c.discountValue),
    minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Cupons & Promoções</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os cupons de desconto ativos na loja.</p>
        </div>
      </div>

      <CouponClient initialCoupons={serializedCoupons} />
    </div>
  )
}
