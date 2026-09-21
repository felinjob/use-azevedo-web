'use client'

import { useState } from 'react'
import { Plus, Trash2, Tag, Calendar, ShoppingBag } from 'lucide-react'
import { createCoupon, toggleCouponStatus, deleteCoupon } from '@/app/actions/manage-coupons'

type SerializedCoupon = {
  id: string
  code: string
  discountType: string
  discountValue: number
  minOrderValue: number | null
  maxUses: number | null
  usageCount: number
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function CouponClient({ initialCoupons }: { initialCoupons: SerializedCoupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c))
    const res = await toggleCouponStatus(id, !currentStatus)
    if (!res.success) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: currentStatus } : c))
      alert(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom? Esta ação é irreversível e pode afetar pedidos antigos.')) return
    
    setCoupons(prev => prev.filter(c => c.id !== id))
    const res = await deleteCoupon(id)
    if (!res.success) {
      alert(res.error)
      window.location.reload()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const code = formData.get('code') as string
    const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FIXED'
    const discountValue = Number(formData.get('discountValue'))
    const minOrderValueStr = formData.get('minOrderValue') as string
    const maxUsesStr = formData.get('maxUses') as string
    const expiresAtStr = formData.get('expiresAt') as string

    if (discountType === 'PERCENTAGE' && (discountValue <= 0 || discountValue > 100)) {
      setError('A porcentagem deve estar entre 1 e 100.')
      setIsSubmitting(false)
      return
    }

    const res = await createCoupon({
      code,
      discountType,
      discountValue,
      minOrderValue: minOrderValueStr ? Number(minOrderValueStr) : undefined,
      maxUses: maxUsesStr ? Number(maxUsesStr) : undefined,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : undefined
    })

    if (res.success && res.coupon) {
      setCoupons([{
        ...res.coupon,
        discountValue: Number(res.coupon.discountValue),
        minOrderValue: res.coupon.minOrderValue ? Number(res.coupon.minOrderValue) : null
      }, ...coupons])
      setIsModalOpen(false)
    } else {
      setError(res.error || 'Erro desconhecido')
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-brand-green-deep)] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-opacity-90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cupom
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Desconto</th>
                <th className="px-6 py-4 font-medium">Mínimo</th>
                <th className="px-6 py-4 font-medium">Uso</th>
                <th className="px-6 py-4 font-medium">Validade</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cupom cadastrado.
                  </td>
                </tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-[var(--color-brand-dark)] font-mono font-bold px-2 py-1 rounded-sm text-xs tracking-wider border border-gray-200 flex items-center w-fit gap-1.5">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {c.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--color-brand-green-deep)]">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `R$ ${c.discountValue.toFixed(2).replace('.', ',')}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {c.minOrderValue ? `R$ ${c.minOrderValue.toFixed(2).replace('.', ',')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    <span className={c.maxUses && c.usageCount >= c.maxUses ? 'text-red-500 font-bold' : ''}>
                      {c.usageCount} {c.maxUses ? `/ ${c.maxUses}` : 'usos'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {c.expiresAt ? (
                      <span className={new Date() > new Date(c.expiresAt) ? 'text-red-500' : ''}>
                        {new Date(c.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={c.isActive}
                        onChange={() => handleToggle(c.id, c.isActive)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-brand-green-deep)]"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Excluir Cupom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-serif text-[var(--color-brand-dark)] text-lg">Novo Cupom</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Código do Cupom</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    name="code" 
                    required 
                    placeholder="EX: PRIMEIRACOMPRA"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)] uppercase"
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase().trim() }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tipo</label>
                  <select name="discountType" className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)]">
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Valor</label>
                  <input 
                    type="number" 
                    name="discountValue" 
                    step="0.01" 
                    min="0.01" 
                    required 
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Valor Mínimo (Opcional)</label>
                <div className="relative">
                  <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    name="minOrderValue" 
                    step="0.01" 
                    min="0" 
                    placeholder="Ex: 150.00"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Limite de Usos (Opcional)</label>
                  <input 
                    type="number" 
                    name="maxUses" 
                    min="1" 
                    placeholder="Ex: 100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Validade (Opcional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input 
                      type="date" 
                      name="expiresAt" 
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-[var(--color-brand-green-deep)] text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[var(--color-brand-green-deep)] text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Criar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
