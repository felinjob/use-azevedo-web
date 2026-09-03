'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUGGESTIONS = [
  { label: 'Vestido Midi', query: '?categoria=vestidos-e-conjuntos' },
  { label: 'Linho', query: '?busca=linho' },
  { label: 'Tamanho 48', query: '?tamanho=48' },
  { label: 'Tamanho 52', query: '?tamanho=52' },
  { label: 'Sob Encomenda', query: '?disponibilidade=MADE_TO_ORDER' },
]

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
      setQuery('')
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsSearching(true)
    // Simulate loading for the UX feel, then navigate
    setTimeout(() => {
      closeSearch()
      setIsSearching(false)
      router.push(`/?busca=${encodeURIComponent(query)}`)
    }, 400)
  }

  const handleSuggestion = (url: string) => {
    closeSearch()
    router.push(url)
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-white z-[70] shadow-2xl rounded-b-2xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[var(--color-brand-dark)]">O que você procura?</h2>
                <button 
                  onClick={closeSearch}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative mb-8">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ex: Vestido longo, Alfaiataria..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-lg sm:text-2xl border-b-2 border-[var(--color-brand-muted)]/20 py-4 pl-0 pr-12 focus:outline-none focus:border-[var(--color-brand-green-deep)] bg-transparent transition-colors placeholder:text-[var(--color-brand-muted)]/40 text-[var(--color-brand-dark)] font-medium"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors"
                >
                  {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                </button>
              </form>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Mais Buscados</h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button 
                      key={s.label}
                      onClick={() => handleSuggestion(s.query)}
                      className="px-4 py-2 bg-[var(--color-brand-canvas)] border border-[var(--color-brand-muted)]/20 rounded-full text-sm font-medium text-[var(--color-brand-muted)] hover:border-[var(--color-brand-green-deep)] hover:text-[var(--color-brand-dark)] transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
