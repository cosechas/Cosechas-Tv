"use client"

import { useEffect, useState } from "react"
import { Building, MapPin, Monitor, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getTiendas, getCiudades } from "@/lib/database"
import type { Tienda, Ciudad } from "@/lib/supabase"
import { AgregarTiendaDialog } from "./agregar-tienda-dialog"

export function TiendasGrid() {
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCiudad, setFiltroCiudad] = useState<string>("all")
  const [dialogAbierto, setDialogAbierto] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [tiendasData, ciudadesData] = await Promise.all([getTiendas(), getCiudades()])
        setTiendas(tiendasData)
        setCiudades(ciudadesData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const tiendasFiltradas = tiendas.filter((tienda) => {
    const coincideTexto =
      tienda.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      tienda.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
    const coincideCiudad = filtroCiudad === "all" || tienda.ciudad_id === filtroCiudad
    return coincideTexto && coincideCiudad
  })

  const handleTiendaAgregada = (nuevaTienda: Tienda) => {
    setTiendas((prev) => [...prev, nuevaTienda])
    setDialogAbierto(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="h-10 bg-muted rounded animate-pulse w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Controles y filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Buscar tiendas..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {ciudades.map((ciudad) => (
                  <SelectItem key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setDialogAbierto(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Tienda
          </Button>
        </div>

        {/* Grid de tiendas */}
        {tiendasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tiendas</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filtroTexto || filtroCiudad !== "all"
                  ? "No se encontraron tiendas con los filtros aplicados."
                  : "Aún no hay tiendas registradas. Agrega la primera tienda."}
              </p>
              <Button onClick={() => setDialogAbierto(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Primera Tienda
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiendasFiltradas.map((tienda) => (
              <Card key={tienda.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">{tienda.nombre}</CardTitle>
                        <CardDescription>Código: {tienda.codigo}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tienda.ciudades?.nombre}</span>
                  </div>

                  {tienda.direccion && <p className="text-sm text-muted-foreground">{tienda.direccion}</p>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{tienda.pantallas_conectadas} pantallas</span>
                    </div>
                    <Badge variant={tienda.activa ? "default" : "secondary"}>
                      {tienda.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  {(tienda.telefono || tienda.email) && (
                    <div className="pt-2 border-t space-y-1">
                      {tienda.telefono && <p className="text-xs text-muted-foreground">📞 {tienda.telefono}</p>}
                      {tienda.email && <p className="text-xs text-muted-foreground">✉️ {tienda.email}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resumen */}
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {tiendasFiltradas.length} de {tiendas.length} tiendas
          </p>
        </div>
      </div>

      <AgregarTiendaDialog
        abierto={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        ciudadId={null}
        onTiendaAgregada={handleTiendaAgregada}
      />
    </>
  )
}
