'use client'

import Link from 'next/link'
import Image from 'next/image'

const STORIES = [
  { label: 'Novidades', image: 'https://images.unsplash.com/photo-1550614000-4b95d4e16dce?w=200&q=80', query: '?filtro=novidades' },
  { label: 'Vestidos', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&q=80', query: '?categoria=vestidos-e-conjuntos' },
  { label: 'Pronta Entrega', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&q=80', query: '?disponibilidade=READY_TO_SHIP' },
  { label: 'Alfaiataria', image: 'https://images.unsplash.com/photo-1594938298596-eb5fd3f6b4f6?w=200&q=80', query: '?busca=alfaiataria' },
  { label: 'Sob Encomenda', image: 'https://images.unsplash.com/photo-1558769132-cb1fac9facf4?w=200&q=80', query: '?disponibilidade=MADE_TO_ORDER' },
]

export default function CategoryStories() {
  return (
    <section className="bg-[var(--color-brand-canvas)] pt-6 pb-2 border-b border-[var(--color-brand-muted)]/15">
      <div className="container mx-auto px-4">
        {/* Hide scrollbar for a clean look but allow touch scrolling */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {STORIES.map((story) => (
            <Link 
              key={story.label} 
              href={story.query}
              className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[88px] snap-start group"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-[var(--color-brand-green-deep)] group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full border-2 border-[var(--color-brand-canvas)] overflow-hidden relative">
                  <Image 
                    src={story.image}
                    alt={story.label}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-[var(--color-brand-dark)] text-center leading-tight">{story.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
