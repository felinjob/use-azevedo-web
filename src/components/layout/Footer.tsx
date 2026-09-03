import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-offwhite)] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-serif text-[var(--color-brand-gold)] font-bold mb-4">USE AZEVEDO</h2>
            <p className="text-sm font-light text-gray-300 leading-relaxed mb-6">
              A marca que entende as suas curvas. Moda mid e plus size com modelagem exclusiva, alfaiataria premium e caimento impecável.
            </p>
            <p className="text-sm font-bold">Polo Rio de Janeiro - RJ</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[var(--color-brand-gold-light)] font-semibold tracking-wider uppercase text-sm mb-5">Atendimento</h3>
            <ul className="space-y-3 text-sm font-light text-gray-300">
              <li><a href="https://wa.me/5521978594358" className="hover:text-[var(--color-brand-gold)] transition-colors">WhatsApp: (21) 97859-4358</a></li>
              <li><a href="mailto:contato@useazevedo.com.br" className="hover:text-[var(--color-brand-gold)] transition-colors">contato@useazevedo.com.br</a></li>
              <li><Link href="/rastreio" className="hover:text-[var(--color-brand-gold)] transition-colors">Rastreie seu pedido</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--color-brand-gold-light)] font-semibold tracking-wider uppercase text-sm mb-5">Institucional</h3>
            <ul className="space-y-3 text-sm font-light text-gray-300">
              <li><Link href="/sobre" className="hover:text-[var(--color-brand-gold)] transition-colors">Nossa História</Link></li>
              <li><strong className="text-white"><Link href="/politica-de-trocas" className="hover:text-[var(--color-brand-gold)] transition-colors">Política de Trocas e Devoluções</Link></strong></li>
              <li><Link href="/prazos" className="hover:text-[var(--color-brand-gold)] transition-colors">Prazos de Entrega</Link></li>
              <li><Link href="/guia-medidas" className="hover:text-[var(--color-brand-gold)] transition-colors">Guia de Medidas</Link></li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-[var(--color-brand-gold-light)] font-semibold tracking-wider uppercase text-sm mb-5">Compra Segura</h3>
            <div className="flex flex-col gap-4">
              <span className="text-xs text-gray-300">Seus dados são criptografados e protegidos (PCI Compliance).</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[8px] text-black font-bold">PIX</div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[8px] text-black font-bold">VISA</div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[8px] text-black font-bold">MASTER</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#114b2d] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Use Azevedo. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  )
}
