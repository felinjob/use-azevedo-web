import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = new Set(['products', 'banners'])
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB (mesmo limite do bucket "banners")

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    // Somente administradores autenticados podem enviar arquivos.
    // Esta rota usa a service role key (que ignora RLS), então não pode ficar aberta.
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const bucket = (formData.get('bucket') as string) || 'products'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Destino de upload inválido.' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Formato não suportado. Use JPG, PNG ou WEBP.' }, { status: 415 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Imagem muito grande (máx. 5 MB).' }, { status: 413 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do Supabase ausente.' }, { status: 500 })
    }

    // Usar o service role key para burlar o RLS e permitir upload
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const fileExt = EXT_BY_MIME[file.type]
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '31536000', // nomes são únicos, então o cache pode ser longo
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Erro ao fazer upload para o Supabase.' }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error: unknown) {
    console.error('Upload API route error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
