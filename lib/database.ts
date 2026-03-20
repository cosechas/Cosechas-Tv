import { supabase } from "./supabase"
import type { Ciudad, Tienda, ActividadReciente, Estadisticas } from "./supabase"

// Función para generar un PIN único de 4 dígitos
async function generarPinUnico(): Promise<string> {
  let pin: string
  let intentos = 0
  const maxIntentos = 100

  do {
    // Generar un PIN de 4 dígitos
    pin = Math.floor(1000 + Math.random() * 9000).toString()
    intentos++

    // Verificar que no exista en la base de datos
    const { data, error } = await supabase
      .from("tiendas")
      .select("codigo")
      .eq("codigo", pin)
      .single()

    if (error && error.code === 'PGRST116') {
      // PGRST116 significa "no se encontraron filas", es decir, el PIN es único
      return pin
    }

    if (intentos >= maxIntentos) {
      throw new Error("No se pudo generar un PIN único después de múltiples intentos")
    }
  } while (true)
}

// Función para verificar conexión - versión simplificada
export async function verificarConexion(): Promise<boolean> {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Variables de entorno de Supabase no configuradas")
      return false
    }


    const { data, error } = await supabase.from("ciudades").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Error en consulta Supabase:", error)
      return false
    }

    console.log("Conexión Supabase exitosa")
    return true
  } catch (error) {
    console.error("Error de conexión:", error)
    return false
  }
}

// Funciones para ciudades con mejor manejo de errores
export async function getCiudades(): Promise<Ciudad[]> {
  try {
    // Quitamos el filtro de activa para ver todas las ciudades
    const { data, error } = await supabase.from("ciudades").select("*").order("nombre")

    if (error) {
      console.error("Error al obtener ciudades:", error)
      throw new Error(`Error al cargar ciudades: ${error.message}`)
    }

    return data || []
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

// Funciones para tiendas con mejor manejo de errores
export async function getTiendas(): Promise<Tienda[]> {
  try {

    const { data: tiendasData, error: tiendasError } = await supabase.from("tiendas").select("*").order("nombre")

    if (tiendasError) {
      console.error("Error al obtener tiendas:", tiendasError)
      throw new Error(`Error al cargar tiendas: ${tiendasError.message}`)
    }

  
    if (tiendasData && tiendasData.length > 0) {
      const ciudadesIds = tiendasData.map((tienda) => tienda.ciudad_id).filter(Boolean)

      if (ciudadesIds.length > 0) {
        const { data: ciudadesData, error: ciudadesError } = await supabase
          .from("ciudades")
          .select("*")
          .in("id", ciudadesIds)

        if (ciudadesError) {
          console.error("Error al obtener ciudades:", ciudadesError)
        } else if (ciudadesData) {
          return tiendasData.map((tienda) => ({
            ...tienda,
            ciudades: ciudadesData.find((ciudad) => ciudad.id === tienda.ciudad_id),
          }))
        }
      }
    }

    return tiendasData || []
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

export async function getTiendasPorCiudad(ciudadId: string): Promise<Tienda[]> {
  try {
    // Consultas separadas en lugar de un join implícito
    const { data: tiendasData, error: tiendasError } = await supabase
      .from("tiendas")
      .select("*")
      .eq("ciudad_id", ciudadId)
      .eq("activa", true)
      .order("nombre")

    if (tiendasError) {
      console.error("Error al obtener tiendas por ciudad:", tiendasError)
      throw new Error(`Error al cargar tiendas por ciudad: ${tiendasError.message}`)
    }

    // Si tenemos tiendas, obtenemos la ciudad correspondiente
    if (tiendasData && tiendasData.length > 0) {
      const { data: ciudadData, error: ciudadError } = await supabase
        .from("ciudades")
        .select("*")
        .eq("id", ciudadId)
        .single()

      if (ciudadError) {
        console.error("Error al obtener ciudad:", ciudadError)
      } else if (ciudadData) {
        // Mapeamos la ciudad a las tiendas
        return tiendasData.map((tienda) => ({
          ...tienda,
          ciudades: ciudadData,
        }))
      }
    }

    return tiendasData || []
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

export async function crearTienda(tienda: Omit<Tienda, "id" | "created_at" | "updated_at">): Promise<Tienda> {
  try {
    // Generar automáticamente un PIN único de 4 dígitos
    const codigoUnico = await generarPinUnico()
    
    // Crear la tienda con el código generado automáticamente
    const tiendaConCodigo = {
      ...tienda,
      codigo: codigoUnico
    }
    
    // Insertamos la tienda
    const { data: tiendaData, error: tiendaError } = await supabase.from("tiendas").insert([tiendaConCodigo]).select().single()

    if (tiendaError) {
      console.error("Error al crear tienda:", tiendaError)
      throw new Error(`Error al crear tienda: ${tiendaError.message}`)
    }

    // Obtenemos la ciudad correspondiente
    if (tiendaData && tiendaData.ciudad_id) {
      const { data: ciudadData, error: ciudadError } = await supabase
        .from("ciudades")
        .select("*")
        .eq("id", tiendaData.ciudad_id)
        .single()

      if (ciudadError) {
        console.error("Error al obtener ciudad:", ciudadError)
      } else if (ciudadData) {
        // Añadimos la ciudad a la tienda
        return {
          ...tiendaData,
          ciudades: ciudadData,
        }
      }
    }

    return tiendaData
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

export async function eliminarTienda(tiendaId: string): Promise<void> {
  try {
    const { error } = await supabase.from("tiendas").delete().eq("id", tiendaId)

    if (error) {
      console.error("Error al eliminar tienda:", error)
      throw new Error(`Error al eliminar tienda: ${error.message}`)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

export async function actualizarTienda(
  tiendaId: string,
  datos: Partial<Omit<Tienda, "id" | "created_at" | "updated_at">>,
): Promise<Tienda> {
  try {
    // Actualizamos la tienda
    const { data: tiendaData, error: tiendaError } = await supabase
      .from("tiendas")
      .update({ ...datos, updated_at: new Date().toISOString() })
      .eq("id", tiendaId)
      .select()
      .single()

    if (tiendaError) {
      console.error("Error al actualizar tienda:", tiendaError)
      throw new Error(`Error al actualizar tienda: ${tiendaError.message}`)
    }

    // Obtenemos la ciudad correspondiente
    if (tiendaData && tiendaData.ciudad_id) {
      const { data: ciudadData, error: ciudadError } = await supabase
        .from("ciudades")
        .select("*")
        .eq("id", tiendaData.ciudad_id)
        .single()

      if (ciudadError) {
        console.error("Error al obtener ciudad:", ciudadError)
      } else if (ciudadData) {
        // Añadimos la ciudad a la tienda
        return {
          ...tiendaData,
          ciudades: ciudadData,
        }
      }
    }

    return tiendaData
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se puede conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.",
      )
    }
    throw error
  }
}

export async function registrarActividad(actividad: Omit<ActividadReciente, "id" | "created_at">): Promise<void> {
  try {
    const { error } = await supabase.from("actividad_reciente").insert([actividad])

    if (error) {
      console.error("Error al registrar actividad:", error)
    }
  } catch (error) {
    console.error("Error al registrar actividad:", error)
  }
}

// Funciones para estadísticas
export async function getEstadisticas(): Promise<Estadisticas> {
  try {

    const { count: videosActivos } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("estado", "activo")


    const { count: videosProgramados } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("estado", "programado")

    const { data: pantallasData } = await supabase.from("tiendas").select("pantallas_conectadas").eq("activa", true)

    const pantallasConectadas = pantallasData?.reduce((sum, tienda) => sum + tienda.pantallas_conectadas, 0) || 0

    const hoy = new Date().toISOString().split("T")[0]
    const { count: reproduccionesHoy } = await supabase
      .from("reproducciones")
      .select("*", { count: "exact", head: true })
      .gte("fecha_reproduccion", `${hoy}T00:00:00.000Z`)
      .lt("fecha_reproduccion", `${hoy}T23:59:59.999Z`)

    const { count: totalTiendas } = await supabase
      .from("tiendas")
      .select("*", { count: "exact", head: true })
      .eq("activa", true)
    const { count: totalCiudades } = await supabase
      .from("ciudades")
      .select("*", { count: "exact", head: true })
      .eq("activa", true)

    return {
      videos_activos: videosActivos || 0,
      pantallas_conectadas: pantallasConectadas,
      reproducciones_hoy: reproduccionesHoy || 0,
      videos_programados: videosProgramados || 0,
      total_tiendas: totalTiendas || 0,
      total_ciudades: totalCiudades || 0,
    }
  } catch (error) {
    console.error("Error en getEstadisticas:", error)
    return {
      videos_activos: 0,
      pantallas_conectadas: 0,
      reproducciones_hoy: 0,
      videos_programados: 0,
      total_tiendas: 0,
      total_ciudades: 0,
    }
  }
}

export async function getEstadisticasPorCiudad() {
  try {
    // 1. Conseguir ciudades activas
    const { data: ciudades, error: ciudadesError } = await supabase
      .from("ciudades")
      .select("id, nombre, codigo")
      .eq("activa", true)

    if (ciudadesError) throw ciudadesError

    // 2. Conseguir todas las tiendas activas
    const { data: tiendas, error: tiendasError } = await supabase
      .from("tiendas")
      .select("id, ciudad_id, pantallas_conectadas")
      .eq("activa", true)

    if (tiendasError) throw tiendasError

    // 3. Mapear y sumar
    return (ciudades || []).map((ciudad) => {
      const tiendasCiudad = (tiendas || []).filter((t) => t.ciudad_id === ciudad.id)
      return {
        ...ciudad,
        total_tiendas: tiendasCiudad.length,
        total_pantallas: tiendasCiudad.reduce((sum, tienda) => sum + (tienda.pantallas_conectadas || 0), 0),
      }
    })
  } catch (error) {
    console.error("Error en getEstadisticasPorCiudad:", error)
    return []
  }
}

export async function getActividadReciente(limite = 10): Promise<ActividadReciente[]> {
  try {
    const { data, error } = await supabase
      .from("actividad_reciente")
      .select(`
        *,
        videos (
          id,
          titulo
        ),
        tiendas (
          id,
          nombre
        ),
        ciudades (
          id,
          nombre
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limite)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error en getActividadReciente:", error)
    return []
  }
}
