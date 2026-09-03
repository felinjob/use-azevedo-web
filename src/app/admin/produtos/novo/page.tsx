import { PrismaClient } from '@prisma/client'
import ProductForm from '@/components/admin/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/produtos" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para o Catálogo
        </Link>
        <h1 className="text-2xl font-serif text-[var(--color-brand-dark)]">Cadastrar Nova Peça</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha os detalhes da nova peça para disponibilizá-la na loja.</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
