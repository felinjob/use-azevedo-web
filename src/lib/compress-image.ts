/**
 * Compressão de imagens no navegador antes do upload.
 *
 * Motivos:
 * - O site serve as imagens sem o otimizador da Vercel (`images.unoptimized`),
 *   então o arquivo salvo no storage precisa ser leve.
 * - Funções serverless da Vercel recusam corpos de requisição acima de ~4,5 MB;
 *   fotos tiradas no celular costumam passar disso.
 */

const MAX_DIMENSION = 1600
const QUALITY = 0.82
const SKIP_BELOW_BYTES = 300 * 1024 // arquivos pequenos não precisam de recompressão

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem.'))
    }
    img.src = url
  })
}

/**
 * Redimensiona (lado maior ≤ 1600px) e recomprime para WebP (fallback JPEG).
 * Em caso de qualquer falha, devolve o arquivo original.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  try {
    const img = await loadImage(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))

    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) return file

    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)

    const toBlob = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY))

    let blob = await toBlob('image/webp')
    let ext = 'webp'
    // Safari antigo não gera WebP pelo canvas e devolve PNG; nesse caso usamos JPEG.
    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob('image/jpeg')
      ext = 'jpg'
    }
    if (!blob || blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem'
    return new File([blob], `${baseName}.${ext}`, { type: blob.type })
  } catch {
    return file
  }
}
