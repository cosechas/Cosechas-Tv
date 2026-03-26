"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Building, Monitor, Plus, Edit, MoreVertical, Grid3X3, Table } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCiudades, getTiendasPorCiudad, getEstadisticasPorCiudad } from "@/lib/database"
import type { Ciudad, Tienda } from "@/lib/supabase"
import { AgregarTiendaDialog } from "./agregar-tienda-dialog"
import { EditarTiendaDialog } from "./editar-tienda-dialog"
import { AgregarCiudadDialog } from "./agregar-ciudad-dialog"
import { EditarCiudadDialog } from "./editar-ciudad-dialog"
import { CiudadesTabla } from "./ciudades-tabla"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  const [dialogCiudadAbierto, setDialogCiudadAbierto] = useState(false)
  const [tiendaParaEditar, setTiendaParaEditar] = useState<Tienda | null>(null)
  const [ciudadParaEditar, setCiudadParaEditar] = useState<Ciudad | null>(null)
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

  const handleCiudadAgregada = (nuevaCiudad: Ciudad) => {
    setCiudades((prev) => [...prev, nuevaCiudad].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    setDialogCiudadAbierto(false)
  }

  const handleCiudadActualizada = (ciudadActualizada: Ciudad) => {
    setCiudades((prev) =>
      prev.map((c) => (c.id === ciudadActualizada.id ? ciudadActualizada : c)).sort((a, b) => a.nombre.localeCompare(b.nombre))
    )
    setCiudadParaEditar(null)
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
        <div className="grid gap-5 md:grid-cols-4">
          <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/80">Total Ciudades</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{ciudades.length}</div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Sedes activas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/80">Total Tiendas</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">
                {estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_tiendas, 0)}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Registradas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/80">Pantallas</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Monitor className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">
                {estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_pantallas, 0)}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Conectadas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/80">Promedio</CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Grid3X3 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">
                {ciudades.length > 0
                  ? Math.round(
                      estadisticasCiudades.reduce((sum, ciudad) => sum + ciudad.total_tiendas, 0) / ciudades.length,
                    )
                  : 0}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Tiendas / Ciudad</p>
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
          <div className="flex items-center gap-2 flex-col sm:flex-row w-full md:w-auto mt-2 md:mt-0">
            <Button onClick={() => setDialogCiudadAbierto(true)} className="w-full sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Ciudad
            </Button>
            <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as "grid" | "table")} className="w-full sm:w-auto">
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
                      className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${expandida ? 'border-primary/50 shadow-md ring-1 ring-primary/20 z-20' : 'border-border/50 hover:border-primary/30 z-10'} bg-card`}
                    >
                      {/* Watermark decortiva */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                        <MapPin className="absolute -right-6 -top-6 h-32 w-32 text-primary/[0.03] rotate-12 transition-transform group-hover:scale-110 duration-500" />
                      </div>
                      
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between relative z-10">
                          <div className="space-y-1.5 pr-6">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-bold tracking-tight">{ciudad.nombre}</CardTitle>
                              {ciudad.activa && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border-transparent">
                                {ciudad.codigo}
                              </Badge>
                              {!ciudad.activa && (
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground border-dashed">
                                  Inactiva
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 bg-background/50 backdrop-blur-sm hover:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg">
                              <DropdownMenuItem onClick={() => cargarTiendasCiudad(ciudad.id)} className="cursor-pointer py-2">
                                <Building className="mr-2 h-4 w-4 text-primary/70" />
                                <span className="font-medium">{expandida ? "Ocultar detalles" : "Ver tiendas y stats"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAgregarTienda(ciudad.id)} className="cursor-pointer py-2">
                                <Plus className="mr-2 h-4 w-4 text-primary/70" />
                                <span className="font-medium">Agregar tienda</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCiudadParaEditar(ciudad)} className="cursor-pointer py-2">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar ciudad</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        {/* Stats en línea elegantes */}
                        <div className="px-5 pb-4 relative z-10">
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <div className="flex items-center gap-2 text-foreground/80 bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10 dark:border-blue-500/20">
                              <Building className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold">{estadisticas.total_tiendas}</span>
                              <span className="text-[11px] text-muted-foreground uppercase hidden sm:inline">Tiendas</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground/80 bg-purple-500/5 px-2.5 py-1.5 rounded-lg border border-purple-500/10 dark:border-purple-500/20">
                              <Monitor className="h-4 w-4 text-purple-500" />
                              <span className="font-semibold">{estadisticas.total_pantallas}</span>
                              <span className="text-[11px] text-muted-foreground uppercase hidden sm:inline">Pantallas</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón sutil de expandir */}
                        <div className="relative">
                          <button 
                            onClick={() => cargarTiendasCiudad(ciudad.id)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors border-t border-border/40 rounded-b-2xl ${expandida ? 'bg-primary/5 text-primary z-20 relative' : 'bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground z-20 relative'}`}
                          >
                            {expandida ? 'Ocultar sucursales' : 'Ver sucursales'}
                            <span className={`transition-transform duration-300 ${expandida ? 'rotate-180' : ''}`}>▼</span>
                          </button>

                          {/* Sección expandida Flotante usando ScrollArea */}
                          {expandida && (
                            <div className="absolute top-[calc(100%+6px)] left-0 w-full z-50 bg-card border border-border shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                              {tiendas.length > 0 ? (
                                <ScrollArea className="h-[280px] w-full bg-muted/5">
                                  <div className="p-3 space-y-2">
                                {tiendas.map((tienda) => (
                                  <div
                                    key={tienda.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group/item"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Building className="h-4 w-4 text-blue-500" />
                                      </div>
                                      <div className="flex flex-col">
                                        <TooltipProvider delayDuration={300}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="font-semibold text-sm max-w-[130px] truncate leading-tight dark:text-foreground/90 cursor-default">{tienda.nombre}</span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[240px] text-xs font-medium">
                                              {tienda.nombre}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{tienda.codigo}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[22px] bg-accent/30 font-medium">
                                        {tienda.pantallas_conectadas} pant.
                                      </Badge>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-blue-500/10 hover:text-blue-600 transition-all" onClick={() => handleEditarTienda(tienda)}>
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button variant="ghost" className="w-[calc(100%-16px)] mx-auto mt-2 mb-1 flex text-xs border-dashed border border-border/60 rounded-xl h-9 hover:bg-blue-500/5 hover:text-blue-600 hover:border-blue-500/30 transition-colors" onClick={() => handleAgregarTienda(ciudad.id)}>
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  Añadir sucursal
                                </Button>
                                  </div>
                                </ScrollArea>
                            ) : (
                              <div className="text-center py-8 px-4 bg-muted/5">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                  <Building className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">Sin sucursales</p>
                                <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">No hay tiendas registradas para esta ciudad en el sistema.</p>
                                <Button size="sm" variant="secondary" className="rounded-full shadow-sm text-xs h-8 px-4" onClick={() => handleAgregarTienda(ciudad.id)}>
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  Crear primera tienda
                                </Button>
                              </div>
                            )}
                            </div>
                          )}
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
      <AgregarCiudadDialog 
        abierto={dialogCiudadAbierto}
        onClose={() => setDialogCiudadAbierto(false)}
        onCiudadAgregada={handleCiudadAgregada}
      />
      <EditarCiudadDialog
        ciudad={ciudadParaEditar}
        onClose={() => setCiudadParaEditar(null)}
        onCiudadActualizada={handleCiudadActualizada}
      />
    </>
  )
}
