import { NextResponse } from "next/server"
import { getCloudinaryResources, getResourcesByGroup } from "@/lib/cloudinary"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupType = searchParams.get("groupType")
    const groupId = searchParams.get("groupId")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    let resources

    if (groupType && groupId) {
      resources = await getResourcesByGroup(groupType, groupId)
    } else {
      const tags = []
      if (category) tags.push(category)
      if (status) tags.push(status)

      resources = await getCloudinaryResources({
        tags: tags.length > 0 ? tags : undefined,
      })
    }

    const videos = resources.map((resource: any) => ({
      id: resource.public_id,
      title: resource.public_id.split("/").pop().replace(/-/g, " "),
      url: resource.secure_url,
      thumbnail: resource.secure_url.replace("/video/upload/", "/video/upload/w_300,h_200,c_fill,q_auto,f_jpg/"),
      format: resource.format,
      width: resource.width,
      height: resource.height,
      duration: resource.duration,
      created_at: resource.created_at,
      tags: resource.tags || [],
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error al obtener videos:", error)
    return NextResponse.json({ error: "Error al obtener videos" }, { status: 500 })
  }
}
