import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <span className="font-serif text-3xl tracking-tight font-medium text-[var(--color-brand-ivory)]">Use Azevedo</span>
            </div>
            <p className="text-sm font-light text-[var(--color-brand-ivory)]/60 leading-relaxed mb-6">
              A marca que entende as suas curvas. Moda mid e plus size com modelagem exclusiva, alfaiataria premium e caimento impecável.
            </p>
            <p className="text-sm font-bold">Polo Rio de Janeiro - RJ</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Atendimento</h3>
            <ul className="space-y-3 text-sm font-light text-[var(--color-brand-ivory)]/60">
              <li><a href="https://wa.me/5521978594358" className="hover:text-[var(--color-brand-ivory)] transition-colors">WhatsApp: (21) 97859-4358</a></li>
              <li><a href="mailto:contato@useazevedo.com.br" className="hover:text-[var(--color-brand-ivory)] transition-colors">contato@useazevedo.com.br</a></li>
              <li><Link href="/rastreio" className="hover:text-[var(--color-brand-ivory)] transition-colors">Rastreie seu pedido</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Institucional</h3>
            <ul className="space-y-3 text-sm font-light text-[var(--color-brand-ivory)]/60">
              <li><Link href="/sobre" className="hover:text-[var(--color-brand-ivory)] transition-colors">Nossa História</Link></li>
              <li><Link href="/duvidas" className="hover:text-[var(--color-brand-ivory)] transition-colors font-medium">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link href="/politica-de-trocas" className="hover:text-[var(--color-brand-ivory)] transition-colors">Política de Trocas e Devoluções</Link></li>
              <li><Link href="/prazos" className="hover:text-[var(--color-brand-ivory)] transition-colors">Prazos de Entrega</Link></li>
              <li><Link href="/guia-medidas" className="hover:text-[var(--color-brand-ivory)] transition-colors">Guia de Medidas</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-[var(--color-brand-ivory)] font-semibold tracking-[0.1em] uppercase text-[13px] mb-5">Compra Segura</h3>
            <div className="flex flex-col gap-4">
              <span className="text-xs text-[var(--color-brand-ivory)]/50">Seus dados são criptografados e protegidos (PCI Compliance).</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded flex items-center justify-center text-[8px] text-[var(--color-brand-ivory)] font-bold">PIX</div>
                <div className="w-10 h-6 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded flex items-center justify-center text-[8px] text-[var(--color-brand-ivory)] font-bold">VISA</div>
                <div className="w-10 h-6 bg-[var(--color-brand-ivory)]/10 border border-[var(--color-brand-ivory)]/20 rounded flex items-center justify-center text-[8px] text-[var(--color-brand-ivory)] font-bold">MASTER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-brand-green-surface)] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[var(--color-brand-ivory)]/40">
          <p>© {new Date().getFullYear()} Use Azevedo. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  )
}

