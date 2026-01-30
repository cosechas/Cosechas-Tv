import { createClient } from "@supabase/supabase-js"


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("ciudades").select("count", { count: "exact", head: true })

    if (error) {
      return {
        success: false,
        message: "Error al conectar con Supabase",
        details: [error.message],
      }
    }

    return {
      success: true,
      message: "Conexión exitosa con Supabase",
      details: ["Conexión establecida correctamente"],
    }
  } catch (error) {
    return {
      success: false,
      message: "Error de conexión",
      details: [error instanceof Error ? error.message : "Error desconocido"],
    }
  }
}

export function getDiagnosticInfo() {
  return {
    environmentVariables: {
      supabaseUrl: supabaseUrl ? "✓ Configurada" : "✗ No configurada",
      supabaseAnonKey: supabaseAnonKey ? "✓ Configurada" : "✗ No configurada",
      nodeEnv: process.env.NODE_ENV || "unknown",
    },
    clientStatus: supabase ? "✓ Cliente inicializado" : "✗ Cliente no inicializado",
    validation: {
      errors: [
        ...(supabaseUrl ? [] : ["NEXT_PUBLIC_SUPABASE_URL no está configurada"]),
        ...(supabaseAnonKey ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada"]),
      ],
    },
  }
}

export interface Ciudad {
  id: string
  nombre: string
  codigo: string
  activa: boolean
  created_at: string
  updated_at: string
}

export interface Tienda {
  id: string
  nombre: string
  codigo: string
  ciudad_id: string
  direccion?: string
  telefono?: string
  email?: string
  razon_social?: string
  nit_cc?: string
  tipo_tienda: "Local" | "Burbuja"
  activa: boolean
  ultima_conexion?: string
  pantallas_conectadas: number
  created_at: string
  updated_at: string
  ciudades?: Ciudad
}

export interface Video {
  id: string
  titulo: string
  descripcion?: string
  cloudinary_public_id: string
  cloudinary_url: string
  thumbnail_url?: string
  duracion?: number
  formato?: string
  categoria?: string
  estado: "activo" | "inactivo" | "programado"
  ciudad_id?: string
  tienda_id?: string
  reproducciones: number
  created_at: string
  updated_at: string
  ciudades?: Ciudad
  tiendas?: Tienda
}

export interface ActividadReciente {
  id: string
  tipo: string
  descripcion: string
  usuario_id?: string
  video_id?: string
  tienda_id?: string
  ciudad_id?: string
  created_at: string
  videos?: Video
  tiendas?: Tienda
  ciudades?: Ciudad
}

export interface Estadisticas {
  videos_activos: number
  pantallas_conectadas: number
  reproducciones_hoy: number
  videos_programados: number
  total_tiendas: number
  total_ciudades: number
}
