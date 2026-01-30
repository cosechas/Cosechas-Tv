"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { testConnection } from "@/lib/supabase-config"

export function TestConexion() {
  const [estado, setEstado] = useState<"verificando" | "conectado" | "error">("verificando")
  const [mensaje, setMensaje] = useState("Verificando conexión...")
  const [detalles, setDetalles] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorInfo, setErrorInfo] = useState<any>(null)

  const probarConexion = async () => {
    setCargando(true)
    setEstado("verificando")
    setMensaje("Verificando conexión...")
    setDetalles([])
    setErrorInfo(null)

    try {
      // Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setEstado("error")
        setMensaje("Variables de entorno no configuradas")
        setDetalles(
          [
            !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL no está configurada" : "",
            !supabaseKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada" : "",
          ].filter(Boolean),
        )
        return
      }

      // Mostrar información de configuración
      setDetalles([`URL: ${supabaseUrl.substring(0, 20)}...`, `API Key: ${supabaseKey.substring(0, 5)}...`])

      // Probar conexión
      const result = await testConnection()

      if (result.connected) {
        setEstado("conectado")
        setMensaje(result.message)
        setDetalles((prev) => [...prev, "Conexión establecida correctamente"])
      } else {
        setEstado("error")
        setMensaje(result.message)
        setErrorInfo(result.error)

        if (result.error) {
          setDetalles((prev) => [
            ...prev,
            `Código de error: ${result.error.code || "N/A"}`,
            `Mensaje: ${result.error.message || "Error desconocido"}`,
          ])
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      setEstado("error")

      if (error instanceof Error) {
        setMensaje(`Error: ${error.message}`)
        setDetalles([error.message])
      } else {
        setMensaje("Error desconocido")
      }
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    probarConexion()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {estado === "verificando" && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
          {estado === "conectado" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {estado === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          Prueba de Conexión a Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <Alert variant={estado === "conectado" ? "default" : estado === "error" ? "destructive" : "default"}>
          <AlertTitle>
            {estado === "verificando" && "Verificando conexión..."}
            {estado === "conectado" && "Conexión exitosa"}
            {estado === "error" && "Error de conexión"}
          </AlertTitle>
          <AlertDescription>{mensaje}</AlertDescription>
        </Alert>

        {/* Detalles */}
        {detalles.length > 0 && (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Detalles:</h3>
            <ul className="space-y-1 text-sm">
              {detalles.map((detalle, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{detalle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Información de error detallada */}
        {errorInfo && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <h3 className="font-medium mb-2 text-red-700 dark:text-red-300">Información de error:</h3>
            <pre className="text-xs overflow-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
              {JSON.stringify(errorInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={probarConexion} disabled={cargando}>
          {cargando ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Probar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
