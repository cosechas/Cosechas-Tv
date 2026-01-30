import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    const result = await cloudinary.api.ping()

    return NextResponse.json({
      success: true,
      message: "Conexión con Cloudinary establecida correctamente",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + "...",
    })
  } catch (error: any) {
    console.error("Error al validar credenciales de Cloudinary:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error al conectar con Cloudinary",
        error: error.message || "Error desconocido",
        statusCode: error.http_code || 500,
      },
      { status: 500 },
    )
  }
}
