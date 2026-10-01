import prisma from '@/lib/prisma'
import Hero from '@/components/home/Hero'
import CategoryStories from '@/components/home/CategoryStories'

export default async function HomeHeroBanner({ isCatalogView }: { isCatalogView: boolean }) {
  const highlights = await prisma.bannerHighlight.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })

  const heroSlides = highlights.filter((h) => h.type === 'HERO_SLIDE')
  const storyCircles = highlights.filter((h) => h.type === 'STORY_CIRCLE')

  return (
    <>
      {!isCatalogView && <Hero slides={heroSlides} />}
      <CategoryStories stories={storyCircles} />
    </>
  )
}
