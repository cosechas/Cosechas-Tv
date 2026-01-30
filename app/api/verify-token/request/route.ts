import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const TOKEN_EXP_MIN = 10 // minutos
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requerido.' }, { status: 400 })
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expires_at = new Date(Date.now() + TOKEN_EXP_MIN * 60 * 1000).toISOString()

    await supabase.from('tokens_verificacion').delete().eq('email', email)

    const { error: insertError } = await supabase.from('tokens_verificacion').insert([
      { email, token, expires_at }
    ])
    if (insertError) {
      return NextResponse.json({ success: false, error: 'Error guardando el token.' }, { status: 500 })
    }

    await resend.emails.send({
      from: 'noreply@cosechasexpress.com',
      to: email,
      subject: 'Tu código de verificación',
      html: `<p>Tu código de verificación es: <b>${token}</b></p><p>Válido por ${TOKEN_EXP_MIN} minutos.</p>`
    })

    return NextResponse.json({ success: true, message: 'Token enviado al correo.' })
  } catch (error) {
    console.error('Error enviando token:', error)
    return NextResponse.json({ success: false, error: 'No se pudo enviar el token.' }, { status: 500 })
  }
} 