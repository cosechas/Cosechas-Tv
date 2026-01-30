import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "Se requiere publicId" }, { status: 400 })
    }

    if (publicId.startsWith("retail-cosechas/")) {
      return NextResponse.json({ success: true, message: "Eliminación de Cloudinary omitida (Legacy)" })
    }

    const { error } = await supabase.storage
      .from('contenidos')
      .remove([publicId])

    if (error) {
      console.error("Error al eliminar de Supabase Storage:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Error en api/contenidos/delete:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
