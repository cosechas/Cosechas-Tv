//RECURSO DE CLOUDINARY DESABILITADO
import { v2 as cloudinary } from "cloudinary"
// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Función para obtener recursos de Cloudinary
export async function getCloudinaryResources(options: {
  folder?: string
  resourceType?: string
  tags?: string[]
  maxResults?: number
}) {
  const { folder = "retail-displays", resourceType = "video", tags, maxResults = 100 } = options

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      resource_type: resourceType,
      tags: tags?.join(","),
      max_results: maxResults,
    })

    return result.resources
  } catch (error) {
    console.error("Error al obtener recursos de Cloudinary:", error)
    throw error
  }
}

// Función para obtener recursos por ciudad o tienda
export async function getResourcesByGroup(groupType: string, groupId: string) {
  return getCloudinaryResources({
    folder: `retail-displays/${groupType}/${groupId}`,
  })
}

// Función para generar URL de transformación
export function generateVideoUrl(
  publicId: string,
  options: {
    quality?: string
    width?: number
    height?: number
    crop?: string
  },
) {
  const { quality = "auto", width, height, crop = "fill" } = options

  return cloudinary.url(publicId, {
    resource_type: "video",
    quality,
    width,
    height,
    crop,
    secure: true,
  })
}

// Función para eliminar un recurso
export async function deleteResource(publicId: string, resourceType = "video") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })

    return result
  } catch (error) {
    console.error("Error al eliminar recurso de Cloudinary:", error)
    throw error
  }
}

// Función para crear un preset de carga firmado
export async function createUploadSignature() {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "retail-displays",
    },
    process.env.CLOUDINARY_API_SECRET!,
  )

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  }
}
