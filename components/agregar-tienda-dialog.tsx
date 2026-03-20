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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { crearTienda, registrarActividad, getCiudades } from "@/lib/database"
import type { Tienda, Ciudad } from "@/lib/supabase"

interface AgregarTiendaDialogProps {
  abierto: boolean
  onClose: () => void
  ciudadId: string | null
  onTiendaAgregada: (tienda: Tienda) => void
}

// Prefijos de país con banderas (emojis)
const countryPrefixes = [
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+1", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "+34", name: "España", flag: "🇪🇸" },
  { code: "+52", name: "México", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+44", name: "Reino Unido", flag: "🇬🇧" },
]

export function AgregarTiendaDialog({ abierto, onClose, ciudadId, onTiendaAgregada }: AgregarTiendaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string>(ciudadId || "")
  const [codigoGenerado, setCodigoGenerado] = useState<string>('')

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
      setCiudadSeleccionada(ciudadId || "")
      setCodigoGenerado('') // Limpiar código generado al abrir
    }
  }, [abierto, ciudadId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!ciudadSeleccionada) {
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const direccion = formData.get("direccion") as string
    const razonSocial = formData.get("razon_social") as string
    const nitCc = formData.get("nit_cc") as string
    const tipoTienda = formData.get("tipo_tienda") as "Local" | "Burbuja"
    const pantallas = Number.parseInt(formData.get("pantallas") as string) || 0

    try {
      const nuevaTienda = await crearTienda({
        nombre,
        codigo: "", // Se generará automáticamente en el backend
        ciudad_id: ciudadSeleccionada,
        direccion: direccion || undefined,
        razon_social: razonSocial || undefined,
        nit_cc: nitCc || undefined,
        tipo_tienda: tipoTienda || "Local",
        pantallas_conectadas: pantallas,
        activa: true,
      })

      // Registrar actividad
      await registrarActividad({
        tipo: "tienda_agregada",
        descripcion: `Nueva tienda agregada: ${nombre} (${tipoTienda})`,
        tienda_id: nuevaTienda.id,
        ciudad_id: ciudadSeleccionada,
      })

      onTiendaAgregada(nuevaTienda)

      // Guardar el código generado para mostrarlo
      setCodigoGenerado(nuevaTienda.codigo)

      // Limpiar formulario
      ;(e.target as HTMLFormElement).reset()
      setCiudadSeleccionada("")
    } catch (error) {
      console.error("Error al agregar tienda:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {codigoGenerado ? "Tienda Creada Exitosamente" : "Agregar Nueva Tienda"}
          </DialogTitle>
          <DialogDescription>
            {codigoGenerado 
              ? `La tienda se ha creado correctamente. Código asignado: ${codigoGenerado}`
              : "Completa la información de la nueva tienda."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[400px] w-full rounded-md border p-3 shadow-inner bg-muted/10 overflow-hidden">
            <div className="grid gap-4 pr-3">
              {/* Información básica */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la tienda *</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: Tienda Centro Comercial" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código único *</Label>
                <Input 
                  id="codigo" 
                  name="codigo" 
                  placeholder={codigoGenerado ? codigoGenerado : "Se generará automáticamente"} 
                  disabled 
                  className={`${codigoGenerado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500'} cursor-not-allowed`}
                  value={codigoGenerado}
                />
                <p className="text-xs text-gray-500">
                  {codigoGenerado ? (
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        ✓ PIN generado: {codigoGenerado}
                      </Badge>
                    </span>
                  ) : (
                    "Se generará un PIN de 4 dígitos único"
                  )}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo_tienda">Tipo de tienda *</Label>
                <Select name="tipo_tienda" defaultValue="Local" required>
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
              <Input id="razon_social" name="razon_social" placeholder="Ej: Comercializadora ABC S.A.S." />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nit_cc">NIT/C.C</Label>
              <Input id="nit_cc" name="nit_cc" placeholder="Ej: 900123456-1 o 12345678" />
            </div>

            {/* Ubicación */}
            <div className="grid gap-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Select value={ciudadSeleccionada} onValueChange={setCiudadSeleccionada} required>
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
              <Textarea id="direccion" name="direccion" placeholder="Dirección completa de la tienda" rows={2} />
            </div>

            {/* Opciones */}
            <div className="grid gap-2">
              <Label htmlFor="pantallas">Pantallas</Label>
              <Input id="pantallas" name="pantallas" type="number" min="0" placeholder="0" className="max-w-[120px] w-full" />
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            {codigoGenerado ? (
              <Button type="button" onClick={onClose} className="w-full">
                Cerrar
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Agregando..." : "Agregar Tienda"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}