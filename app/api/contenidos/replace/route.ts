import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const id = formData.get("id") as string

    if (!file || !id) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const { data: currentContent, error: fetchError } = await supabase
      .from("contenidos")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !currentContent) {
      return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const grupo_id = currentContent.grupo_id || "general"
    const cleanFileName = file.name.replace(/\s+/g, "-").toLowerCase()
    const timestamp = Date.now()
    const filePath = `${grupo_id}/${timestamp}-${cleanFileName}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('contenidos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError)
      if ((uploadError as any).statusCode === '404' || uploadError.message.includes("Bucket not found")) {
        throw new Error("El bucket 'contenidos' no existe en Supabase. Por favor ve a Storage > New Bucket, llámalo 'contenidos' y márcalo como 'Public Bucket'.")
      }
      if ((uploadError as any).statusCode === '403' || uploadError.message.includes("row-level security")) {
        throw new Error("Error de permisos (RLS). Ve a Supabase > Storage > Policies, y agrega una política al bucket 'contenidos' que permita INSERT, UPDATE y DELETE para 'All' (anon/public).")
      }
      throw new Error(`Error de almacenamiento: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('contenidos')
      .getPublicUrl(filePath)
    const oldPath = currentContent.cloudinary_public_id
    if (oldPath && !oldPath.startsWith("retail-cosechas/")) {
      try {
        await supabase.storage.from('contenidos').remove([oldPath])
      } catch (e) {
        console.error("Error eliminando recurso anterior de Supabase:", e)
      }
    }

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
      await supabase.storage.from('contenidos').remove([filePath])
      throw new Error(updateError.message)
    }

    return NextResponse.json({ success: true, content: updatedContent })

  } catch (error: any) {
    console.error("Error al reemplazar contenido:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
