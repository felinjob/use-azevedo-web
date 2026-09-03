import prisma from '@/lib/prisma'
import PersonalizacaoClient, { SerializedHighlight } from '@/components/admin/PersonalizacaoClient'

export const dynamic = 'force-dynamic'

export default async function PersonalizacaoPage() {
  const allHighlights = await prisma.bannerHighlight.findMany({
    orderBy: {
      order: 'asc',
    },
  })

  const serialized: SerializedHighlight[] = allHighlights.map((h) => ({
    id: h.id,
    title: h.title,
    subtitle: h.subtitle,
    imageUrl: h.imageUrl,
    linkUrl: h.linkUrl,
    type: h.type,
    order: h.order,
    active: h.active,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  }))

  const heroSlides = serialized.filter((h) => h.type === 'HERO_SLIDE')
  const storyCircles = serialized.filter((h) => h.type === 'STORY_CIRCLE')

  return (
    <PersonalizacaoClient
      heroSlides={heroSlides}
      storyCircles={storyCircles}
    />
  )
}
