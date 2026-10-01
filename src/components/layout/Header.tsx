'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag, MessageCircle, Menu, ChevronDown } from 'lucide-react'
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
          <div className="flex flex-1 items-center justify-center lg:justify-start">
            <Link href="/" className="flex flex-row items-center gap-2.5 hover:opacity-90 transition-opacity">
              <Image 
                src="/logo-ua.png" 
                alt="Monograma UA" 
                width={40} 
                height={40} 
                className="hidden lg:block w-8 h-auto md:w-10 object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
              <span className="font-serif text-xl md:text-2xl font-normal tracking-[0.25em] uppercase text-[var(--color-brand-ivory)]">
                Use Azevedo
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-[2] gap-8 text-[13px] uppercase tracking-[0.12em] font-medium">
            <Link href="/?filtro=novidades#colecao" className="relative py-1 opacity-85 hover:opacity-100 transition-opacity after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--color-brand-ivory)] hover:after:w-full after:transition-all after:duration-300">Novidades</Link>
            
            {/* Dropdown Nossas Peças */}
            <div className="group relative">
              <button className="relative py-1 flex items-center gap-1 opacity-85 hover:opacity-100 transition-opacity after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--color-brand-ivory)] group-hover:after:w-full after:transition-all after:duration-300">
                NOSSAS PEÇAS <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-[#FAF8F5] border border-[#0B3B24]/15 rounded-lg shadow-xl p-3 min-w-[250px] flex flex-col">
                  <Link href="/?categoria=vestidos-e-vestidos-curtos#colecao" className="text-[#0B3B24] hover:bg-[#0B3B24]/10 hover:text-[#0B3B24] transition-colors rounded px-3 py-2 text-sm font-medium">Vestidos & Vestidos Curtos</Link>
                  <Link href="/?categoria=cropped-e-blusas#colecao" className="text-[#0B3B24] hover:bg-[#0B3B24]/10 hover:text-[#0B3B24] transition-colors rounded px-3 py-2 text-sm font-medium">Croppeds & Blusas</Link>
                  <Link href="/?categoria=macaquinhos-e-conjuntos#colecao" className="text-[#0B3B24] hover:bg-[#0B3B24]/10 hover:text-[#0B3B24] transition-colors rounded px-3 py-2 text-sm font-medium">Macaquinhos & Conjuntos</Link>
                  <Link href="/?categoria=saias-calcas-e-shorts#colecao" className="text-[#0B3B24] hover:bg-[#0B3B24]/10 hover:text-[#0B3B24] transition-colors rounded px-3 py-2 text-sm font-medium">Saias, Calças & Shorts</Link>
                  <div className="border-t border-gray-200/50 my-1"></div>
                  <Link href="/#colecao" className="text-[#0B3B24] hover:bg-[#0B3B24]/10 hover:text-[#0B3B24] transition-colors rounded px-3 py-2 text-sm font-medium">Ver Todas as Peças</Link>
                </div>
              </div>
            </div>

            <Link href="/?disponibilidade=READY_TO_SHIP#colecao" className="relative py-1 opacity-85 hover:opacity-100 transition-opacity after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--color-brand-ivory)] hover:after:w-full after:transition-all after:duration-300">Pronta Entrega</Link>
            <Link href="/?disponibilidade=MADE_TO_ORDER#colecao" className="relative py-1 opacity-85 hover:opacity-100 transition-opacity after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--color-brand-ivory)] hover:after:w-full after:transition-all after:duration-300">Sob Encomenda</Link>
            <button onClick={openSizeGuide} className="relative py-1 opacity-85 hover:opacity-100 transition-opacity uppercase tracking-[0.12em] after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:bg-[var(--color-brand-ivory)] hover:after:w-full after:transition-all after:duration-300">Guia de Medidas</button>
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

