import Topbar from '@/components/layout/Topbar'
import Header from '@/components/layout/Header'
import Hero from '@/components/home/Hero'
import ProductCard from '@/components/products/ProductCard'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'

export default async function Home() {
  // Buscar os produtos direto do Prisma
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: {
      category: true,
      variants: true,
    },
    take: 6,
  })

  const sizes = ['44', '46', '48', '50', '52', '54', 'G1', 'G2']

  return (
    <div className="min-h-screen bg-[var(--color-brand-offwhite)] font-sans">
      <Topbar />
      <Header />
      
      <main>
        <Hero />
        
        {/* Seletor Rápido de Tamanhos */}
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-[var(--color-brand-muted)] uppercase tracking-wider mb-4">
              Encontre o seu tamanho
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {sizes.map((size) => (
                <button 
                  key={size}
                  className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-sm font-bold text-[var(--color-brand-dark)] hover:border-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold)] hover:text-white transition-all"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Vitrine de Produtos */}
        <section id="colecao" className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-brand-dark)] mb-4">Lançamentos</h2>
              <div className="w-16 h-1 bg-[var(--color-brand-gold)]"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
