import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const grupo_id = formData.get("grupo_id") as string
    const categoria = formData.get("categoria") as string
    const titulo = formData.get("titulo") as string || file.name.replace(/\.[^/.]+$/, "")

    if (!file || !grupo_id || !categoria) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
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
    const { data: newContent, error: insertError } = await supabase
      .from("contenidos")
      .insert({
        titulo: titulo,
        grupo_id: grupo_id,
        categoria: categoria,
        cloudinary_public_id: filePath,
        cloudinary_url: publicUrl,
        formato: file.type.split('/')[1] || 'unknown',
        estado: "activo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting into Supabase:", insertError)
      await supabase.storage.from('contenidos').remove([filePath])
      throw new Error(insertError.message)
    }

    return NextResponse.json({ success: true, content: newContent })

  } catch (error: any) {
    console.error("Error al subir contenido:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
