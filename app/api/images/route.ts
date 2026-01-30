import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zona = searchParams.get('zona')

    let query = supabase.from('contenidos').select('*').eq('estado', 'activo')

    if (zona) {
      query = query.eq('grupo_id', zona)
    }

    const { data: imagenes, error } = await query

    if (error) {
      console.error('Error al obtener imágenes:', error)
      return NextResponse.json(
        { error: 'Error al cargar imágenes' },
        { status: 500 }
      )
    }

    const imagenesFormateadas = imagenes?.map(img => ({
      id: img.id,
      url: img.cloudinary_url,
      categoria: img.categoria || 'general',
      duracion: img.duracion || 5,
      titulo: img.titulo || 'Imagen'
    })) || []

    return NextResponse.json({
      imagenes: imagenesFormateadas
    })

  } catch (error) {
    console.error('Error en endpoint de imágenes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}