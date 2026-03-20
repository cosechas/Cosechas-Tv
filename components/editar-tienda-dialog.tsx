"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { actualizarTienda, registrarActividad, getCiudades } from "@/lib/database"
import type { Tienda, Ciudad } from "@/lib/supabase"

interface EditarTiendaDialogProps {
  abierto: boolean
  onClose: () => void
  tienda: Tienda | null
  onTiendaActualizada: (tienda: Tienda) => void
}

export function EditarTiendaDialog({ abierto, onClose, tienda, onTiendaActualizada }: EditarTiendaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [ciudades, setCiudades] = useState<Ciudad[]>([])

  useEffect(() => {
    async function cargarCiudades() {
      try {
        const data = await getCiudades()
        setCiudades(data)
      } catch (error) {
        console.error("Error al cargar ciudades:", error)
      }
    }

    if (abierto) {
      cargarCiudades()
    }
  }, [abierto])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!tienda) return

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const codigo = formData.get("codigo") as string
    const ciudadId = formData.get("ciudad") as string
    const direccion = formData.get("direccion") as string
    const razonSocial = formData.get("razon_social") as string
    const nitCc = formData.get("nit_cc") as string
    const tipoTienda = formData.get("tipo_tienda") as "Local" | "Burbuja"
    const pantallas = Number.parseInt(formData.get("pantallas") as string) || 0
    const activa = formData.get("activa") === "on"

    try {
      const tiendaActualizada = await actualizarTienda(tienda.id, {
        nombre,
        codigo,
        ciudad_id: ciudadId,
        direccion: direccion || undefined,
        razon_social: razonSocial || undefined,
        nit_cc: nitCc || undefined,
        tipo_tienda: tipoTienda,
        pantallas_conectadas: pantallas,
        activa,
      })

      // Registrar actividad
      await registrarActividad({
        tipo: "tienda_actualizada",
        descripcion: `Tienda actualizada: ${nombre} (${tipoTienda})`,
        tienda_id: tienda.id,
        ciudad_id: ciudadId,
      })


      onTiendaActualizada(tiendaActualizada)
      onClose()
    } catch (error) {
      console.error("Error al actualizar tienda:", error)

    } finally {
      setLoading(false)
    }
  }

  if (!tienda) return null

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tienda</DialogTitle>
          <DialogDescription>Modifica la información de la tienda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[420px] w-full rounded-md border p-3 shadow-inner bg-muted/10 overflow-hidden">
            <div className="grid gap-4 pr-3">
              {/* Información básica */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la tienda *</Label>
              <Input id="nombre" name="nombre" defaultValue={tienda.nombre} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código único *</Label>
                <Input id="codigo" name="codigo" defaultValue={tienda.codigo} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo_tienda">Tipo de tienda *</Label>
                <Select name="tipo_tienda" defaultValue={tienda.tipo_tienda} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Burbuja">Burbuja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información legal */}
            <div className="grid gap-2">
              <Label htmlFor="razon_social">Razón Social</Label>
              <Input
                id="razon_social"
                name="razon_social"
                defaultValue={tienda.razon_social || ""}
                placeholder="Ej: Comercializadora ABC S.A.S."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nit_cc">NIT/C.C</Label>
              <Input
                id="nit_cc"
                name="nit_cc"
                defaultValue={tienda.nit_cc || ""}
                placeholder="Ej: 900123456-1 o 12345678"
              />
            </div>

            {/* Ubicación */}
            <div className="grid gap-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Select name="ciudad" defaultValue={tienda.ciudad_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map((ciudad) => (
                    <SelectItem key={ciudad.id} value={ciudad.id}>
                      {ciudad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                name="direccion"
                defaultValue={tienda.direccion || ""}
                placeholder="Dirección completa de la tienda"
                rows={2}
              />
            </div>

            {/* Opciones */}
            <div className="grid gap-2">
              <Label htmlFor="pantallas">Pantallas</Label>
              <Input
                id="pantallas"
                name="pantallas"
                type="number"
                min="0"
                defaultValue={tienda.pantallas_conectadas}
                placeholder="0"
                className="max-w-[120px] w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="activa" name="activa" defaultChecked={tienda.activa} />
              <Label htmlFor="activa">Tienda activa</Label>
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Tienda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
