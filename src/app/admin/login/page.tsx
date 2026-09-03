'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciais inválidas. Tente novamente.')
      setIsLoading(false)
    } else {
      router.push('/admin/pedidos')
      router.refresh() // Ensure server components re-fetch auth state
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white p-8 border border-gray-200 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-brand-dark)] text-white font-serif text-3xl flex items-center justify-center mx-auto mb-4">
            UA
          </div>
          <h1 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-1">Painel de Gestão</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Use Azevedo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">E-mail Administrativo</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors"
              placeholder="amanda@useazevedo.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Senha</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:border-[var(--color-brand-green-deep)] outline-none bg-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[var(--color-brand-dark)] text-white py-4 font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Autenticando...' : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Acessar Painel
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
