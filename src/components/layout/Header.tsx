'use client'

import Link from 'next/link'
import { Search, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'

export default function Header() {
  const { openCart, getTotalItems } = useCartStore()
  
  // Hydration fix for Zustand
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const totalItems = getTotalItems()

  return (
    <header className="bg-[var(--color-brand-green-deep)] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Toggle (Placeholder) */}
          <div className="lg:hidden flex-1">
            <button className="p-2" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center flex-1 lg:flex-none">
            <span className="text-2xl sm:text-3xl font-serif tracking-widest text-[var(--color-brand-gold)] font-bold">
              USE AZEVEDO
            </span>
            <span className="text-[0.6rem] tracking-[0.2em] text-[var(--color-brand-gold-light)] uppercase mt-1">
              Moda Plus Size
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-8 text-sm uppercase tracking-wider">
            <Link href="#" className="hover:text-[var(--color-brand-gold-light)] transition-colors">Novidades</Link>
            <Link href="#" className="hover:text-[var(--color-brand-gold-light)] transition-colors">Pronta Entrega</Link>
            <Link href="#" className="hover:text-[var(--color-brand-gold-light)] transition-colors">Sob Encomenda</Link>
            <Link href="#" className="hover:text-[var(--color-brand-gold-light)] transition-colors">Vestidos</Link>
            <Link href="#" className="hover:text-[var(--color-brand-gold-light)] transition-colors">Guia de Medidas</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end flex-1 gap-4 sm:gap-6">
            <button className="hover:text-[var(--color-brand-gold-light)] transition-colors" aria-label="Buscar">
              <Search className="w-5 h-5" />
            </button>
            <a href="https://wa.me/5521978594358" target="_blank" rel="noreferrer" className="hidden sm:block hover:text-[var(--color-brand-gold-light)] transition-colors" aria-label="WhatsApp">
              <MessageCircle className="w-5 h-5" />
            </a>
            <button 
              onClick={openCart}
              className="relative hover:text-[var(--color-brand-gold-light)] transition-colors" 
              aria-label="Sacola"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-dark)] text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
