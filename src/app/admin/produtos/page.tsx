import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit3, ImageOff } from 'lucide-react'
import ToggleProductButton from '@/components/admin/ToggleProductButton'

const prisma = new PrismaClient()

export const revalidate = 0

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      variants: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Catálogo de Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas peças, estoque e imagens da Use Azevedo.</p>
        </div>
        <Link 
          href="/admin/produtos/novo"
          className="bg-[var(--color-brand-dark)] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Nova Peça
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-6 py-4 w-20">Foto</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Modalidade</th>
                <th className="px-6 py-4 text-center">Estoque Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0)
                
                return (
                  <tr key={product.id} className={`transition-colors relative ${product.active ? 'hover:bg-gray-50/50' : 'bg-gray-50 opacity-70'}`}>
                    <td className="px-6 py-4">
                      <div className="relative w-12 h-16 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 flex items-center justify-center">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <ImageOff className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-brand-dark)]">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${
                        product.availability === 'MADE_TO_ORDER' 
                          ? 'bg-orange-50 text-orange-700 border-orange-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {product.availability === 'MADE_TO_ORDER' ? 'Sob Encomenda' : 'Pronta Entrega'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {totalStock} un
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                        product.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ToggleProductButton id={product.id} isActive={product.active} />
                        <Link 
                          href={`/admin/produtos/${product.id}/editar`}
                          className="p-2 text-gray-500 hover:text-[var(--color-brand-dark)] hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto cadastrado no catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
