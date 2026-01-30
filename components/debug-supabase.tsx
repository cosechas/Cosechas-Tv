"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"
import { getCiudades, getTiendas } from "@/lib/database"
import { supabase } from "@/lib/supabase"
import type { Ciudad, Tienda } from "@/lib/supabase"

export function DebugSupabase() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conexionOk, setConexionOk] = useState<boolean | null>(null)

  const verificarConexion = async () => {
    try {
      const { data, error } = await supabase.from("ciudades").select("count", { count: "exact", head: true })
      if (error) throw error
      setConexionOk(true)
      return true
    } catch (err) {
      console.error("Error de conexión:", err)
      setConexionOk(false)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return false
    }
  }

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)

    try {
      // Verificar conexión primero
      const conexionValida = await verificarConexion()
      if (!conexionValida) return

      // Cargar ciudades
      const ciudadesData = await getCiudades()
      setCiudades(ciudadesData)

      // Cargar tiendas
      const tiendasData = await getTiendas()
      setTiendas(tiendasData)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug Supabase
          </CardTitle>
          <CardDescription>Información de conexión y datos de la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {conexionOk === null ? (
                <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
              ) : conexionOk ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                Conexión a Supabase: {conexionOk === null ? "Verificando..." : conexionOk ? "Conectado" : "Error"}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={cargarDatos} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {/* Variables de entorno */}
          <div className="space-y-2">
            <h4 className="font-medium">Variables de entorno:</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurada" : "No configurada"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurada" : "No configurada"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Datos cargados */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Ciudades ({ciudades.length})</h4>
              {loading ? (
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : ciudades.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {ciudades.map((ciudad) => (
                    <div key={ciudad.id} className="text-sm flex justify-between">
                      <span>{ciudad.nombre}</span>
                      <Badge variant="outline" className="text-xs">
                        {ciudad.codigo}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay ciudades</p>
              )}
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Tiendas ({tiendas.length})</h4>
              {loading ? (
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : tiendas.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tiendas.map((tienda) => (
                    <div key={tienda.id} className="text-sm">
                      <div className="flex justify-between">
                        <span>{tienda.nombre}</span>
                        <Badge variant="outline" className="text-xs">
                          {tienda.codigo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{tienda.ciudades?.nombre}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay tiendas</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
