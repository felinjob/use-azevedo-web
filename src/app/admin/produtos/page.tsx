import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit3, ImageOff, ExternalLink, Star } from 'lucide-react'
import ToggleProductButton from '@/components/admin/ToggleProductButton'
import { formatCurrency } from '@/lib/formatters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      availability: true,
      featured: true,
      active: true,
      category: {
        select: { name: true }
      },
      variants: {
        select: {
          size: true,
          color: true,
          colorHex: true,
          stockQuantity: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Catálogo de Peças</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie suas peças, cores (bolinhas), grade de tamanhos e estoque.
          </p>
        </div>
        <Link 
          href="/admin/produtos/novo"
          className="bg-[var(--color-brand-green-deep)] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-brand-dark)] transition-colors flex items-center rounded-sm shadow-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Nova Peça
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-5 py-4 w-20">Foto</th>
                <th className="px-5 py-4">Peça & Categoria</th>
                <th className="px-5 py-4">Cores & Grade</th>
                <th className="px-5 py-4">Preço</th>
                <th className="px-5 py-4">Modalidade</th>
                <th className="px-5 py-4 text-center">Estoque</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const activeVariants = product.variants.filter(v => v.color && v.color.trim() !== '')
                const totalStock = activeVariants.reduce((acc, v) => acc + v.stockQuantity, 0)

                const uniqueColorsMap = new Map<string, string>()
                activeVariants.forEach(v => {
                  const cName = v.color.trim()
                  if (cName && !uniqueColorsMap.has(cName)) {
                    uniqueColorsMap.set(cName, (v.colorHex || '#141414').trim())
                  }
                })
                const uniqueColors = Array.from(uniqueColorsMap.entries())
                const uniqueSizes = Array.from(new Set(activeVariants.map(v => v.size.trim())))

                return (
                  <tr key={product.id} className={`transition-colors relative ${product.active ? 'hover:bg-gray-50/60' : 'bg-gray-50/80 opacity-65'}`}>
                    <td className="px-5 py-4">
                      <div className="relative w-12 h-16 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 flex items-center justify-center">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <ImageOff className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[var(--color-brand-dark)]">{product.name}</p>
                        {product.featured && (
                          <span title="Destaque na Home" className="text-[var(--color-brand-gold)]">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{product.category.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {uniqueColors.length > 0 ? (
                          uniqueColors.map(([cName, cHex]) => (
                            <span
                              key={cName}
                              title={cName}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-medium text-gray-700"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: cHex }}
                              />
                              {cName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-red-500 italic">Sem cor ativa</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Tam: {uniqueSizes.length > 0 ? uniqueSizes.join(', ') : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(Number(product.price))}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${
                        product.availability === 'MADE_TO_ORDER' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {product.availability === 'MADE_TO_ORDER' ? 'Sob Encomenda' : 'Pronta Entrega'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-xs font-bold">
                      <span className={totalStock === 0 && product.availability === 'READY_TO_SHIP' ? 'text-red-600' : 'text-gray-800'}>
                        {totalStock} un
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                        product.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.active ? 'Visível' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-[var(--color-brand-green-deep)] hover:bg-gray-100 rounded-sm transition-colors"
                          title="Ver peça na loja"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/admin/produtos/${product.id}/editar`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-green-deep)] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-sm transition-colors"
                          title="Editar peça, cores e tamanhos"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                        <ToggleProductButton id={product.id} name={product.name} isActive={product.active} />
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma peça cadastrada no catálogo.
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

