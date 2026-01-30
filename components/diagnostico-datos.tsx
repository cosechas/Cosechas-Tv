"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DiagnosticoDatos() {
  const [cargando, setCargando] = useState(true)
  const [tiendasRaw, setTiendasRaw] = useState<any[]>([])
  const [ciudadesRaw, setCiudadesRaw] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [consultasTiendas, setConsultasTiendas] = useState<{ consulta: string; resultado: any }[]>([])

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    setTiendasRaw([])
    setCiudadesRaw([])
    setConsultasTiendas([])

    try {
      // 1. Consulta todas las tiendas sin filtros
      const { data: todasTiendas, error: errorTodasTiendas } = await supabase.from("tiendas").select("*")

      if (errorTodasTiendas) throw new Error(`Error al consultar todas las tiendas: ${errorTodasTiendas.message}`)
      setTiendasRaw(todasTiendas || [])
      setConsultasTiendas((prev) => [
        ...prev,
        {
          consulta: "SELECT * FROM tiendas",
          resultado: todasTiendas,
        },
      ])

      // 2. Consulta tiendas activas
      const { data: tiendasActivas, error: errorTiendasActivas } = await supabase
        .from("tiendas")
        .select("*")
        .eq("activa", true)

      setConsultasTiendas((prev) => [
        ...prev,
        {
          consulta: "SELECT * FROM tiendas WHERE activa = true",
          resultado: tiendasActivas,
        },
      ])

      // 3. Consulta tiendas con join a ciudades
      const { data: tiendasConCiudades, error: errorTiendasConCiudades } = await supabase.from("tiendas").select(`
          *,
          ciudades (
            id,
            nombre,
            codigo
          )
        `)

      setConsultasTiendas((prev) => [
        ...prev,
        {
          consulta: "SELECT tiendas.*, ciudades.* FROM tiendas LEFT JOIN ciudades ON tiendas.ciudad_id = ciudades.id",
          resultado: tiendasConCiudades,
        },
      ])

      // 4. Consulta todas las ciudades
      const { data: todasCiudades, error: errorTodasCiudades } = await supabase.from("ciudades").select("*")

      if (errorTodasCiudades) throw new Error(`Error al consultar ciudades: ${errorTodasCiudades.message}`)
      setCiudadesRaw(todasCiudades || [])
    } catch (err) {
      console.error("Error en diagnóstico:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Diagnóstico de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cargando ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos...</span>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al cargar datos</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Resumen de datos */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tabla de Tiendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de registros:</span>
                      <Badge variant="outline">{tiendasRaw.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiendas activas:</span>
                      <Badge variant="outline">{tiendasRaw.filter((t) => t.activa).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiendas inactivas:</span>
                      <Badge variant="outline">{tiendasRaw.filter((t) => !t.activa).length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tabla de Ciudades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de registros:</span>
                      <Badge variant="outline">{ciudadesRaw.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ciudades activas:</span>
                      <Badge variant="outline">{ciudadesRaw.filter((c) => c.activa).length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ciudades inactivas:</span>
                      <Badge variant="outline">{ciudadesRaw.filter((c) => !c.activa).length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Datos de tiendas */}
            <div>
              <h3 className="text-lg font-medium mb-2">Datos de Tiendas</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Ciudad ID</TableHead>
                      <TableHead>Activa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiendasRaw.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No hay tiendas en la base de datos
                        </TableCell>
                      </TableRow>
                    ) : (
                      tiendasRaw.map((tienda) => (
                        <TableRow key={tienda.id}>
                          <TableCell className="font-mono text-xs">{tienda.id.substring(0, 8)}...</TableCell>
                          <TableCell>{tienda.nombre}</TableCell>
                          <TableCell>{tienda.codigo}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {tienda.ciudad_id ? tienda.ciudad_id.substring(0, 8) + "..." : "NULL"}
                          </TableCell>
                          <TableCell>
                            {tienda.activa ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Datos de ciudades */}
            <div>
              <h3 className="text-lg font-medium mb-2">Datos de Ciudades</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Activa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ciudadesRaw.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No hay ciudades en la base de datos
                        </TableCell>
                      </TableRow>
                    ) : (
                      ciudadesRaw.map((ciudad) => (
                        <TableRow key={ciudad.id}>
                          <TableCell className="font-mono text-xs">{ciudad.id.substring(0, 8)}...</TableCell>
                          <TableCell>{ciudad.nombre}</TableCell>
                          <TableCell>{ciudad.codigo}</TableCell>
                          <TableCell>
                            {ciudad.activa ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Resultados de consultas */}
            <div>
              <h3 className="text-lg font-medium mb-2">Resultados de Consultas</h3>
              <div className="space-y-4">
                {consultasTiendas.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-mono bg-muted p-2 rounded-md">{item.consulta}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p className="mb-2">Resultados: {item.resultado?.length || 0}</p>
                        {item.resultado?.length > 0 ? (
                          <pre className="bg-muted p-2 rounded-md overflow-auto max-h-40 text-xs">
                            {JSON.stringify(item.resultado, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-muted-foreground">No hay resultados</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={cargarDatos} disabled={cargando}>
                {cargando ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar datos
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
