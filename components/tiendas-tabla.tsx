"use client"

import { useState } from "react"
import { Building, MapPin, Monitor, Edit, Trash2, Phone, Mail, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu" 
import { eliminarTienda, registrarActividad } from "@/lib/database"
import type { Tienda } from "@/lib/supabase"
import { EditarTiendaDialog } from "./editar-tienda-dialog"
import * as XLSX from "xlsx";

// Funciones para colores de estado (igual que en resumen general)
const getStatusColor = (activa: boolean) => {
  return activa ? "bg-green-500" : "bg-gray-500"
}

const getStatusText = (activa: boolean) => {
  return activa ? "Activa" : "Inactiva"
}

interface TiendasTablaProps {
  tiendas: Tienda[]
  onTiendaActualizada: (tienda: Tienda) => void
  onTiendaEliminada: (tiendaId: string) => void
}

export function TiendasTabla({ tiendas, onTiendaActualizada, onTiendaEliminada }: TiendasTablaProps) {
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<Tienda | null>(null)
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false)
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<string[]>([])
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)
  const [eliminandoIndividual, setEliminandoIndividual] = useState<string | null>(null)

  const handleEditarTienda = (tienda: Tienda) => {
    setTiendaSeleccionada(tienda)
    setDialogEditarAbierto(true)
  }

  const handleEliminarTienda = async (tienda: Tienda) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la tienda "${tienda.nombre}"?`)) {
      return
    }

    setEliminandoIndividual(tienda.id)

    try {
      await eliminarTienda(tienda.id)

      await registrarActividad({
        tipo: "tienda_eliminada",
        descripcion: `Tienda eliminada: ${tienda.nombre}`,
        tienda_id: tienda.id,
        ciudad_id: tienda.ciudad_id,
      })

      onTiendaEliminada(tienda.id)


    } catch (error) {
      console.error("Error al eliminar tienda:", error)

      let errorMessage = "No se pudo eliminar la tienda."
      if (error instanceof Error) {
        errorMessage = error.message
      }

    } finally {
      setEliminandoIndividual(null)
    }
  }

  const handleSeleccionarTienda = (tiendaId: string, seleccionada: boolean) => {
    if (seleccionada) {
      setTiendasSeleccionadas([...tiendasSeleccionadas, tiendaId])
    } else {
      setTiendasSeleccionadas(tiendasSeleccionadas.filter((id) => id !== tiendaId))
    }
  }

  const handleSeleccionarTodas = (seleccionadas: boolean) => {
    if (seleccionadas) {
      setTiendasSeleccionadas(tiendas.map((t) => t.id))
    } else {
      setTiendasSeleccionadas([])
    }
  }

  const handleEliminarSeleccionadas = async () => {
    if (tiendasSeleccionadas.length === 0) return

    if (!confirm(`¿Estás seguro de que deseas eliminar ${tiendasSeleccionadas.length} tienda(s)?`)) {
      return
    }

    setEliminandoMasivo(true)

    try {
      const errores: string[] = []
      const eliminadas: string[] = []

      for (const tiendaId of tiendasSeleccionadas) {
        try {
          const tienda = tiendas.find((t) => t.id === tiendaId)
          if (tienda) {
            await eliminarTienda(tiendaId)

            await registrarActividad({
              tipo: "tienda_eliminada",
              descripcion: `Tienda eliminada: ${tienda.nombre}`,
              tienda_id: tiendaId,
              ciudad_id: tienda.ciudad_id,
            })

            onTiendaEliminada(tiendaId)
            eliminadas.push(tienda.nombre)
          }
        } catch (error) {
          console.error(`Error al eliminar tienda ${tiendaId}:`, error)
          const tienda = tiendas.find((t) => t.id === tiendaId)
          errores.push(tienda?.nombre || tiendaId)
        }
      }

      setTiendasSeleccionadas([])


    } catch (error) {
      console.error("Error general al eliminar tiendas:", error)

    } finally {
      setEliminandoMasivo(false)
    }
  }

  const exportarExcel = () => {
    // Prepara los datos para exportar
    const data = tiendas.map((t) => ({
      Nombre: t.nombre,
      Código: t.codigo,
      Tipo: t.tipo_tienda,
      "Razón social": t.razon_social || "",
      "NIT/C.C": t.nit_cc || "",
      Ciudad: t.ciudades?.nombre || "",
      Teléfono: t.telefono || "",
      Correo: t.email || "",
      Pantallas: t.pantallas_conectadas,
      Estado: t.activa ? "Activa" : "Inactiva",
      "Fecha Creación": new Date(t.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tiendas");
    XLSX.writeFile(wb, "tiendas.xlsx");
  };

  return (
    <>
      <div className="space-y-4">
        {/* Acciones masivas */}
        {tiendasSeleccionadas.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{tiendasSeleccionadas.length} tienda(s) seleccionada(s)</span>
            <Button variant="destructive" size="sm" onClick={handleEliminarSeleccionadas} disabled={eliminandoMasivo}>
              <Trash2 className="h-4 w-4 mr-1" />
              {eliminandoMasivo ? "Eliminando..." : "Eliminar seleccionadas"}
            </Button>
          </div>
        )}

        {/* Tabla */}

        <div
         className="w-full space-y-2.5 overflow-auto"
        >

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <Table >
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center align-middle">
                  <Checkbox
                    checked={tiendasSeleccionadas.length === tiendas.length && tiendas.length > 0}
                    onCheckedChange={handleSeleccionarTodas}
                  />
                </TableHead>
                <TableHead className="min-w-[140px] text-left text-sm whitespace-nowrap">Nombre</TableHead>
                <TableHead className="w-[100px] text-left text-sm whitespace-nowrap">Código</TableHead>
                <TableHead className="w-[100px] text-left text-sm whitespace-nowrap">Tipo</TableHead>
                <TableHead className="min-w-[160px] max-w-[200px] text-left text-sm whitespace-nowrap">Razón social</TableHead>
                <TableHead className="w-[110px] text-left text-sm whitespace-nowrap">NIT/C.C</TableHead>
                <TableHead className="min-w-[120px] text-left text-sm whitespace-nowrap">Ciudad</TableHead>
                <TableHead className="w-[120px] text-left text-sm whitespace-nowrap">Teléfono</TableHead>
                <TableHead className="min-w-[160px] max-w-[200px] text-left text-sm whitespace-nowrap">Correo</TableHead>
                <TableHead className="w-[110px] text-center text-sm whitespace-nowrap">Pantallas</TableHead>
                <TableHead className="w-[90px] text-center text-sm whitespace-nowrap">Estado</TableHead>
                <TableHead className="w-[120px] text-center text-sm whitespace-nowrap">Fecha Creación</TableHead>
                <TableHead className="w-12 text-center align-middle">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
              {tiendas.map((tienda) => (
                <TableRow key={tienda.id} className="align-middle">
                  <TableCell className="text-center align-middle">
                    <Checkbox
                      checked={tiendasSeleccionadas.includes(tienda.id)}
                      onCheckedChange={(checked) => handleSeleccionarTienda(tienda.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap max-w-[160px] truncate">{tienda.nombre}</TableCell>
                  <TableCell className="text-sm font-mono whitespace-nowrap">{tienda.codigo}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{tienda.tipo_tienda}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate whitespace-nowrap">
                    {tienda.razon_social || <span className="text-muted-foreground">No registrado</span>}
                  </TableCell>
                  <TableCell className="text-sm font-mono whitespace-nowrap">
                    {tienda.nit_cc ? (
                      <span>{tienda.nit_cc}</span>
                    ) : (
                      <span className="text-muted-foreground">No registrado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap max-w-[120px] truncate">{tienda.ciudades?.nombre}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap max-w-[120px] truncate">{tienda.telefono || <span className="text-muted-foreground">Sin teléfono</span>}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap max-w-[180px] truncate">{tienda.email || <span className="text-muted-foreground">Sin correo</span>}</TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{tienda.pantallas_conectadas}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <Badge className={`${getStatusColor(tienda.activa)} text-white text-xs px-2 py-1 whitespace-nowrap`}>{getStatusText(tienda.activa)}</Badge>
                  </TableCell>
                  <TableCell className="text-center align-middle text-xs whitespace-nowrap">
                    <span>{new Date(tienda.created_at).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditarTienda(tienda)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleEliminarTienda(tienda)}
                          disabled={eliminandoIndividual === tienda.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {eliminandoIndividual === tienda.id ? "Eliminando..." : "Eliminar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </div>

        {tiendas.length === 0 && (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tiendas</h3>
            <p className="text-muted-foreground">No se encontraron tiendas con los filtros aplicados.</p>
          </div>
        )}
      </div>

      <EditarTiendaDialog
        abierto={dialogEditarAbierto}
        onClose={() => {
          setDialogEditarAbierto(false)
          setTiendaSeleccionada(null)
        }}
        tienda={tiendaSeleccionada}
        onTiendaActualizada={onTiendaActualizada}
      />
    </>
  )
}
