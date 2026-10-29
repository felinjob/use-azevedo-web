'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUIStore } from '@/lib/store/ui'

export default function Footer() {
  const { openSizeGuide } = useUIStore()
  return (
    <footer className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] pt-16 pb-24 md:pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <Image 
                src="/logo-ua.png" 
                alt="Loja Use Azevedo" 
                width={80} 
                height={80} 
                className="object-contain" 
                style={{ width: '80px', height: 'auto' }}
              />
            </div>
            <p className="text-sm font-light text-[var(--color-brand-ivory)]/75 leading-relaxed mb-5">
              A marca que entende as suas curvas. Moda mid e plus size do 44 ao 56+ com modelagem autoral, tecidos estruturados e caimento impecável.
            </p>
            <p className="text-xs uppercase tracking-widest text-[var(--color-brand-ivory)]/80 font-semibold">Polo Rio de Janeiro — RJ</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Atendimento</h3>
            <ul className="space-y-3 text-sm font-light text-[var(--color-brand-ivory)]/70">
              <li><a href="https://wa.me/5521978594358" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-ivory)] transition-colors">WhatsApp: (21) 97859-4358</a></li>
              <li><a href="https://instagram.com/useazevedo" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-ivory)] transition-colors">Instagram: @useazevedo</a></li>
              <li><a href="mailto:useazevedoo@gmail.com" className="hover:text-[var(--color-brand-ivory)] transition-colors">useazevedoo@gmail.com</a></li>
              <li><Link href="/rastreio" className="hover:text-[var(--color-brand-ivory)] transition-colors">Rastreie seu pedido</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Institucional</h3>
            <ul className="space-y-3 text-sm font-light text-[var(--color-brand-ivory)]/70">
              <li><Link href="/sobre" className="hover:text-[var(--color-brand-ivory)] transition-colors">Nossa História</Link></li>
              <li><Link href="/duvidas" className="hover:text-[var(--color-brand-ivory)] transition-colors font-medium">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link href="/politica-de-trocas" className="hover:text-[var(--color-brand-ivory)] transition-colors">Política de Trocas e Devoluções</Link></li>
              <li><button onClick={openSizeGuide} className="hover:text-[var(--color-brand-ivory)] transition-colors text-left w-full cursor-pointer">Guia de Medidas (44 ao 56+)</button></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Compra Segura</h3>
            <div className="flex flex-col gap-4">
              <span className="text-xs text-[var(--color-brand-ivory)]/65 leading-relaxed">
                Ambiente criptografado ponta a ponta via InfinitePay. Primeira troca grátis em até 7 dias corridos.
              </span>
              <div className="flex flex-wrap gap-2">
                <div className="px-2.5 h-7 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded-xs flex items-center justify-center text-[10px] text-[var(--color-brand-ivory)] font-bold tracking-wider">PIX</div>
                <div className="px-2.5 h-7 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded-xs flex items-center justify-center text-[10px] text-[var(--color-brand-ivory)] font-bold tracking-wider">VISA</div>
                <div className="px-2.5 h-7 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded-xs flex items-center justify-center text-[10px] text-[var(--color-brand-ivory)] font-bold tracking-wider">MASTERCARD</div>
                <div className="px-2.5 h-7 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded-xs flex items-center justify-center text-[10px] text-[var(--color-brand-ivory)] font-bold tracking-wider">ELO</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-brand-green-surface)] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[var(--color-brand-ivory)]/40">
          <p>© {new Date().getFullYear()} Use Azevedo. Todos os direitos reservados.</p>
          <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-center gap-4">
            <p>CNPJ: 63.157.524/0001-00 — Use Azevedo Moda Feminina</p>
            <p className="hidden md:block text-[var(--color-brand-ivory)]/20">•</p>
            <p className="flex items-center gap-1 px-2 py-0.5">
              Desenvolvido por <a href="https://darkmode.id" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--color-brand-ivory)] hover:underline opacity-80 hover:opacity-100 transition-opacity">darkmode.id</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

