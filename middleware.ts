import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Proteger todas las rutas definidas en el matcher
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
        set: () => {}, // No-op en middleware
        remove: () => {}, // No-op en middleware
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Redirigir a /auth si no hay usuario autenticado
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  // Permitir el acceso normalmente
  return NextResponse.next()
}

// Proteger múltiples rutas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/grupos/:path*',
    '/contenido/:path*',
    '/pantallas/:path*',
    '/programacion/:path*',
    '/reportes/:path*',
    '/configuracion/:path*',
    '/upload/:path*',
  ],
}