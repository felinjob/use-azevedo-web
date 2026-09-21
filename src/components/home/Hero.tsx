'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export interface HeroSlideItem {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  linkUrl: string
}

interface HeroProps {
  slides?: HeroSlideItem[]
}

export default function Hero({ slides = [] }: HeroProps) {
  const hasSlides = Boolean(slides && slides.length > 0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasSlides && slides.length > 1 },
    hasSlides && slides.length > 1 ? [Autoplay({ delay: 6000, stopOnInteraction: false })] : []
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

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

  if (!hasSlides) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gray-100">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, idx) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={slide.id}>
              {/* Slide Image */}
              <div className="relative h-[65vh] sm:h-[75vh] md:h-[80vh] w-full">
                <Image 
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-[center_30%]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/35" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-2xl mx-auto">
                      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[var(--color-brand-ivory)] mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-sm">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="text-base sm:text-lg md:text-xl text-[var(--color-brand-ivory)]/90 mb-8 sm:mb-10 font-light max-w-xl mx-auto drop-shadow-xs">
                          {slide.subtitle}
                        </p>
                      )}
                      <Link 
                        href={slide.linkUrl.startsWith('/?') ? `${slide.linkUrl}#colecao` : slide.linkUrl}
                        className="inline-block bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] px-8 py-3.5 sm:py-4 uppercase tracking-[0.2em] text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-lg active:scale-98"
                      >
                        Explorar Coleção
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
      {slides.length > 1 && (
        <>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-1 transition-all duration-300 rounded-full ${index === selectedIndex ? 'w-8 bg-[var(--color-brand-ivory)]' : 'w-4 bg-[var(--color-brand-ivory)]/40 hover:bg-[var(--color-brand-ivory)]/70'}`}
                onClick={() => scrollTo(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/20 text-[#1A1A1A] hover:scale-105 transition-all p-3 shadow-md rounded-full"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={scrollNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/20 text-[#1A1A1A] hover:scale-105 transition-all p-3 shadow-md rounded-full"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  )
}
