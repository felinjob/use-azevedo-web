import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-brand-canvas)] font-sans">
      <Topbar />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative py-24 md:py-32 bg-[var(--color-brand-green-deep)] flex items-center justify-center">
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-brand-ivory)] mb-6 leading-tight">
              Moda que celebra o seu corpo, com caimento pensado para você.
            </h1>
            <p className="text-[var(--color-brand-ivory)]/85 uppercase tracking-[0.2em] text-xs sm:text-sm font-medium">
              A elegância mora no conforto de ser quem você é.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-white p-8 sm:p-12 md:p-16 shadow-xs border border-[var(--color-brand-muted)]/15 rounded-sm">
            <div className="prose prose-lg text-[#4A4A4A] max-w-none">
              
              {/* Introdução */}
              <p className="text-xl sm:text-2xl text-[#1A1A1A] font-serif mb-16 text-center leading-relaxed italic">
                &ldquo;Acreditamos que a moda precisa se adaptar às suas curvas, e nunca o contrário. A Use Azevedo nasceu do compromisso de trazer peças elegantes, confortáveis e empoderadoras para mulheres reais.&rdquo;
              </p>

              {/* Bloco 1 */}
              <div className="my-16 border-l-2 border-[var(--color-brand-green-deep)] pl-6">
                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-4 font-normal">Curadoria Cuidadosa no RJ</h3>
                <p className="text-[15px] leading-relaxed mb-4">
                  Mais do que uma loja, somos um olhar atento no coração do Rio de Janeiro. A Amanda garimpa e seleciona pessoalmente as melhores peças e tecidos do mercado.
                </p>
                <p className="text-[15px] leading-relaxed">
                  Cada modelo do nosso catálogo passa por um crivo rigoroso de toque, elasticidade, sustentação e durabilidade — garantindo que você receba peças com acabamento premium e caimento impecável.
                </p>
              </div>

              {/* Bloco 2 */}
              <div className="my-16 border-l-2 border-[var(--color-brand-gold)] pl-6">
                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-4 font-normal">Grade que Abraça</h3>
                <p className="text-[15px] leading-relaxed mb-4">
                  Historicamente, o mercado tradicional ignorou a diversidade dos corpos femininos. Na Use Azevedo, nossa prioridade é a grade Mid e Plus Size, do tamanho 44 ao 56+.
                </p>
                <p className="text-[15px] leading-relaxed">
                  Escolhemos modelagens que valorizam a silhueta com liberdade de movimento, sofisticação sem esforço e elegância atemporal.
                </p>
              </div>

              <div className="text-center mt-20 pt-12 border-t border-gray-100">
                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-4">Faça Parte!</h3>
                <p className="text-[15px] text-[#4A4A4A] mb-8 max-w-md mx-auto">
                  Explore nossas últimas seleções e sinta na pele o que é vestir uma peça com curadoria Use Azevedo.
                </p>
                <Link 
                  href="/" 
                  className="inline-block bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-10 py-4 font-bold uppercase tracking-widest text-xs rounded-sm hover:opacity-90 transition-all active:scale-98 shadow-sm"
                >
                  Acessar Vitrine
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
