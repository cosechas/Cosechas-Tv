"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { crearCiudad } from "@/lib/database"
import type { Ciudad } from "@/lib/supabase"
import { MapPin, Loader2 } from "lucide-react"

interface AgregarCiudadDialogProps {
  abierto: boolean
  onClose: () => void
  onCiudadAgregada: (ciudad: Ciudad) => void
}

export function AgregarCiudadDialog({ abierto, onClose, onCiudadAgregada }: AgregarCiudadDialogProps) {
  const [nombre, setNombre] = useState("")
  const [codigo, setCodigo] = useState("")
  const [activa, setActiva] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const limpiarFormulario = () => {
    setNombre("")
    setCodigo("")
    setActiva(true)
    setError(null)
  }

  const handleClose = () => {
    limpiarFormulario()
    onClose()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !codigo.trim()) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const nuevaCiudad = await crearCiudad({
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        activa,
      })

      onCiudadAgregada(nuevaCiudad)
      limpiarFormulario()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la ciudad")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center text-xl">Agregar Nueva Ciudad</DialogTitle>
          <DialogDescription className="text-center">
            Completa los detalles para registrar una nueva zona o ciudad en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreCiudad">Nombre de la ciudad <span className="text-destructive">*</span></Label>
              <Input
                id="nombreCiudad"
                placeholder="Ej. Medellín"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoCiudad">Código / Abreviatura <span className="text-destructive">*</span></Label>
              <Input
                id="codigoCiudad"
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
                <Label htmlFor="estadoCiudad" className="text-base">Ciudad activa</Label>
                <p className="text-xs text-muted-foreground">
                  Habilita la ciudad inmediatamente tras crearla.
                </p>
              </div>
              <Switch
                id="estadoCiudad"
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
            <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white">
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear ciudad"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
