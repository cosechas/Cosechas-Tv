"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Video, Building, MapPin, Upload, Play, Pause, Calendar, Activity } from "lucide-react"
import { getActividadReciente } from "@/lib/database"
import type { ActividadReciente } from "@/lib/supabase"

const iconosPorTipo = {
  video_subido: Upload,
  video_activado: Play,
  video_desactivado: Pause,
  video_programado: Calendar,
  tienda_agregada: Building,
  tienda_actualizada: Building,
  ciudad_agregada: MapPin,
}

const coloresPorTipo = {
  video_subido: "bg-blue-500",
  video_activado: "bg-green-500",
  video_desactivado: "bg-red-500",
  video_programado: "bg-yellow-500",
  tienda_agregada: "bg-purple-500",
  tienda_actualizada: "bg-orange-500",
  ciudad_agregada: "bg-indigo-500",
}

export function ActividadReciente() {
  const [actividades, setActividades] = useState<ActividadReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarActividad() {
      try {
        const data = await getActividadReciente(15)
        setActividades(data)
      } catch (error) {
        console.error("Error al cargar actividad reciente:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarActividad()

    // Actualizar cada minuto
    const interval = setInterval(cargarActividad, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date()
    const fechaActividad = new Date(fecha)
    const diferencia = ahora.getTime() - fechaActividad.getTime()

    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

    if (minutos < 1) return "Ahora"
    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    return `Hace ${dias}d`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                  <div className="h-3 bg-muted rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>Últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {actividades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actividades.map((actividad) => {
                const Icono = iconosPorTipo[actividad.tipo as keyof typeof iconosPorTipo] || Activity
                const color = coloresPorTipo[actividad.tipo as keyof typeof coloresPorTipo] || "bg-gray-500"

                return (
                  <div key={actividad.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${color} text-white`}>
                      <Icono className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none mb-1">{actividad.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {actividad.videos && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            {actividad.videos.titulo}
                          </Badge>
                        )}
                        {actividad.tiendas && (
                          <Badge variant="outline" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {actividad.tiendas.nombre}
                          </Badge>
                        )}
                        {actividad.ciudades && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {actividad.ciudades.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatearTiempo(actividad.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
