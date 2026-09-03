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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: scroll horizontal | Desktop (md+): centralizado simétrico com flex-wrap */}
        <div 
          className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-2 snap-x scrollbar-none justify-start md:justify-center md:flex-wrap" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story) => {
            const targetUrl = story.linkUrl.startsWith('/?') ? `${story.linkUrl}#colecao` : story.linkUrl
            return (
              <Link 
                key={story.id} 
                href={targetUrl}
                className="flex flex-col items-center gap-2 min-w-[74px] sm:min-w-[84px] md:min-w-[96px] snap-start group cursor-pointer"
              >
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full p-[2px] bg-[var(--color-brand-green-deep)] ring-2 ring-[var(--color-brand-ivory)] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                    <Image 
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="80px"
                    />
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
    </section>
  )
}
