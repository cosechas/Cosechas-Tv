import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
// Se requiere esta llave en el archivo .env.local para manejar usuarios desde admin
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
