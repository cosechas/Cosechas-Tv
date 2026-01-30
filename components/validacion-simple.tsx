"use client"

import { useState } from "react"
import { CheckCircle, XCircle, RefreshCw, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCiudades, getTiendas, crearTienda, eliminarTienda } from "@/lib/database"
import type { Ciudad, Tienda } from "@/lib/supabase"

export function ValidacionSimple() {
  const [loading, setLoading] = useState(false)
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [mensaje, setMensaje] = useState("")

  const validarConexion = async () => {
    setLoading(true)
    setStatus("idle")
    setMensaje("Validando conexión...")

    try {
      // 1. Probar lectura de ciudades
      const ciudadesData = await getCiudades()
      setCiudades(ciudadesData)
      console.log("✅ Ciudades cargadas:", ciudadesData.length)

      // 2. Probar lectura de tiendas
      const tiendasData = await getTiendas()
      setTiendas(tiendasData)
      console.log("✅ Tiendas cargadas:", tiendasData.length)

      setStatus("success")
      setMensaje(`Conexión exitosa! ${ciudadesData.length} ciudades y ${tiendasData.length} tiendas cargadas.`)


    } catch (error) {
      console.error("❌ Error en validación:", error)
      setStatus("error")
      setMensaje(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const probarCrearTienda = async () => {
    if (ciudades.length === 0) {
      setStatus("error")
      setMensaje("Primero valida la conexión para cargar las ciudades")
      return
    }

    try {
      const nuevaTienda = await crearTienda({
        nombre: "Tienda de Prueba",
        codigo: `TEST-${Date.now()}`,
        ciudad_id: ciudades[0].id,
        direccion: "Dirección de prueba",
        activa: true,
        pantallas_conectadas: 1,
        tipo_tienda: "Local",
      })

      console.log("✅ Tienda creada:", nuevaTienda)
      setTiendas([...tiendas, nuevaTienda])
      setStatus("success")
      setMensaje(`Tienda "${nuevaTienda.nombre}" creada exitosamente`)
    } catch (error) {
      console.error("❌ Error al crear tienda:", error)
      setStatus("error")
      setMensaje(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const probarEliminarTienda = async (tienda: Tienda) => {
    try {
      await eliminarTienda(tienda.id)
      console.log("✅ Tienda eliminada:", tienda.nombre)
      setTiendas(tiendas.filter((t) => t.id !== tienda.id))
      setStatus("success")
      setMensaje(`Tienda "${tienda.nombre}" eliminada exitosamente`)
    } catch (error) {
      console.error("❌ Error al eliminar tienda:", error)
      setStatus("error")
      setMensaje(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  return (
    <div className="space-y-6 shadow-none">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "idle" && <RefreshCw className="h-5 w-5 text-blue-500" />}
            {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            Validación de Conexión
          </CardTitle>
          <CardDescription>Prueba las operaciones básicas de la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Estado de la conexión</p>
              <p className="text-sm text-muted-foreground">{mensaje || "Presiona validar para comenzar"}</p>
            </div>
            <Button onClick={validarConexion} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Validar Conexión
                </>
              )}
            </Button>
          </div>

          {status === "success" && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Ciudades ({ciudades.length})</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {ciudades.map((ciudad) => (
                      <div key={ciudad.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>{ciudad.nombre}</span>
                        <Badge variant="outline">{ciudad.codigo}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Tiendas ({tiendas.length})</h4>
                    <Button size="sm" onClick={probarCrearTienda}>
                      <Plus className="h-3 w-3 mr-1" />
                      Crear Prueba
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {tiendas.map((tienda) => (
                      <div key={tienda.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{tienda.nombre}</span>
                          <p className="text-xs text-muted-foreground">{tienda.ciudades?.nombre}</p>
                        </div>
                        {tienda.nombre.includes("Prueba") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => probarEliminarTienda(tienda)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
