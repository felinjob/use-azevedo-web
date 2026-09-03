import { create } from 'zustand'

interface UIStore {
  isSearchOpen: boolean
  isMenuOpen: boolean
  isSizeGuideOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  openMenu: () => void
  closeMenu: () => void
  openSizeGuide: () => void
  closeSizeGuide: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  isMenuOpen: false,
  isSizeGuideOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  openSizeGuide: () => set({ isSizeGuideOpen: true }),
  closeSizeGuide: () => set({ isSizeGuideOpen: false }),
}))
