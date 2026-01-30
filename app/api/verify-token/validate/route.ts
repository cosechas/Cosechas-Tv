import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json()
    if (!email || !token) {
      return NextResponse.json({ success: false, error: 'Email y token requeridos.' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('tokens_verificacion')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .single()
    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Token incorrecto o no solicitado.' }, { status: 400 })
    }
    if (new Date() > new Date(data.expires_at)) {
      await supabase.from('tokens_verificacion').delete().eq('id', data.id)
      return NextResponse.json({ success: false, error: 'El token ha expirado.' }, { status: 400 })
    }
    await supabase.from('tokens_verificacion').delete().eq('id', data.id)
    return NextResponse.json({ success: true, message: 'Token válido.' })
  } catch (error) {
    console.error('Error validando token:', error)
    return NextResponse.json({ success: false, error: 'Error al validar el token.' }, { status: 500 })
  }
} 