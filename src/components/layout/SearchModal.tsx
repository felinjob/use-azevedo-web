'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { searchProducts, SearchProductResult } from '@/app/actions/search-products'

const SUGGESTIONS = [
  { label: 'Vestido Midi', query: '/?categoria=vestidos-e-conjuntos' },
  { label: 'Linho', query: '/?busca=linho' },
  { label: 'Tamanho 48', query: '/?tamanho=48' },
  { label: 'Tamanho 52', query: '/?tamanho=52' },
  { label: 'Pronta Entrega', query: '/?disponibilidade=READY_TO_SHIP' },
]

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProductResult[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
      setQuery('')
      setResults([])
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isSearchOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const found = await searchProducts(query)
        setResults(found)
      })
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    closeSearch()
    router.push(`/?busca=${encodeURIComponent(query.trim())}`)
  }

  const handleSuggestion = (url: string) => {
    closeSearch()
    router.push(url)
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Drawer from top */}
          <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-0 left-0 right-0 bg-[var(--color-brand-canvas)] z-[70] shadow-2xl rounded-b-2xl max-h-[90vh] flex flex-col overflow-hidden border-b border-[var(--color-brand-muted)]/20"
          >
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-brand-dark)]">Buscar na Use Azevedo</h2>
                  <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">Encontre seu caimento perfeito do 44 ao 56+</p>
                </div>
                <button 
                  onClick={closeSearch}
                  className="p-2 bg-white/80 border border-[var(--color-brand-muted)]/20 rounded-full hover:bg-white text-[var(--color-brand-dark)] transition-colors"
                  aria-label="Fechar busca"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Buscar vestido, linho, conjunto..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-lg sm:text-xl border-b-2 border-[var(--color-brand-muted)]/25 py-3 pl-0 pr-12 focus:outline-none focus:border-[var(--color-brand-green-deep)] bg-transparent transition-colors placeholder:text-[var(--color-brand-muted)]/50 text-[var(--color-brand-dark)] font-medium"
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="mb-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand-muted)] mb-3">
                  Sugestões Rápidas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button 
                      key={s.label}
                      type="button"
                      onClick={() => handleSuggestion(s.query)}
                      className="px-3.5 py-1.5 bg-white border border-[var(--color-brand-muted)]/25 rounded-full text-xs font-medium text-[var(--color-brand-dark)] hover:border-[var(--color-brand-green-deep)] hover:bg-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-ivory)] transition-all shadow-xs"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search Results */}
              {query.trim().length >= 2 && (
                <div className="pt-2 border-t border-[var(--color-brand-muted)]/15">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)]">
                      {isPending ? 'Buscando peças...' : `${results.length} resultado(s) encontrado(s)`}
                    </span>
                    {results.length > 0 && (
                      <button 
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-[var(--color-brand-green-deep)] flex items-center gap-1 hover:underline"
                      >
                        Ver todos na vitrine <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/produto/${product.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 p-2.5 rounded-md bg-white border border-[var(--color-brand-muted)]/15 hover:border-[var(--color-brand-green-deep)] transition-all group"
                        >
                          <div className="relative w-14 h-18 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                            {product.image && (
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform" 
                                sizes="56px"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-muted)] block truncate">
                              {product.categoryName}
                            </span>
                            <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-brand-dark)] truncate group-hover:text-[var(--color-brand-green-deep)] transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs sm:text-sm font-bold text-[var(--color-brand-dark)]">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                                product.availability === 'MADE_TO_ORDER'
                                  ? 'bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] border border-[var(--color-brand-muted)]/30'
                                  : 'bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)]'
                              }`}>
                                {product.availability === 'MADE_TO_ORDER' ? 'Sob Encomenda' : 'Pronta Entrega'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : !isPending ? (
                    <div className="py-8 text-center text-sm text-[var(--color-brand-muted)]">
                      Nenhuma peça encontrada para &quot;{query}&quot;. Tente outros termos ou busque por categoria.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
