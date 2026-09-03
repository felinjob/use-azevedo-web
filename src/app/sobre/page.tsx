import Image from 'next/image'
import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-brand-offwhite)]">
      <Topbar />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] bg-[var(--color-brand-dark)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <Image 
              src="https://images.unsplash.com/photo-1550614000-4b95d466f39e?q=80&w=1600"
              alt="Ateliê de Costura"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-brand-cream)] mb-4">A Nossa História</h1>
            <p className="text-[var(--color-brand-cream)] uppercase tracking-widest text-sm font-medium">Moda que valoriza você.</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
          <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="text-xl text-[var(--color-brand-dark)] font-serif mb-8 text-center leading-relaxed">
                "Nós acreditamos que a moda precisa se adaptar ao seu corpo, e não o contrário. A Use Azevedo nasceu do desejo de criar roupas elegantes, confortáveis e empoderadoras para mulheres reais."
              </p>

              <div className="grid md:grid-cols-2 gap-12 items-center my-12">
                <div>
                  <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-4">Grade que Abraça</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    Historicamente, o mercado de moda marginalizou os corpos fora do padrão de passarela. Na Use Azevedo, nosso compromisso é com a grade Mid e Plus Size, partindo do tamanho 44 até o 56+.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Nossa modelagem é estudada minuciosamente. Escolhemos tecidos com a elasticidade ideal e desenvolvemos cinturas, cavas e bustos que proporcionam sustentação e caimento perfeito.
                  </p>
                </div>
                <div className="relative aspect-square bg-gray-100">
                  <Image 
                    src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" 
                    alt="Processo de modelagem" 
                    fill 
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center my-12">
                <div className="relative aspect-square bg-gray-100 order-2 md:order-1">
                  <Image 
                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80" 
                    alt="Costura artesanal" 
                    fill 
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-4">Produção Artesanal no RJ</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    Nós operamos no coração do Rio de Janeiro. Ao invés do <i>fast fashion</i> desenfreado, nós valorizamos o movimento <i>slow fashion</i> e a produção ética.
                  </p>
                  <p className="text-sm leading-relaxed">
                    A maioria de nossas peças é confeccionada <strong>Sob Encomenda</strong>. Isso significa que, a partir do momento em que você compra, a Amanda corta e costura a peça exclusivamente para o seu corpo, reduzindo o desperdício de tecido e garantindo exclusividade.
                  </p>
                </div>
              </div>

              <div className="text-center mt-16 pt-12 border-t border-gray-100">
                <h3 className="text-2xl font-serif text-[var(--color-brand-dark)] mb-4">Faça Parte!</h3>
                <p className="text-sm mb-6">Explore nossas últimas coleções e sinta na pele o que é vestir uma peça Use Azevedo.</p>
                <Link href="/" className="inline-block bg-[var(--color-brand-green-deep)] text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-brand-dark)] transition-colors">
                  Acessar Catálogo
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
