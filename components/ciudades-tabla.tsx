"use client"

import { useState } from "react"
import { MapPin, Edit, Trash2, MoreHorizontal, Plus } from "lucide-react"
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

      <div className="rounded-md border">
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
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{ciudad.nombre}</div>
                        <div className="text-sm text-muted-foreground">Código: {ciudad.codigo}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{estadisticas.total_tiendas}</div>
                        <div className="text-xs text-muted-foreground">Tiendas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{estadisticas.total_pantallas}</div>
                        <div className="text-xs text-muted-foreground">Pantallas</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(ciudad.activa)} text-white`}>
                      {getStatusText(ciudad.activa)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{new Date(ciudad.created_at).toLocaleDateString()}</span>
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
