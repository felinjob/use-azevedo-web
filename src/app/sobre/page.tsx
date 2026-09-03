import Image from 'next/image'
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
        <div className="relative h-[40vh] md:h-[50vh] bg-[var(--color-brand-green-deep)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-25">
            <Image 
              src="https://images.unsplash.com/photo-1550614000-4b95d4e16dce?q=80&w=1600"
              alt="Ateliê de Costura"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-brand-ivory)] mb-3">
              A Nossa História
            </h1>
            <p className="text-[var(--color-brand-ivory)]/85 uppercase tracking-[0.2em] text-xs sm:text-sm font-medium">
              Moda autoral pensada para abraçar suas curvas.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="bg-white p-6 sm:p-10 md:p-14 shadow-xs border border-[var(--color-brand-muted)]/15 rounded-md">
            <div className="prose prose-lg text-[var(--color-brand-muted)] max-w-none">
              <p className="text-lg sm:text-xl md:text-2xl text-[var(--color-brand-dark)] font-serif mb-10 text-center leading-relaxed italic">
                &ldquo;Nós acreditamos que a moda precisa se adaptar ao seu corpo, e não o contrário. A Use Azevedo nasceu do desejo de criar roupas elegantes, confortáveis e empoderadoras para mulheres reais.&rdquo;
              </p>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center my-12">
                <div>
                  <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-4 font-normal">Grade que Abraça</h3>
                  <p className="text-sm leading-relaxed mb-4 text-[var(--color-brand-muted)]">
                    Historicamente, o mercado de moda marginalizou os corpos fora do padrão de passarela. Na Use Azevedo, nosso compromisso é com a grade Mid e Plus Size, partindo do tamanho 44 até o 56+.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
                    Nossa modelagem é estudada minuciosamente. Escolhemos tecidos com a elasticidade ideal e desenvolvemos cinturas, cavas e bustos que proporcionam sustentação e caimento perfeito.
                  </p>
                </div>
                <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden border border-[var(--color-brand-muted)]/15 shadow-2xs">
                  <Image 
                    src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" 
                    alt="Processo de modelagem" 
                    fill 
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center my-12">
                <div className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden border border-[var(--color-brand-muted)]/15 shadow-2xs order-2 md:order-1">
                  <Image 
                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80" 
                    alt="Costura artesanal" 
                    fill 
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-4 font-normal">Produção Artesanal no RJ</h3>
                  <p className="text-sm leading-relaxed mb-4 text-[var(--color-brand-muted)]">
                    Nós operamos no coração do Rio de Janeiro. Ao invés do <i>fast fashion</i> desenfreado, nós valorizamos o movimento <i>slow fashion</i> e a produção ética.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--color-brand-muted)]">
                    A maioria de nossas peças é confeccionada <strong>Sob Encomenda</strong>. Isso significa que, a partir do momento em que você compra, a Amanda corta e costura a peça exclusivamente para o seu corpo, reduzindo o desperdício de tecido e garantindo exclusividade.
                  </p>
                </div>
              </div>

              <div className="text-center mt-14 pt-10 border-t border-[var(--color-brand-muted)]/15">
                <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-3">Faça Parte!</h3>
                <p className="text-sm text-[var(--color-brand-muted)] mb-6">
                  Explore nossas últimas coleções e sinta na pele o que é vestir uma peça Use Azevedo.
                </p>
                <Link 
                  href="/" 
                  className="inline-block bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] px-8 py-3.5 font-bold uppercase tracking-widest text-xs rounded-sm hover:opacity-90 transition-all active:scale-98 shadow-sm"
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
