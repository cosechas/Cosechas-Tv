"use client"

import { useState } from "react"
import { MapPin, Edit, Trash2, MoreHorizontal, Plus, Building, Monitor } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Ciudad } from "@/lib/supabase"

const getStatusColor = (activa: boolean) => {
  return activa ? "bg-green-500" : "bg-gray-500"
}

const getStatusText = (activa: boolean) => {
  return activa ? "Activa" : "Inactiva"
}

interface CiudadesTablaProps {
  ciudades: Ciudad[]
  estadisticasCiudades: any[]
  onAgregarTienda: (ciudadId: string) => void
  onEditarCiudad?: (ciudad: Ciudad) => void
  onEliminarCiudad?: (ciudad: Ciudad) => void
}

export function CiudadesTabla({
  ciudades,
  estadisticasCiudades,
  onAgregarTienda,
  onEditarCiudad,
  onEliminarCiudad,
}: CiudadesTablaProps) {
  const [ciudadesSeleccionadas, setCiudadesSeleccionadas] = useState<string[]>([])

  const handleSeleccionarCiudad = (ciudadId: string, seleccionada: boolean) => {
    if (seleccionada) {
      setCiudadesSeleccionadas([...ciudadesSeleccionadas, ciudadId])
    } else {
      setCiudadesSeleccionadas(ciudadesSeleccionadas.filter((id) => id !== ciudadId))
    }
  }

  const handleSeleccionarTodas = (seleccionadas: boolean) => {
    if (seleccionadas) {
      setCiudadesSeleccionadas(ciudades.map((c) => c.id))
    } else {
      setCiudadesSeleccionadas([])
    }
  }

  const getEstadisticasCiudad = (ciudadId: string) => {
    return estadisticasCiudades.find((est) => est.id === ciudadId) || { total_tiendas: 0, total_pantallas: 0 }
  }

  return (
    <div className="space-y-4">
      {ciudadesSeleccionadas.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{ciudadesSeleccionadas.length} ciudad(es) seleccionada(s)</span>
          <Button variant="outline" size="sm">
            Acciones masivas
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={ciudadesSeleccionadas.length === ciudades.length && ciudades.length > 0}
                  onCheckedChange={handleSeleccionarTodas}
                />
              </TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estadísticas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ciudades.map((ciudad) => {
              const estadisticas = getEstadisticasCiudad(ciudad.id)

              return (
                <TableRow key={ciudad.id}>
                  <TableCell>
                    <Checkbox
                      checked={ciudadesSeleccionadas.includes(ciudad.id)}
                      onCheckedChange={(checked) => handleSeleccionarCiudad(ciudad.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner border border-primary/10 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px]">{ciudad.nombre}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded-md">
                            {ciudad.codigo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200/50">
                        <Building className="w-3 h-3 mr-1" />
                        {estadisticas.total_tiendas} Tiendas
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-200/50">
                        <Monitor className="w-3 h-3 mr-1" />
                        {estadisticas.total_pantallas} Pantallas
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {ciudad.activa ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1.5 border-transparent">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                          Inactiva
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(ciudad.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAgregarTienda(ciudad.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar tienda
                        </DropdownMenuItem>
                        {onEditarCiudad && (
                          <DropdownMenuItem onClick={() => onEditarCiudad(ciudad)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {onEliminarCiudad && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onEliminarCiudad(ciudad)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {ciudades.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ciudades</h3>
          <p className="text-muted-foreground">No se encontraron ciudades con los filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
