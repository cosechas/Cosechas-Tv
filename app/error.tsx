"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error capturado:", error)
  }, [error])

  const isNetworkError = error.message.includes("fetch") || error.message.includes("network")
  const isBlobError = error.message.includes("blob:")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error de Aplicación
          </CardTitle>
          <CardDescription>
            {isBlobError
              ? "Error de carga de recursos"
              : isNetworkError
                ? "Error de conexión"
                : "Ha ocurrido un error inesperado"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Detalles del error:</AlertTitle>
            <AlertDescription className="text-xs font-mono break-all">{error.message}</AlertDescription>
          </Alert>

          {(isBlobError || isNetworkError) && (
            <Alert>
              <AlertTitle>Posibles soluciones:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  <li>Recarga la página</li>
                  <li>Verifica tu conexión a internet</li>
                  <li>Limpia la caché del navegador</li>
                  <li>Intenta en una pestaña de incógnito</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
