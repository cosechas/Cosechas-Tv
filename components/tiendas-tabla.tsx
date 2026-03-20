"use client"

import { useState } from "react"
import { Building, MapPin, Monitor, Edit, Trash2, MoreHorizontal } from "lucide-react"
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

const TIEMPO_LIMITE_MS = 360000; // 6 minutos
const isTiendaOnline = (ultima_conexion?: string) => {
  if (!ultima_conexion) return false;
  return new Date().getTime() - new Date(ultima_conexion).getTime() < TIEMPO_LIMITE_MS;
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
      "Razón social": t.razon_social || "",
      Conexión: isTiendaOnline(t.ultima_conexion) ? "En línea" : "Desconectada",
      Ciudad: t.ciudades?.nombre || "",
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

        <div className="overflow-hidden rounded-xl shadow-sm border border-border/70 bg-card">
          <Table>
            <TableHeader className="bg-muted/40 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center align-middle">
                  <Checkbox
                    className="border-muted-foreground/40"
                    checked={tiendasSeleccionadas.length === tiendas.length && tiendas.length > 0}
                    onCheckedChange={handleSeleccionarTodas}
                  />
                </TableHead>
                <TableHead className="min-w-[150px] font-semibold text-foreground">Nombre</TableHead>
                <TableHead className="w-[110px] text-center font-semibold text-foreground">Código</TableHead>
                <TableHead className="min-w-[180px] max-w-[220px] font-semibold text-foreground">Razón social</TableHead>
                <TableHead className="w-[130px] text-center font-semibold text-foreground">Conexión</TableHead>
                <TableHead className="min-w-[130px] font-semibold text-foreground">Ciudad</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-foreground">Pantallas</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-foreground">Estado</TableHead>
                <TableHead className="w-[110px] text-center font-semibold text-foreground">Fecha Reg.</TableHead>
                <TableHead className="w-14 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:py-3">
              {tiendas.map((tienda) => (
                <TableRow key={tienda.id} className="align-middle hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center align-middle">
                    <Checkbox
                      checked={tiendasSeleccionadas.includes(tienda.id)}
                      onCheckedChange={(checked) => handleSeleccionarTienda(tienda.id, checked as boolean)}
                    />
                  </TableCell>

                  {/* Nombre */}
                  <TableCell>
                    <span className="font-semibold text-foreground text-sm max-w-[160px] truncate block">{tienda.nombre}</span>
                  </TableCell>

                  {/* Código */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground bg-accent/30 rounded-md">
                      {tienda.codigo}
                    </Badge>
                  </TableCell>

                  {/* Razón social */}
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={tienda.razon_social || "No registrado"}>
                    {tienda.razon_social || <span className="italic opacity-60">Sin registro</span>}
                  </TableCell>

                  {/* Conexión */}
                  <TableCell className="text-center">
                    {isTiendaOnline(tienda.ultima_conexion) ? (
                      <div className="inline-flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-500/20 shadow-sm mx-auto">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        En línea
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5 text-muted-foreground bg-muted hover:bg-accent px-2.5 py-1 rounded-full text-xs font-semibold border border-border shadow-sm transition-colors mx-auto">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                        Desconectada
                      </div>
                    )}
                  </TableCell>

                  {/* Ciudad */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      <span className="truncate max-w-[120px] text-foreground/80">{tienda.ciudades?.nombre}</span>
                    </div>
                  </TableCell>

                  {/* Pantallas */}
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-accent/40 text-accent-foreground px-3 py-1 rounded-lg border border-border/50 shadow-sm">
                      <Monitor className="h-3.5 w-3.5 text-primary opacity-80" />
                      <span className="font-semibold text-sm">{tienda.pantallas_conectadas}</span>
                    </div>
                  </TableCell>

                  {/* Estado (Activa/Inactiva) */}
                  <TableCell className="text-center">
                    <Badge variant={tienda.activa ? "outline" : "secondary"} className={`text-[10px] uppercase tracking-wider px-1.5 py-0 h-5 border-transparent ${tienda.activa ? 'text-blue-600 bg-blue-500/10 dark:text-blue-400' : 'text-muted-foreground'}`}>
                      {getStatusText(tienda.activa)}
                    </Badge>
                  </TableCell>

                  {/* Registro */}
                  <TableCell className="text-center text-xs text-muted-foreground font-medium">
                    {new Date(tienda.created_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleEditarTienda(tienda)} className="cursor-pointer py-2">
                          <Edit className="mr-2 h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Editar Tienda</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2"
                          onClick={() => handleEliminarTienda(tienda)}
                          disabled={eliminandoIndividual === tienda.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="font-medium text-sm">{eliminandoIndividual === tienda.id ? "Eliminando..." : "Eliminar Tienda"}</span>
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
