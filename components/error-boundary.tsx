"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error capturado por ErrorBoundary:", error)
  }, [error])

  const isSupabaseError = error.message.includes("supabase") || error.message.includes("required")

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error de Aplicación
          </CardTitle>
          <CardDescription>
            {isSupabaseError ? "Problema de configuración de base de datos" : "Ha ocurrido un error inesperado"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Detalles del error:</AlertTitle>
            <AlertDescription className="font-mono text-xs">{error.message}</AlertDescription>
          </Alert>

          {isSupabaseError && (
            <Alert>
              <AlertTitle>Posibles soluciones:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                  <li>Verifica que el archivo .env.local existe</li>
                  <li>Confirma que NEXT_PUBLIC_SUPABASE_URL está configurada</li>
                  <li>Confirma que NEXT_PUBLIC_SUPABASE_ANON_KEY está configurada</li>
                  <li>Reinicia el servidor de desarrollo</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
