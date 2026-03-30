import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { getCiudades } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]
    let user_id = null
    if (token) {
      const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      })
      const {
        data: { user },
      } = await supa.auth.getUser(token)
      user_id = user?.id || null
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const groupType = formData.get("groupType") as string // 'zona' o 'tienda'
    const groupId = formData.get("groupId") as string // ID de la ciudad o tienda
    const description = formData.get("description") as string

    if (!files.length || !groupId) {
      return NextResponse.json({ error: "No se proporcionaron archivos o falta el ID de zona" }, { status: 400 })
    }

    // Crear cliente administrativo para subir a Storage e insertar en DB bypass RLS
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Procesar todos los archivos
    const results = await Promise.all(
      files.map(async (file, idx) => {
        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const cleanFileName = file.name.replace(/\s+/g, "-").toLowerCase()
          const timestamp = Date.now()
          const filePath = `${groupId}/${timestamp}-${cleanFileName}`

          // Subir a Supabase Storage (Bucket: 'contenidos')
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from("contenidos")
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: false,
            })

          if (uploadError) {
            console.error("Error subiendo a Storage:", uploadError)
            return {
              error: `Error de almacenamiento: ${uploadError.message}`,
              fileName: file.name,
              success: false,
            }
          }

          // Obtener la URL pública
          const {
            data: { publicUrl },
          } = supabaseAdmin.storage.from("contenidos").getPublicUrl(filePath)

          // Guardar en la base de datos Supabase
          const categoriaFinal = category || "informativo"
          const { data, error: dbError } = await supabaseAdmin.from("contenidos").insert([
            {
              titulo: title,
              descripcion: description || null,
              categoria: categoriaFinal,
              estado: "activo",
              cloudinary_public_id: filePath, // Guardamos el path del storage aquí por compatibilidad
              cloudinary_url: publicUrl, // Guardamos la URL pública aquí por compatibilidad
              formato: file.type.split("/")[1] || "unknown",
              grupo_id: groupId,
              user_id: user_id,
            },
          ])

          if (dbError) {
            console.error("Error al insertar en Supabase:", dbError)
            // Limpiar el archivo subido si falla el registro en la DB
            await supabaseAdmin.storage.from("contenidos").remove([filePath])
            return {
              error: "Archivo subido a Storage pero fallo el registro en la base de datos",
              dbError: dbError.message,
              fileName: file.name,
              success: false,
            }
          }

          return {
            success: true,
            url: publicUrl,
            filePath: filePath,
            fileName: file.name,
          }
        } catch (error: any) {
          console.error("Error en el loop de subida:", error)
          return {
            error: error.message || "Error al subir archivo",
            fileName: file.name,
            success: false,
          }
        }
      }),
    )

    const someSuccessful = results.some((r) => r.success)
    const allSuccessful = results.every((r) => r.success)

    return NextResponse.json({
      success: someSuccessful,
      allSuccessful,
      results,
    })
  } catch (error: any) {
    console.error("Error general en API upload:", error)
    return NextResponse.json({ error: error.message || "Error al procesar la solicitud" }, { status: 500 })
  }
}
