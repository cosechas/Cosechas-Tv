"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Building, Monitor, Plus, Edit, MoreVertical, Grid3X3, Table } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCiudades, getTiendasPorCiudad, getEstadisticasPorCiudad } from "@/lib/database"
import type { Ciudad, Tienda } from "@/lib/supabase"
import { AgregarTiendaDialog } from "./agregar-tienda-dialog"
import { EditarTiendaDialog } from "./editar-tienda-dialog"
import { CiudadesTabla } from "./ciudades-tabla"

const getStatusColor = (activa: boolean) => {
  return activa ? "bg-green-500" : "bg-gray-500"
}

const getStatusText = (activa: boolean) => {
  return activa ? "Activa" : "Inactiva"
}

export function CiudadesDashboard() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [estadisticasCiudades, setEstadisticasCiudades] = useState<any[]>([])
  const [tiendasPorCiudad, setTiendasPorCiudad] = useState<Record<string, Tienda[]>>({})
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState("")
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string | null>(null)
  const [ciudadExpandida, setCiudadExpandida] = useState<string | null>(null)
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false)
  const [tiendaParaEditar, setTiendaParaEditar] = useState<Tienda | null>(null)
  const [vistaActual, setVistaActual] = useState<"grid" | "table">("grid")

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [ciudadesData, estadisticasData] = await Promise.all([getCiudades(), getEstadisticasPorCiudad()])
        setCiudades(ciudadesData)
        setEstadisticasCiudades(estadisticasData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const cargarTiendasCiudad = async (ciudadId: string) => {
    if (tiendasPorCiudad[ciudadId]) {
      setCiudadExpandida(ciudadExpandida === ciudadId ? null : ciudadId)
      return
    }

    try {
      const tiendas = await getTiendasPorCiudad(ciudadId)
      setTiendasPorCiudad((prev) => ({
        ...prev,
        [ciudadId]: tiendas,
      }))
      setCiudadExpandida(ciudadId)
    } catch (error) {
      console.error("Error al cargar tiendas:", error)
    }
  }

  const handleAgregarTienda = (ciudadId: string) => {
    setCiudadSeleccionada(ciudadId)
    setDialogAbierto(true)
  }

  const handleTiendaAgregada = (nuevaTienda: Tienda) => {
    if (nuevaTienda.ciudad_id && tiendasPorCiudad[nuevaTienda.ciudad_id]) {
      setTiendasPorCiudad((prev) => ({
        ...prev,
        [nuevaTienda.ciudad_id]: [...(prev[nuevaTienda.ciudad_id] || []), nuevaTienda],
      }))
    }
    setDialogAbierto(false)
    setCiudadSeleccionada(null)
  }

  const ciudadesFiltradas = ciudades.filter((ciudad) => ciudad.nombre.toLowerCase().includes(filtroTexto.toLowerCase()))

  const getEstadisticasCiudad = (ciudadId: string) => {
    return estadisticasCiudades.find((est) => est.id === ciudadId) || { total_tiendas: 0, total_pantallas: 0 }
  }

  const handleEditarTienda = (tienda: Tienda) => {
    setTiendaParaEditar(tienda)
    setDialogEditarAbierto(true)
  }

  const handleTiendaActualizada = (tiendaActualizada: Tienda) => {
    setTiendasPorCiudad((prev) => ({
      ...prev,
      [tiendaActualizada.ciudad_id]:
        prev[tiendaActualizada.ciudad_id]?.map((t) => (t.id === tiendaActualizada.id ? tiendaActualizada : t)) || [],
    }))
    setDialogEditarAbierto(false)
    setTiendaParaEditar(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ciudades</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ciudades.length}</div>
              <p className="text-xs text-muted-foreground">Ciudades activas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tiendas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_tiendas, 0)}
              </div>
              <p className="text-xs text-muted-foreground">En todas las ciudades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pantallas</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_pantallas, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Pantallas conectadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Ciudad</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ciudades.length > 0
                  ? Math.round(
                      estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_tiendas, 0) / ciudades.length,
                    )
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Tiendas por ciudad</p>
            </CardContent>
          </Card>
        </div>

        {/* Controles y filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Buscar ciudades..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as "grid" | "table")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Tarjetas
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2">
                  <Table className="h-4 w-4" />
                  Tabla
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>


        {vistaActual === "table" ? (
          <CiudadesTabla
            ciudades={ciudadesFiltradas}
            estadisticasCiudades={estadisticasCiudades}
            onAgregarTienda={handleAgregarTienda}
          />
        ) : (
          <>
            {ciudadesFiltradas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron ciudades</h3>
                  <p className="text-muted-foreground text-center">
                    {filtroTexto ? "No hay ciudades que coincidan con tu búsqueda." : "No hay ciudades registradas."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ciudadesFiltradas.map((ciudad) => {
                  const estadisticas = getEstadisticasCiudad(ciudad.id)
                  const tiendas = tiendasPorCiudad[ciudad.id] || []
                  const expandida = ciudadExpandida === ciudad.id

                  return (
                    <Card
                      key={ciudad.id}
                      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold">{ciudad.nombre}</CardTitle>
                              <CardDescription className="text-sm font-medium">Código: {ciudad.codigo}</CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => cargarTiendasCiudad(ciudad.id)}>
                                <Building className="mr-2 h-4 w-4" />
                                {expandida ? "Ocultar tiendas" : "Ver tiendas"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAgregarTienda(ciudad.id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar tienda
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar ciudad
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Estadísticas principales */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">{estadisticas.total_tiendas}</div>
                            <p className="text-sm font-medium text-blue-700">Tiendas</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{estadisticas.total_pantallas}</div>
                            <p className="text-sm font-medium text-green-700">Pantallas</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge className={`${getStatusColor(ciudad.activa)} text-white`}>
                            {getStatusText(ciudad.activa)}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => cargarTiendasCiudad(ciudad.id)}>
                            {expandida ? "Ocultar tiendas" : "Ver tiendas"}
                          </Button>
                        </div>
                        {expandida && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">Tiendas en {ciudad.nombre}</h4>
                              <Button size="sm" variant="ghost" onClick={() => handleAgregarTienda(ciudad.id)}>
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </Button>
                            </div>

                            {tiendas.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {tiendas.map((tienda) => (
                                  <div
                                    key={tienda.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Building className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium text-sm">{tienda.nombre}</span>
                                        <p className="text-xs text-muted-foreground">{tienda.codigo}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {tienda.pantallas_conectadas} pantallas
                                      </Badge>
                                      <Button size="sm" variant="ghost" onClick={() => handleEditarTienda(tienda)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-muted/20 rounded-lg border-2 border-dashed">
                                <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-3">No hay tiendas en esta ciudad</p>
                                <Button size="sm" onClick={() => handleAgregarTienda(ciudad.id)}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Agregar primera tienda
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Creada: {new Date(ciudad.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Mostrando {ciudadesFiltradas.length} de {ciudades.length} ciudades
              </p>
            </div>
          </>
        )}
      </div>

      <AgregarTiendaDialog
        abierto={dialogAbierto}
        onClose={() => {
          setDialogAbierto(false)
          setCiudadSeleccionada(null)
        }}
        ciudadId={ciudadSeleccionada}
        onTiendaAgregada={handleTiendaAgregada}
      />
      <EditarTiendaDialog
        abierto={dialogEditarAbierto}
        onClose={() => {
          setDialogEditarAbierto(false)
          setTiendaParaEditar(null)
        }}
        tienda={tiendaParaEditar}
        onTiendaActualizada={handleTiendaActualizada}
      />
    </>
  )
}
