import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { supabase } from "@/lib/supabase"
import { getCiudades } from "@/lib/database"
import { createClient } from '@supabase/supabase-js'

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    let user_id = null
    if (token) {
      // Crear un cliente temporal de Supabase para decodificar el token
      const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      })
      const { data: { user } } = await supa.auth.getUser(token)
      user_id = user?.id || null
    }
    const formData = await request.formData()
    // Cambios para múltiples archivos
    const files = formData.getAll("files") as File[]
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const groupType = formData.get("groupType") as string // 'ciudad' o 'tienda'
    const groupId = formData.get("groupId") as string // ID de la ciudad o tienda
    const description = formData.get("description") as string

    if (!files.length) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Obtener el nombre real de la zona/ciudad
    let nombreZona = groupId;
    try {
      const ciudades = await getCiudades();
      const ciudad = ciudades.find((c) => c.id === groupId);
      if (ciudad) {
        nombreZona = ciudad.nombre.replace(/\//g, "-"); // Evitar problemas con / en nombres
      }
    } catch (e) {
      // Si falla, usa el id
    }

    // Procesar todos los archivos
    const stream = require("stream")
    const results = await Promise.all(files.map(async (file, idx) => {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const readableStream = new stream.PassThrough()
        readableStream.end(buffer)
        // Subir a Cloudinary usando streams
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: file.type.startsWith("video/") ? "video" : "image",
              folder: `retail-cosechas/Zonas/${nombreZona}`,
              public_id: `${Date.now()}-${title.replace(/\s+/g, "-").toLowerCase()}-${idx}`,
              tags: [category, groupType, groupId],
            },
            (error, result) => {
              if (error) return reject(error)
              resolve(result)
            }
          )
          readableStream.pipe(uploadStream)
        })
        // Guardar en la base de datos Supabase
        const categoriaFinal = category || 'informativo';
        const { data, error: dbError } = await supabase.from("contenidos").insert([
          {
            titulo: title,
            descripcion: description || null,
            categoria: categoriaFinal,
            estado: "activo",
            cloudinary_public_id: uploadResult.public_id,
            cloudinary_url: uploadResult.secure_url,
            formato: uploadResult.format,
            duracion: uploadResult.duration || null,
            grupo_tipo: groupType,
            grupo_id: groupId,
            user_id: user_id,
          },
        ])
        if (dbError) {
          return {
            error: "Archivo subido pero error al guardar en la base de datos",
            dbError: dbError.message,
            url: uploadResult.secure_url,
            fileName: file.name,
            success: false
          }
        }
        return {
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          resource_type: uploadResult.resource_type,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration,
          db: data,
          fileName: file.name
        }
      } catch (error) {
        return {
          error: error.message || "Error al subir archivo",
          fileName: file.name,
          success: false
        }
      }
    }))
    // Respuesta con todos los resultados
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
