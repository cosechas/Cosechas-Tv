import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || typeof pin !== 'string' || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN inválido. Debe ser un código de 4 dígitos.' },
        { status: 400 }
      )
    }

    const { data: tienda, error } = await supabase
      .from('tiendas')
      .select(`
        *,
        ciudades!fk_tiendas_ciudad (
          id,
          nombre,
          codigo
        )
      `)
      .eq('codigo', pin)
      .eq('activa', true)
      .single()

    if (error || !tienda) {
      return NextResponse.json(
        { error: 'PIN no encontrado o tienda inactiva.' },
        { status: 404 }
      )
    }

    const tiendaInfo = {
      id: tienda.id,
      nombre: tienda.nombre,
      codigo: tienda.codigo,
      ciudad_id: tienda.ciudad_id,
      zona_id: tienda.ciudad_id,
      tipo_tienda: tienda.tipo_tienda,
      ciudades: tienda.ciudades,
      pantallas_conectadas: tienda.pantallas_conectadas
    }

    return NextResponse.json({
      success: true,
      tienda: tiendaInfo
    })

  } catch (error) {
    console.error('Error al validar PIN:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
