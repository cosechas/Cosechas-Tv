import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const id = formData.get("id") as string
    const grupo_id = formData.get("grupo_id") as string
    const oldPublicId = formData.get("oldPublicId") as string

    if (!file || !id || !grupo_id) {
      return NextResponse.json({ error: "Faltan datos requeridos para reemplazar" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const cleanFileName = file.name.replace(/\s+/g, "-").toLowerCase()
    const timestamp = Date.now()
    const filePath = `${grupo_id}/${timestamp}-${cleanFileName}`

    // Subir el nuevo archivo
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('contenidos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Error uploading new file to Storage:", uploadError)
      throw new Error(`Error de almacenamiento: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('contenidos')
      .getPublicUrl(filePath)

    // Actualizar la base de datos
    const { data: updatedContent, error: updateError } = await supabase
      .from("contenidos")
      .update({
        cloudinary_public_id: filePath,
        cloudinary_url: publicUrl,
        formato: file.type.split('/')[1] || 'unknown',
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating Supabase:", updateError)
      // Intentar limpiar el archivo si falló el update de BD
      await supabase.storage.from('contenidos').remove([filePath])
      throw new Error(updateError.message)
    }

    // Eliminar el archivo antiguo de Storage (esto es best-effort, no tiramos error general si falla)
    if (oldPublicId) {
      const { error: deleteOldError } = await supabase.storage.from('contenidos').remove([oldPublicId])
      if (deleteOldError) {
         console.error("El archivo antiguo no se pudo borrar de storage o ya no existia:", deleteOldError)
      }
    }

    return NextResponse.json({ success: true, content: updatedContent })

  } catch (error: any) {
    console.error("Error al reemplazar contenido:", error)
    return NextResponse.json({ error: error.message || "Error interno al reemplazar" }, { status: 500 })
  }
}
