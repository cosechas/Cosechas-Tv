"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ConexionTest() {
  const [estado, setEstado] = useState<"verificando" | "conectado" | "error">("verificando")
  const [mensaje, setMensaje] = useState("")
  const [detalles, setDetalles] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)

  const probarConexion = async () => {
    setCargando(true)
    setEstado("verificando")
    setMensaje("Verificando conexión...")
    setDetalles([])

    try {
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

      setDetalles([`URL: ${supabaseUrl.substring(0, 15)}...`, `API Key: ${supabaseKey.substring(0, 5)}...`])

      const { data, error } = await supabase.from("ciudades").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      setEstado("conectado")
      setMensaje("Conexión establecida correctamente")
      setDetalles((prev) => [...prev, "Consulta exitosa a la tabla 'ciudades'"])
    } catch (error) {
      console.error("Error de conexión:", error)
      setEstado("error")

      if (error instanceof Error) {
        setMensaje(`Error: ${error.message}`)

        // Analizar el tipo de error para dar sugerencias específicas
        if (error.message.includes("Failed to fetch")) {
          setDetalles([
            "Error de red: No se pudo conectar al servidor",
            "Verifica tu conexión a internet",
            "Confirma que la URL de Supabase sea correcta",
            "Asegúrate que el proyecto de Supabase esté activo",
          ])
        } else if (error.message.includes("permission denied")) {
          setDetalles([
            "Error de permisos: No tienes acceso a la tabla",
            "Verifica las políticas RLS en Supabase",
            "Confirma que estás usando la clave anónima correcta",
          ])
        } else {
          setDetalles([error.message])
        }
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

        {/* Botón para reintentar */}
        <div className="flex justify-end">
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
        </div>
      </CardContent>
    </Card>
  )
}
