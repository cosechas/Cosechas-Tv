import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tienda_id, pantalla, is_online } = body

    if (!tienda_id) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: tienda_id' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tiendas')
      .update({ 
        ultima_conexion: new Date().toISOString(),
        activa: true
      })
      .eq('id', tienda_id)

    if (error) {
      console.error('Error al actualizar heartbeat:', error)
      return NextResponse.json(
        { error: 'Error al actualizar estado' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en heartbeat:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
