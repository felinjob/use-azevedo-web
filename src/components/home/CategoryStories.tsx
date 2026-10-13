'use client'

import Link from 'next/link'
import Image from 'next/image'

export interface StoryCircleItem {
  id: string
  title: string
  imageUrl: string
  linkUrl: string
}

interface CategoryStoriesProps {
  stories?: StoryCircleItem[]
}

export default function CategoryStories({ stories = [] }: CategoryStoriesProps) {
  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <section className="bg-[var(--color-brand-canvas)] pt-6 pb-2 border-b border-[var(--color-brand-muted)]/15">
      <div className="w-full max-w-7xl mx-auto">
        <div className="w-full overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div 
            className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 lg:px-8 pb-4 md:pb-2 snap-x w-fit min-w-full mx-auto md:flex-wrap" 
          >
            {[
              { id: '1', title: 'Vestidos', linkUrl: '/?categoria=vestidos-e-vestidos-curtos', img: stories.find(s => s.title.toLowerCase().includes('vestido'))?.imageUrl },
              { id: '2', title: 'Croppeds & Blusas', linkUrl: '/?categoria=cropped-e-blusas', img: stories.find(s => s.title.toLowerCase().includes('crop') || s.title.toLowerCase().includes('blusa'))?.imageUrl },
              { id: '3', title: 'Conjuntos', linkUrl: '/?categoria=macaquinhos-e-conjuntos', img: stories.find(s => s.title.toLowerCase().includes('conjunto') || s.title.toLowerCase().includes('macaquinho'))?.imageUrl },
              { id: '4', title: 'Saias & Shorts', linkUrl: '/?categoria=saias-calcas-e-shorts', img: stories.find(s => { const t = s.title.toLowerCase(); return t.includes('saia') || t.includes('short') || t.includes('calça') || t.includes('calca') })?.imageUrl }
            ].map((story) => {
            const targetUrl = `${story.linkUrl}#colecao`
            return (
              <Link 
                key={story.id} 
                href={targetUrl}
                className="flex flex-col items-center gap-2 min-w-[74px] sm:min-w-[84px] md:min-w-[96px] snap-start group cursor-pointer"
              >
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-[2px] bg-[var(--color-brand-green-deep)] ring-2 ring-[var(--color-brand-ivory)] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-gray-100">
                    {story.img ? (
                      <Image 
                        src={story.img}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="80px"
                      />
                    ) : (
                      // Sem imagem cadastrada: mostra a inicial em vez de uma imagem quebrada
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] font-serif text-xl">
                        {story.title.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-[var(--color-brand-dark)] text-center leading-tight group-hover:text-[var(--color-brand-green-deep)] transition-colors">
                  {story.title}
                </span>
              </Link>
            )
          })}
          </div>
        </div>
      </div>
    </section>
  )
}
