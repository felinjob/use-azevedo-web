'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationControlsProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${pathname}?${params.toString()}#colecao`
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex flex-col items-center mt-12 gap-4">
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-4 py-2 text-sm font-bold border border-[var(--color-brand-muted)]/30 rounded-sm hover:border-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-green-deep)] transition-colors"
          >
            ← Anterior
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm font-bold border border-[var(--color-brand-muted)]/10 rounded-sm opacity-50 cursor-not-allowed">
            ← Anterior
          </span>
        )}

        <div className="flex gap-1 hidden sm:flex">
          {pages.map((page) => (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-sm text-sm font-bold transition-colors ${
                currentPage === page
                  ? 'bg-[#0B3B24] text-[var(--color-brand-ivory)] border border-[#0B3B24]'
                  : 'border border-[var(--color-brand-muted)]/30 hover:border-[#0B3B24] hover:text-[#0B3B24]'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
        
        {/* Mobile simplified view */}
        <span className="sm:hidden text-sm font-bold px-4 py-2 text-[var(--color-brand-dark)]">
          {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-4 py-2 text-sm font-bold border border-[var(--color-brand-muted)]/30 rounded-sm hover:border-[#0B3B24] hover:text-[#0B3B24] transition-colors"
          >
            Próxima →
          </Link>
        ) : (
          <span className="px-4 py-2 text-sm font-bold border border-[var(--color-brand-muted)]/10 rounded-sm opacity-50 cursor-not-allowed">
            Próxima →
          </span>
        )}
      </div>

      <p className="text-xs text-[var(--color-brand-muted)]">
        Mostrando {startItem}-{endItem} de {totalItems} peças
      </p>
    </div>
  )
}
