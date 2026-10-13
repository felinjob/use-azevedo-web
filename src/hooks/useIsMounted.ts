import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Hook para detectar se o componente já está montado no cliente.
 * Utiliza `useSyncExternalStore` (padrão oficial React 18/19),
 * evitando renderizações em cascata e alertas de pureza de efeitos.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
