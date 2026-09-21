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
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="w-12 h-12 bg-[var(--color-brand-dark)] text-white font-serif text-2xl flex items-center justify-center mx-auto mb-3">
            UA
          </div>
          <h2 className="font-serif text-[var(--color-brand-dark)] font-medium">Painel Admin</h2>
          <p className="text-xs text-gray-500 mt-1">Olá, Amanda</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin/pedidos"
            className={`flex items-center px-4 py-3 text-sm rounded-sm transition-colors ${
              pathname.includes('/admin/pedidos') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            Gestão de Pedidos
          </Link>
          <Link 
            href="/admin/produtos"
            className={`flex items-center px-4 py-3 text-sm rounded-sm transition-colors ${
              pathname.includes('/admin/produtos') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Catálogo
          </Link>
          <Link 
            href="/admin/personalizacao"
            className={`flex items-center px-4 py-3 text-sm rounded-sm transition-colors ${
              pathname.includes('/admin/personalizacao') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5 mr-3" />
            Banners & Stories
          </Link>
          <Link 
            href="/admin/cupons"
            className={`flex items-center px-4 py-3 text-sm rounded-sm transition-colors ${
              pathname.includes('/admin/cupons') 
                ? 'bg-green-50 text-[var(--color-brand-green-deep)] font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Ticket className="w-5 h-5 mr-3" />
            Cupons & Promoções
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <a 
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-3" />
            Ver Loja Online
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-sm"
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
