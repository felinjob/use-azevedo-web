'use client'

import Link from 'next/link'
import { Search, ShoppingBag, MessageCircle, Menu } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { useEffect, useState } from 'react'

export default function Header() {
  const { openCart, getTotalItems } = useCartStore()
  const { openMenu, openSearch, openSizeGuide } = useUIStore()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = getTotalItems()

  return (
    <header className="bg-[var(--color-brand-green-deep)] backdrop-blur-md text-[var(--color-brand-ivory)] sticky top-0 z-40 border-b border-[var(--color-brand-green-surface)]">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex-1">
            <button onClick={openMenu} className="p-2 opacity-90 hover:opacity-100 transition-opacity" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center justify-center flex-1 lg:flex-none hover:opacity-90 transition-opacity">
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="font-serif text-2xl sm:text-3xl tracking-tight font-medium text-[var(--color-brand-ivory)]">Use Azevedo</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-8 text-[13px] uppercase tracking-[0.12em] font-medium">
            <Link href="/?filtro=novidades#colecao" className="opacity-85 hover:opacity-100 transition-opacity">Novidades</Link>
            <Link href="/?disponibilidade=READY_TO_SHIP#colecao" className="opacity-85 hover:opacity-100 transition-opacity">Pronta Entrega</Link>
            <Link href="/?disponibilidade=MADE_TO_ORDER#colecao" className="opacity-85 hover:opacity-100 transition-opacity">Sob Encomenda</Link>
            <Link href="/?categoria=vestidos-e-conjuntos#colecao" className="opacity-85 hover:opacity-100 transition-opacity">Vestidos</Link>
            <button onClick={openSizeGuide} className="opacity-85 hover:opacity-100 transition-opacity uppercase tracking-[0.12em]">Guia de Medidas</button>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end flex-1 gap-5 sm:gap-6">
            <button onClick={openSearch} className="opacity-85 hover:opacity-100 transition-opacity" aria-label="Buscar">
              <Search className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </button>
            <a href="https://wa.me/5521978594358" target="_blank" rel="noreferrer" className="hidden sm:block opacity-85 hover:opacity-100 transition-opacity" aria-label="WhatsApp">
              <MessageCircle className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </a>
            <button 
              onClick={openCart}
              className="relative opacity-85 hover:opacity-100 transition-opacity" 
              aria-label="Sacola"
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] text-[0.6rem] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
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

