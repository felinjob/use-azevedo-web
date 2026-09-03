import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // composto por `${productId}-${variantId}`
  productId: string
  variantId: string
  name: string
  slug: string
  price: number
  image: string
  size: string
  color: string
  availability: 'READY_TO_SHIP' | 'MADE_TO_ORDER'
  productionTimeDays: number
  quantity: number
  maxStock: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  hasMadeToOrderItems: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      addItem: (item) => {
        set((state) => {
          const id = `${item.productId}-${item.variantId}`
          const existingItemIndex = state.items.findIndex((i) => i.id === id)

          if (existingItemIndex >= 0) {
            const newItems = [...state.items]
            const existingItem = newItems[existingItemIndex]
            
            // Increment respecting maxStock (unless MADE_TO_ORDER which can bypass stock limits, assuming maxStock = 99 or handled gracefully)
            const newQuantity = existingItem.quantity + item.quantity
            const limit = existingItem.availability === 'MADE_TO_ORDER' ? 99 : existingItem.maxStock
            
            if (newQuantity <= limit) {
              existingItem.quantity = newQuantity
            } else {
              existingItem.quantity = limit
            }
            
            return { items: newItems }
          } else {
            return { items: [...state.items, { ...item, id }] }
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, delta) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === id) {
              const newQuantity = item.quantity + delta
              const limit = item.availability === 'MADE_TO_ORDER' ? 99 : item.maxStock
              
              if (newQuantity > 0 && newQuantity <= limit) {
                return { ...item, quantity: newQuantity }
              }
            }
            return item
          })
          return { items: newItems }
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      hasMadeToOrderItems: () => {
        const { items } = get()
        return items.some((item) => item.availability === 'MADE_TO_ORDER')
      },
    }),
    {
      name: '@useazevedo:cart',
    }
  )
)
