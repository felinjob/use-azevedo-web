'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515347619362-675276537eb0?auto=format&fit=crop&q=80',
    title: 'Nova Coleção Essência',
    subtitle: 'Moda autoral do 44 ao 56, feita para abraçar as suas curvas.',
    cta: 'Ver Lançamentos',
    link: '/?filtro=novidades',
    align: 'center'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80',
    title: 'Vestidos em Linho',
    subtitle: 'Leveza e sofisticação em peças atemporais.',
    cta: 'Comprar Vestidos',
    link: '/?categoria=vestidos-e-conjuntos',
    align: 'left'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80',
    title: 'Feito Sob Medida',
    subtitle: 'Nossas peças sob encomenda garantem exclusividade e caimento perfeito.',
    cta: 'Descobrir',
    link: '/?disponibilidade=MADE_TO_ORDER',
    align: 'center'
  }
]

export default function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="relative overflow-hidden bg-gray-100">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {SLIDES.map((slide) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={slide.id}>
              {/* Slide Image */}
              <div className="relative h-[70vh] sm:h-[80vh] w-full">
                <Image 
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === 1}
                  className="object-cover object-[center_30%]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`container mx-auto px-6 md:px-12 ${slide.align === 'left' ? 'text-left' : 'text-center'}`}>
                    <div className={`max-w-2xl ${slide.align === 'center' ? 'mx-auto' : ''}`}>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[var(--color-brand-ivory)] mb-4 sm:mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-lg sm:text-xl text-[var(--color-brand-ivory)]/80 mb-8 sm:mb-10 font-light max-w-xl mx-auto md:mx-0">
                        {slide.subtitle}
                      </p>
                      <Link 
                        href={slide.link}
                        className="inline-block bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] px-8 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`h-1 transition-all duration-300 rounded-full ${index === selectedIndex ? 'w-8 bg-[var(--color-brand-ivory)]' : 'w-4 bg-[var(--color-brand-ivory)]/40 hover:bg-[var(--color-brand-ivory)]/70'}`}
            onClick={() => scrollTo(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
