import { NextResponse } from "next/server"
import { deleteResource } from "@/lib/cloudinary"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const publicId = decodeURIComponent(params.id)

    const result = await deleteResource(publicId)

    if (result.result === "ok") {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "No se pudo eliminar el video" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al eliminar video:", error)
    return NextResponse.json({ error: "Error al eliminar video" }, { status: 500 })
  }
}
