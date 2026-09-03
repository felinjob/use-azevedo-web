import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full bg-[#1A2420] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-green-deep)] to-transparent opacity-80 z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[var(--color-brand-offwhite)] leading-tight drop-shadow-lg mb-6">
          Moda que valoriza a <br className="hidden md:block"/>
          <span className="text-[var(--color-brand-gold-light)] italic">sua melhor versão</span>
        </h1>
        <p className="text-[var(--color-brand-offwhite)] text-lg md:text-xl mb-10 max-w-2xl font-light tracking-wide drop-shadow-md">
          Peças exclusivas mid e plus size desenvolvidas com excelência em alfaiataria, modelagem e caimento.
        </p>
        <Link 
          href="#colecao"
          className="bg-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold-light)] text-[var(--color-brand-dark)] px-10 py-4 text-sm tracking-[0.2em] uppercase font-bold transition-all duration-300 shadow-xl"
        >
          Ver Coleção
        </Link>
      </div>
    </section>
  )
}
