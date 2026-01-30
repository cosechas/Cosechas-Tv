import { NextResponse } from "next/server"
import { getCiudades } from "@/lib/database"

export async function GET() {
  try {
    const ciudades = await getCiudades()
    
    const zonas = ciudades.map(ciudad => ({
      id: ciudad.id,
      nombre: ciudad.nombre,
    }))

    return NextResponse.json({ zonas })
  } catch (error) {
    console.error("Error al obtener zonas:", error)
    return NextResponse.json({ error: "Error al obtener zonas" }, { status: 500 })
  }
} 