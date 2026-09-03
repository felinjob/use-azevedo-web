'use client'

import { useState } from 'react'
import { toggleProductActive } from '@/app/actions/manage-products'

interface ToggleProductButtonProps {
  id: string
  isActive: boolean
}

export default function ToggleProductButton({ id, isActive }: ToggleProductButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleProductActive(id, isActive)
    setLoading(false)
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm border transition-colors disabled:opacity-50 ${
        isActive 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
      }`}
    >
      {loading ? '...' : isActive ? 'Desativar' : 'Ativar'}
    </button>
  )
}
