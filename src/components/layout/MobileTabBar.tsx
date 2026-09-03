'use client'

import Link from 'next/link'
import { Home, Search, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MobileTabBar() {
  const { openCart, getTotalItems } = useCartStore()
  const { openSearch } = useUIStore()
  const pathname = usePathname()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show in admin routes or checkout
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    return null
  }

  const totalItems = getTotalItems()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-brand-canvas)]/95 backdrop-blur-md border-t border-[var(--color-brand-muted)]/15 z-30 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-[var(--color-brand-green-deep)]' : 'text-[var(--color-brand-muted)]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        
        <button 
          onClick={openSearch}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Buscar</span>
        </button>

        <button 
          onClick={openCart}
          className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Sacola</span>
        </button>

        <a 
          href="https://wa.me/5521978594358?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20sobre%20as%20pe%C3%A7as%20da%20Use%20Azevedo" 
          target="_blank" 
          rel="noreferrer"
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-green-deep)] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Ajuda</span>
        </a>
      </div>
    </div>
  )
}
