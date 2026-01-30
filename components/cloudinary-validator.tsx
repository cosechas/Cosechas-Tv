"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CloudinaryValidator() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)

  const validateConnection = async () => {
    setStatus("loading")

    try {
      const response = await fetch("/api/cloudinary/validate")
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }

      setResult(data)
    } catch (error) {
      setStatus("error")
      setResult({
        success: false,
        message: "Error al realizar la solicitud",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  useEffect(() => {
    validateConnection()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Validación de Cloudinary</CardTitle>
        <CardDescription>Verificando la conexión con Cloudinary</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-center text-muted-foreground">Verificando credenciales...</p>
          </div>
        )}

        {status === "success" && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-700">Conexión exitosa</AlertTitle>
            <AlertDescription className="text-green-600">
              <p>La conexión con Cloudinary se ha establecido correctamente.</p>
              <div className="mt-2 text-sm">
                <p>
                  <strong>Cloud Name:</strong> {result.cloudName}
                </p>
                <p>
                  <strong>API Key:</strong> {result.apiKey}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              <p>{result?.message || "No se pudo conectar con Cloudinary"}</p>
              {result?.error && <p className="mt-2 text-sm font-mono bg-destructive/20 p-2 rounded">{result.error}</p>}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={validateConnection}
          disabled={status === "loading"}
          variant={status === "success" ? "outline" : "default"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando
            </>
          ) : (
            "Verificar de nuevo"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
