'use client'

import { useState } from 'react'
import { toggleProductActive, deleteProduct } from '@/app/actions/manage-products'
import { Trash2 } from 'lucide-react'

interface ToggleProductButtonProps {
  id: string
  name?: string
  isActive: boolean
}

export default function ToggleProductButton({ id, name, isActive }: ToggleProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleProductActive(id, isActive)
    setLoading(false)
  }

  const handleDelete = async () => {
    const label = name ? `"${name}"` : 'esta peça'
    if (!window.confirm(`Deseja realmente excluir ${label} do catálogo?`)) return

    setDeleting(true)
    const res = await deleteProduct(id)
    setDeleting(false)

    if (!res.success) {
      alert(res.error || 'Erro ao excluir peça.')
    } else if (res.archived && res.message) {
      alert(res.message)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button 
        onClick={handleToggle}
        disabled={loading || deleting}
        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-colors disabled:opacity-50 ${
          isActive 
            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        }`}
      >
        {loading ? '...' : isActive ? 'Ocultar' : 'Ativar'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading || deleting}
        title="Excluir peça"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

