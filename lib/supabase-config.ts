import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: Variables de entorno de Supabase no configuradas. Asegúrate de definir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local",
  )
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")

export async function testConnection() {
  try {
    console.log("Probando conexión a Supabase...")
    console.log("URL:", supabaseUrl)
    console.log("Key:", supabaseAnonKey ? "Configurada" : "No configurada")

    const { data, error } = await supabase.from("_test_connection").select("*").limit(1)

    if (error) {
      if (error.code === "PGRST116") {
        return {
          connected: true,
          message: "Conexión exitosa a Supabase, pero la tabla de prueba no existe (lo cual es normal).",
          error: null,
        }
      }

      return {
        connected: false,
        message: "Error al conectar con Supabase",
        error: error,
      }
    }

    return {
      connected: true,
      message: "Conexión exitosa a Supabase",
      error: null,
    }
  } catch (error) {
    console.error("Error al probar la conexión:", error)
    return {
      connected: false,
      message: "Error al conectar con Supabase",
      error: error,
    }
  }
}
