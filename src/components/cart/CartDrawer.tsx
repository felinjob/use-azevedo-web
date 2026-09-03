'use client'

import { useCartStore } from '@/lib/store/cart'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartDrawer() {
  const { 
    isOpen, 
    closeCart, 
    items, 
    updateQuantity, 
    removeItem, 
    getSubtotal,
    getTotalItems
  } = useCartStore()

  // Hydration fix for Zustand with Persist
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const subtotal = getSubtotal()
  const totalItems = getTotalItems()

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-[var(--color-brand-offwhite)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--color-brand-green-deep)]" />
            <h2 className="text-2xl font-serif text-[var(--color-brand-dark)]">Sua Sacola <span className="text-sm font-sans font-normal text-gray-500">({mounted ? totalItems : 0})</span></h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-[var(--color-brand-dark)] transition-colors rounded-full hover:bg-gray-100"
            aria-label="Fechar Sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!mounted ? null : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
              <p className="text-[var(--color-brand-muted)] font-light max-w-[250px]">
                Sua sacola está vazia. Explore nossa coleção mid e plus size.
              </p>
              <button 
                onClick={closeCart}
                className="bg-[var(--color-brand-dark)] text-white px-8 py-3 tracking-widest text-sm font-bold uppercase shadow-md hover:bg-black transition-all"
              >
                Ver Produtos
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6">
                  {/* Image */}
                  <div className="relative w-24 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                      sizes="96px"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-[var(--color-brand-dark)] line-clamp-2">
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-[var(--color-brand-dark)] font-bold px-2 py-0.5 rounded-sm">
                        Tam: {item.size}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[var(--color-brand-muted)]">
                      {item.availability === 'READY_TO_SHIP' 
                        ? <span className="text-[var(--color-brand-green-deep)] font-medium">Pronta Entrega</span>
                        : <span className="text-[var(--color-brand-gold)] font-medium">Sob Encomenda ({item.productionTimeDays} dias)</span>
                      }
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.availability !== 'MADE_TO_ORDER' && item.quantity >= item.maxStock}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-[var(--color-brand-dark)]">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--color-brand-muted)] text-sm">Subtotal</span>
              <span className="text-xl font-bold text-[var(--color-brand-green-deep)]">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 mb-6 font-light">
              Frete e descontos serão calculados na próxima etapa. Entregas via Motoboy RJ ou envios nacionais.
            </p>
            
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center bg-[var(--color-brand-dark)] hover:bg-black text-white font-bold py-4 px-6 tracking-[0.2em] uppercase transition-colors shadow-lg"
            >
              Finalizar Compra
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
