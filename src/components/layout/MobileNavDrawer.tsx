'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Ruler, ChevronRight, Truck, RefreshCw, Info, Sparkles } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import Link from 'next/link'
import Image from 'next/image'

export default function MobileNavDrawer() {
  const { isMenuOpen, closeMenu, openSizeGuide } = useUIStore()

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMenuOpen])

  const handleOpenSizeGuide = () => {
    closeMenu()
    openSizeGuide()
  }

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 bottom-0 left-0 w-[85%] max-w-sm bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header com Logo e Fechar */}
            <div className="p-5 border-b border-[var(--color-brand-green-surface)] flex items-center justify-between">
              <Link href="/" onClick={closeMenu} className="relative w-36 h-10 block">
                <Image
                  src="/logo-use-azevedo.png"
                  alt="Use Azevedo"
                  fill
                  className="object-contain object-left"
                />
              </Link>
              <button
                onClick={closeMenu}
                className="p-1.5 rounded-full text-[var(--color-brand-ivory)]/70 hover:text-[var(--color-brand-ivory)] hover:bg-[var(--color-brand-green-surface)] transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links de Navegação Principal */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-ivory)]/50 block mb-3">
                  Coleção & Departamentos
                </span>
                <nav className="space-y-1">
                  <Link
                    href="/?filtro=novidades#colecao"
                    onClick={closeMenu}
                    className="flex items-center justify-between py-2.5 text-sm font-medium tracking-wide text-[var(--color-brand-ivory)] hover:text-[var(--color-brand-ivory)]/80 transition-colors border-b border-[var(--color-brand-green-surface)]/60"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[var(--color-brand-ivory)]/80" />
                      Novidades
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-ivory)]/40" />
                  </Link>

                  <Link
                    href="/?categoria=vestidos-e-conjuntos#colecao"
                    onClick={closeMenu}
                    className="flex items-center justify-between py-2.5 text-sm font-medium tracking-wide text-[var(--color-brand-ivory)] hover:text-[var(--color-brand-ivory)]/80 transition-colors border-b border-[var(--color-brand-green-surface)]/60"
                  >
                    <span>Vestidos & Conjuntos</span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-ivory)]/40" />
                  </Link>

                  <Link
                    href="/?disponibilidade=READY_TO_SHIP#colecao"
                    onClick={closeMenu}
                    className="flex items-center justify-between py-2.5 text-sm font-medium tracking-wide text-[var(--color-brand-ivory)] hover:text-[var(--color-brand-ivory)]/80 transition-colors border-b border-[var(--color-brand-green-surface)]/60"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Pronta Entrega
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-ivory)]/40" />
                  </Link>

                  <Link
                    href="/?disponibilidade=MADE_TO_ORDER#colecao"
                    onClick={closeMenu}
                    className="flex items-center justify-between py-2.5 text-sm font-medium tracking-wide text-[var(--color-brand-ivory)] hover:text-[var(--color-brand-ivory)]/80 transition-colors border-b border-[var(--color-brand-green-surface)]/60"
                  >
                    <span>Sob Encomenda (Ateliê)</span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-ivory)]/40" />
                  </Link>

                  <button
                    onClick={handleOpenSizeGuide}
                    className="w-full flex items-center justify-between py-2.5 text-sm font-medium tracking-wide text-[var(--color-brand-ivory)] hover:text-[var(--color-brand-ivory)]/80 transition-colors text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <Ruler className="w-4 h-4 text-[var(--color-brand-ivory)]/80" />
                      Guia de Medidas (cm)
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-ivory)]/40" />
                  </button>
                </nav>
              </div>

              {/* Linha Divisória */}
              <div className="border-t border-[var(--color-brand-green-surface)]" />

              {/* Links Institucionais */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-ivory)]/50 block mb-3">
                  Atendimento & Ajuda
                </span>
                <nav className="space-y-1 text-xs">
                  <Link
                    href="/rastreio"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 py-2 text-[var(--color-brand-ivory)]/80 hover:text-[var(--color-brand-ivory)] transition-colors"
                  >
                    <Truck className="w-4 h-4 text-[var(--color-brand-ivory)]/60" />
                    Rastrear Pedido
                  </Link>
                  <Link
                    href="/politica-de-trocas"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 py-2 text-[var(--color-brand-ivory)]/80 hover:text-[var(--color-brand-ivory)] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-[var(--color-brand-ivory)]/60" />
                    Política de Trocas & Devoluções
                  </Link>
                  <Link
                    href="/sobre"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 py-2 text-[var(--color-brand-ivory)]/80 hover:text-[var(--color-brand-ivory)] transition-colors"
                  >
                    <Info className="w-4 h-4 text-[var(--color-brand-ivory)]/60" />
                    Sobre a Use Azevedo
                  </Link>
                </nav>
              </div>
            </div>

            {/* Rodapé do Menu com Botão de Suporte WhatsApp */}
            <div className="p-5 border-t border-[var(--color-brand-green-surface)] bg-[var(--color-brand-green-deep)]/90">
              <a
                href="https://wa.me/5521978594358?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20pelo%20WhatsApp"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] py-3 px-4 rounded-sm font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                Atendimento com Amanda
              </a>
              <p className="text-[10px] text-[var(--color-brand-ivory)]/50 text-center mt-2.5">
                Segunda a Sexta das 9h às 18h • Rio de Janeiro
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
