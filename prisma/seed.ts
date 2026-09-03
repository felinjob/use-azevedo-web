import { PrismaClient, AvailabilityType, HighlightType } from '@prisma/client'

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
      featured: true,
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
      featured: true,
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
      featured: false,
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
      featured: true,
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
      featured: true,
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
      featured: false,
    },
    {
      name: 'Blazer Estruturado Turmalina',
      slug: 'blazer-estruturado-turmalina',
      description: 'O parceiro ideal para os dias mais frios. Corte alongado, forro acetinado e botões banhados.',
      price: 459.90,
      originalPrice: 499.90,
      availability: AvailabilityType.MADE_TO_ORDER,
      productionTimeDays: 10,
      fabricDetails: 'Alfaiataria pesada com forro de cetim. Caimento impecável.',
      images: ['https://images.unsplash.com/photo-1608248593255-fac1c4b2b2df?w=800&q=80'],
      categoryId: catBlusas.id,
      featured: false,
    },
    {
      name: 'Calça Wide Leg Jeans Escuro',
      slug: 'calca-wide-leg-jeans-escuro',
      description: 'A clássica calça pantalona em jeans, que alonga as pernas e afina a cintura. Confortável e atemporal.',
      price: 239.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: '100% Algodão (Jeans rígido e durável).',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'],
      categoryId: catCalcas.id,
      featured: false,
    },
    {
      name: 'Blusa Básica Decote Quadrado Preta',
      slug: 'blusa-basica-decote-quadrado-preta',
      description: 'Aquela peça coringa que vai com tudo. Decote quadrado valoriza o busto, malha dupla para não marcar.',
      price: 89.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Poliamida com Elastano. Alta compressão, toque gelado.',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      categoryId: catBlusas.id,
      featured: false,
    },
    {
      name: 'Blusa Básica Decote Quadrado Branca',
      slug: 'blusa-basica-decote-quadrado-branca',
      description: 'A versão off-white da nossa blusa básica mais amada. Malha dupla garante zero transparência.',
      price: 89.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Poliamida com Elastano. Alta compressão, toque gelado.',
      images: ['https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80'],
      categoryId: catBlusas.id,
      featured: false,
    },
    {
      name: 'Vestido Longo Plissado Rose',
      slug: 'vestido-longo-plissado-rose',
      description: 'Um sonho em forma de vestido. Saia fluída e plissada que acompanha seus movimentos. Excelente para casamentos e formaturas.',
      price: 599.90,
      originalPrice: null,
      availability: AvailabilityType.MADE_TO_ORDER,
      productionTimeDays: 15,
      fabricDetails: 'Musseline plissada, forro em crepe de malha.',
      images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80'],
      categoryId: catVestidos.id,
      featured: true,
    },
    {
      name: 'Saia Lápis Courino Marsala',
      slug: 'saia-lapis-courino-marsala',
      description: 'Sensual e empoderada, com fenda traseira estratégica. O courino macio permite liberdade total de movimentos.',
      price: 189.90,
      originalPrice: 229.90,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'PU Premium (couro sintético ecológico) com forro flanelado.',
      images: ['https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80'],
      categoryId: catCalcas.id,
      featured: false,
    },
    {
      name: 'Macacão Pantacourt Mostarda',
      slug: 'macacao-pantacourt-mostarda',
      description: 'Peça única com amarração que simula um cropped e calça. A praticidade de um macacão com o estilo de um conjunto.',
      price: 319.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Crepe Dior fluido, toque texturizado e fosco.',
      images: ['https://images.unsplash.com/photo-1495385794356-15371f348c31?w=800&q=80'],
      categoryId: catVestidos.id,
      featured: false,
    },
    {
      name: 'Regata Seda Cetim Ouro',
      slug: 'regata-seda-cetim-ouro',
      description: 'Para as noites cariocas, uma regata de alça fina e brilhante que ilumina o rosto.',
      price: 119.90,
      originalPrice: null,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Cetim Toque de Seda (100% poliéster brilhante).',
      images: ['https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&q=80'],
      categoryId: catBlusas.id,
      featured: false,
    },
    {
      name: 'Cardigan Alongado Tricô Modal',
      slug: 'cardigan-alongado-trico-modal',
      description: 'Perfeito para jogar por cima de qualquer look. Tricô modal super macio e aconchegante.',
      price: 249.90,
      originalPrice: null,
      availability: AvailabilityType.MADE_TO_ORDER,
      productionTimeDays: 5,
      fabricDetails: 'Fio Modal Premium, elasticidade máxima e zero pilling (não dá bolinhas).',
      images: ['https://images.unsplash.com/photo-1617013894235-9d32d3d0f04c?w=800&q=80'],
      categoryId: catBlusas.id,
      featured: false,
    },
    {
      name: 'Short Alfaiataria Nude',
      slug: 'short-alfaiataria-nude',
      description: 'Para o verão, com pences frontais e corte solto na perna. Elegância sem passar calor.',
      price: 159.90,
      originalPrice: 179.90,
      availability: AvailabilityType.READY_TO_SHIP,
      productionTimeDays: 0,
      fabricDetails: 'Crepe encorpado, sem transparência.',
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80'],
      categoryId: catCalcas.id,
      featured: false,
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
        featured: prodData.featured,
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

  // Banners & Stories (Personalização)
  console.log('Seeding Banners & Stories...')
  const initialHighlights = [
    // Hero Slides
    {
      title: 'Nova Coleção Essência',
      subtitle: 'Moda autoral do 44 ao 56, feita para abraçar as suas curvas com caimento impecável.',
      imageUrl: 'https://images.unsplash.com/photo-1515347619362-675276537eb0?auto=format&fit=crop&q=80',
      linkUrl: '/?filtro=novidades',
      type: HighlightType.HERO_SLIDE,
      order: 0,
      active: true,
    },
    {
      title: 'Vestidos & Alfaiataria',
      subtitle: 'Elegância atemporal e tecidos nobres pensados para valorizar cada detalhe.',
      imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80',
      linkUrl: '/?categoria=vestidos-e-conjuntos',
      type: HighlightType.HERO_SLIDE,
      order: 1,
      active: true,
    },
    // Story Circles
    {
      title: 'Novidades',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1550614000-4b95d4e16dce?w=200&q=80',
      linkUrl: '/?filtro=novidades',
      type: HighlightType.STORY_CIRCLE,
      order: 0,
      active: true,
    },
    {
      title: 'Vestidos',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&q=80',
      linkUrl: '/?categoria=vestidos-e-conjuntos',
      type: HighlightType.STORY_CIRCLE,
      order: 1,
      active: true,
    },
    {
      title: 'Conjuntos',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1594938298596-eb5fd3f6b4f6?w=200&q=80',
      linkUrl: '/?busca=conjunto',
      type: HighlightType.STORY_CIRCLE,
      order: 2,
      active: true,
    },
    {
      title: 'Blusas',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&q=80',
      linkUrl: '/?busca=blusa',
      type: HighlightType.STORY_CIRCLE,
      order: 3,
      active: true,
    },
    {
      title: 'Pronta Entrega',
      subtitle: null,
      imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=200&q=80',
      linkUrl: '/?disponibilidade=READY_TO_SHIP',
      type: HighlightType.STORY_CIRCLE,
      order: 4,
      active: true,
    },
  ]

  for (const item of initialHighlights) {
    const existing = await prisma.bannerHighlight.findFirst({
      where: {
        title: item.title,
        type: item.type,
      }
    })

    if (!existing) {
      await prisma.bannerHighlight.create({
        data: item
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
