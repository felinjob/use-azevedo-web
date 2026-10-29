'use client'

import Link from 'next/link'
import Image from 'next/image'
import { parseHeroImage } from '@/lib/hero-framing'

export interface StoryCircleItem {
  id: string
  title: string
  imageUrl: string
  linkUrl: string
}

interface CategoryStoriesProps {
  stories?: StoryCircleItem[]
}

const DEFAULT_CATEGORIES: StoryCircleItem[] = [
  { id: 'def-1', title: 'Vestidos', linkUrl: '/?categoria=vestidos-e-vestidos-curtos', imageUrl: '' },
  { id: 'def-2', title: 'Croppeds & Blusas', linkUrl: '/?categoria=cropped-e-blusas', imageUrl: '' },
  { id: 'def-3', title: 'Conjuntos', linkUrl: '/?categoria=macaquinhos-e-conjuntos', imageUrl: '' },
  { id: 'def-4', title: 'Saias & Calças', linkUrl: '/?categoria=saias-calcas-e-shorts', imageUrl: '' },
]

export default function CategoryStories({ stories = [] }: CategoryStoriesProps) {
  const displayStories = stories && stories.length > 0 ? stories : DEFAULT_CATEGORIES

  return (
    <section className="bg-[var(--color-brand-canvas)] pt-6 pb-3 border-b border-[var(--color-brand-muted)]/15">
      <div className="w-full max-w-7xl mx-auto">
        <div className="w-full overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div 
            className="flex items-center justify-center gap-5 sm:gap-7 md:gap-9 lg:gap-12 px-4 sm:px-6 lg:px-8 pb-3 md:pb-2 snap-x w-fit min-w-full mx-auto md:flex-wrap" 
          >
            {displayStories.map((story) => {
              const targetUrl = story.linkUrl.includes('#')
                ? story.linkUrl
                : story.linkUrl.startsWith('/?')
                  ? `${story.linkUrl}#colecao`
                  : story.linkUrl

              return (
                <Link 
                  key={story.id} 
                  href={targetUrl}
                  className="flex flex-col items-center gap-2 min-w-[76px] sm:min-w-[88px] md:min-w-[96px] snap-start group cursor-pointer"
                >
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-[2px] bg-[var(--color-brand-green-deep)] ring-2 ring-[var(--color-brand-ivory)] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-[var(--color-brand-ivory)]">
                      {story.imageUrl ? (
                        <Image 
                          src={parseHeroImage(story.imageUrl).cleanUrl}
                          alt={story.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--color-brand-ivory)] text-[var(--color-brand-green-deep)] font-serif text-xl font-semibold">
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

