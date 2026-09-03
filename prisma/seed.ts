import { PrismaClient, AvailabilityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Categorias
  const catVestidos = await prisma.category.upsert({
    where: { slug: 'vestidos-e-conjuntos' },
    update: {},
    create: {
      name: 'Vestidos & Conjuntos',
      slug: 'vestidos-e-conjuntos',
      description: 'Peças únicas e conjuntos completos para um visual refinado e prático.',
    },
  })

  const catBlusas = await prisma.category.upsert({
    where: { slug: 'blusas-e-camisas' },
    update: {},
    create: {
      name: 'Blusas & Camisas',
      slug: 'blusas-e-camisas',
      description: 'Tops elegantes, camisas em alfaiataria e blusas fluidas.',
    },
  })

  const catCalcas = await prisma.category.upsert({
    where: { slug: 'calcas-e-saias' },
    update: {},
    create: {
      name: 'Calças & Saias',
      slug: 'calcas-e-saias',
      description: 'Bottoms com caimento impecável e modelagem exclusiva.',
    },
  })

  // Produtos
  const products = [
    {
      name: 'Vestido Midi Envelope Jade',
      slug: 'vestido-midi-envelope-jade',
      description: 'Um vestido envelope clássico que valoriza a silhueta, com amarração ajustável e comprimento midi elegante. Perfeito para eventos diurnos ou reuniões de trabalho.',
      price: 289.90,
      originalPrice: 349.90,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Crepe Duna de alta gramatura (não amassa), forro 100% poliéster. Alta elasticidade no ajuste da cintura.',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'],
      categoryId: catVestidos.id,
    },
    {
      name: 'Conjunto Pantalona Linho Carioca',
      slug: 'conjunto-pantalona-linho-carioca',
      description: 'Elegância e frescor em um conjunto de calça pantalona e cropped alongado. A modelagem plus size garante conforto absoluto sem perder a sofisticação.',
      price: 349.90,
      originalPrice: null,
      availability: AvailabilityType.MADE_TO_ORDER,
      productionTimeDays: 7,
      fabricDetails: 'Linho misto (70% Viscose, 30% Linho). Sem forro na calça. Toque rústico com caimento leve e zero transparência.',
      images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80'],
      categoryId: catVestidos.id,
    },
    {
      name: 'Blusa Transpassada Terracota',
      slug: 'blusa-transpassada-terracota',
      description: 'Blusa transpassada com decote em V na medida certa, valorizando o colo. Mangas fluidas que trazem um ar romântico e sofisticado.',
      price: 159.90,
      originalPrice: 189.90,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Viscolinho premium, toque macio, com leve elasticidade mecânica. Modelagem ampla.',
      images: ['https://images.unsplash.com/photo-1550614000-4b95dd24495e?w=800&q=80'],
      categoryId: catBlusas.id,
    },
    {
      name: 'Camisa Alfaiataria Off-White',
      slug: 'camisa-alfaiataria-off-white',
      description: 'O clássico guarda-roupa inteligente. Camisa de botão alongada, perfeita para sobreposições ou looks executivos de alto padrão.',
      price: 219.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Tricoline com elastano (97% algodão, 3% elastano). Estruturada, porém confortável ao toque.',
      images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80'],
      categoryId: catBlusas.id,
    },
    {
      name: 'Calça Alfaiataria Reta Esmeralda',
      slug: 'calca-alfaiataria-reta-esmeralda',
      description: 'Calça reta em tecido de alfaiataria premium. Cós alto estruturado e pences traseiras para encaixe perfeito nas curvas.',
      price: 279.90,
      originalPrice: null,
      availability: AvailabilityType.MADE_TO_ORDER,
      productionTimeDays: 7,
      fabricDetails: 'Crepe alfaiataria (95% Poliéster, 5% Elastano). Excelente elasticidade e estrutura.',
      images: ['https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80'],
      categoryId: catCalcas.id,
    },
    {
      name: 'Saia Midi Evasê Marinho',
      slug: 'saia-midi-evase-marinho',
      description: 'Fluidez e movimento. Saia midi com corte evasê, barra assimétrica e bolsos invisíveis laterais.',
      price: 199.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Viscose sarjada (100% viscose). Caimento pesado e sofisticado, sem forro mas não marca.',
      images: ['https://images.unsplash.com/photo-1583496922316-29158fb7eaeb?w=800&q=80'],
      categoryId: catCalcas.id,
    }
  ]

  const sizes = ['44', '46', '48', '50', '52', '54']
  
  for (const prodData of products) {
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: {
        name: prodData.name,
        slug: prodData.slug,
        description: prodData.description,
        price: prodData.price,
        originalPrice: prodData.originalPrice,
        availability: prodData.availability,
        productionTimeDays: prodData.productionTimeDays,
        fabricDetails: prodData.fabricDetails,
        images: prodData.images,
        categoryId: prodData.categoryId,
        active: true,
        featured: true,
      }
    })

    // Variantes
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i]
      const baseBust = 104 + (i * 4) // 104cm para 44, +4cm por tam
      const baseWaist = 86 + (i * 4)
      const baseHip = 114 + (i * 4)
      
      await prisma.productVariant.upsert({
        where: { sku: `${product.slug}-${size}-001` },
        update: {},
        create: {
          productId: product.id,
          size: size,
          color: 'Padrão',
          colorHex: '#003D1E',
          sku: `${product.slug}-${size}-001`,
          stockQuantity: product.availability === 'MADE_TO_ORDER' ? 0 : Math.floor(Math.random() * 10) + 1,
          bustCm: baseBust,
          waistCm: baseWaist,
          hipCm: baseHip,
          lengthCm: 110,
        }
      })
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
