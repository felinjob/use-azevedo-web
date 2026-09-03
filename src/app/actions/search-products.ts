'use server'

import prisma from '@/lib/prisma'

export interface SearchProductResult {
  id: string
  name: string
  slug: string
  price: number
  image: string
  availability: string
  categoryName: string
}

export async function searchProducts(query: string): Promise<SearchProductResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const cleanQuery = query.trim()

  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: cleanQuery, mode: 'insensitive' } },
          { description: { contains: cleanQuery, mode: 'insensitive' } },
          { fabricDetails: { contains: cleanQuery, mode: 'insensitive' } },
          { category: { name: { contains: cleanQuery, mode: 'insensitive' } } },
        ],
      },
      include: {
        category: true,
      },
      take: 6,
    })

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images[0] || '',
      availability: p.availability,
      categoryName: p.category.name,
    }))
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}
