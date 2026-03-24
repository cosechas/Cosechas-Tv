"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { actualizarCiudad } from "@/lib/database"
import type { Ciudad } from "@/lib/supabase"
import { MapPin, Loader2 } from "lucide-react"

interface EditarCiudadDialogProps {
  ciudad: Ciudad | null
  onClose: () => void
  onCiudadActualizada: (ciudad: Ciudad) => void
}

export function EditarCiudadDialog({ ciudad, onClose, onCiudadActualizada }: EditarCiudadDialogProps) {
  const [nombre, setNombre] = useState("")
  const [codigo, setCodigo] = useState("")
  const [activa, setActiva] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ciudad) {
      setNombre(ciudad.nombre)
      setCodigo(ciudad.codigo)
      setActiva(ciudad.activa)
      setError(null)
    }
  }, [ciudad])

  const handleClose = () => {
    onClose()
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ciudad) return

    if (!nombre.trim() || !codigo.trim()) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const ciudadActualizada = await actualizarCiudad(ciudad.id, {
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        activa,
      })

      onCiudadActualizada(ciudadActualizada)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la ciudad")
    } finally {
      setGuardando(false)
    }
  }

  // No renderizar si no hay ciudad
  if (!ciudad) return null

  return (
    <Dialog open={!!ciudad} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
            <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-center text-xl">Editar Ciudad</DialogTitle>
          <DialogDescription className="text-center">
            Modifica los detalles de la ciudad. Los cambios afectarán la organización general.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 mt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editNombreCiudad">Nombre de la ciudad <span className="text-destructive">*</span></Label>
              <Input
                id="editNombreCiudad"
                placeholder="Ej. Medellín"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCodigoCiudad">Código / Abreviatura <span className="text-destructive">*</span></Label>
              <Input
                id="editCodigoCiudad"
                placeholder="Ej. MED"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={10}
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">Un código corto para identificar fácilmente la ciudad.</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="editEstadoCiudad" className="text-base">Ciudad activa</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita o deshabilita temporalmente esta ciudad.
                </p>
              </div>
              <Switch
                id="editEstadoCiudad"
                checked={activa}
                onCheckedChange={setActiva}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando} className="bg-orange-600 hover:bg-orange-700 text-white">
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
