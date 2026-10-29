'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ShoppingBag, LogOut, ExternalLink, Sparkles, Ticket } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Se for a página de login, não exibe o layout (sidebar, header, etc)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop / Topbar Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col md:min-h-screen shrink-0 sticky top-0 z-30 md:static">
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between md:block md:text-center">
          <div className="flex items-center gap-3 md:block">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] font-serif text-lg md:text-2xl flex items-center justify-center md:mx-auto md:mb-3 rounded-xs">
              UA
            </div>
            <div className="text-left md:text-center">
              <h2 className="font-serif text-[var(--color-brand-dark)] font-medium text-base md:text-lg leading-tight">Painel Use Azevedo</h2>
              <p className="text-xs text-gray-500 mt-0.5">Olá, Amanda</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <a 
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xs flex items-center gap-1"
              title="Ver Loja Online"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Loja</span>
            </a>
            <button 
              onClick={handleLogout}
              className="p-2 text-xs text-red-600 hover:bg-red-50 border border-red-100 rounded-xs"
              title="Sair do Painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-4 gap-1 md:gap-2 scrollbar-none">
          <Link 
            href="/admin/pedidos"
            className={`flex items-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-colors whitespace-nowrap ${
              pathname.includes('/admin/pedidos') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold border border-green-200/60' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 shrink-0" />
            Pedidos
          </Link>
          <Link 
            href="/admin/produtos"
            className={`flex items-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-colors whitespace-nowrap ${
              pathname.includes('/admin/produtos') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold border border-green-200/60' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 shrink-0" />
            Catálogo & Cores
          </Link>
          <Link 
            href="/admin/personalizacao"
            className={`flex items-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-colors whitespace-nowrap ${
              pathname.includes('/admin/personalizacao') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold border border-green-200/60' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 shrink-0" />
            Banners & Stories
          </Link>
          <Link 
            href="/admin/cupons"
            className={`flex items-center px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm rounded-sm transition-colors whitespace-nowrap ${
              pathname.includes('/admin/cupons') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold border border-green-200/60' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Ticket className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 shrink-0" />
            Cupons
          </Link>
        </nav>

        <div className="hidden md:block p-4 border-t border-gray-200 space-y-2 mt-auto">
          <a 
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-sm"
          >
            <ExternalLink className="w-5 h-5 mr-3" />
            Ver Loja Online
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
