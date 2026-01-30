import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const response = new NextResponse()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          response.cookies.set(name, value, options)
        },
        remove: (name: string, options: any) => {
          response.cookies.delete(name)
        },
      }
    }
  )
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401, headers: response.headers })
  }
  return NextResponse.json({ user: data.user, access_token: data.session?.access_token, refresh_token: data.session?.refresh_token }, { status: 200, headers: response.headers })
} 