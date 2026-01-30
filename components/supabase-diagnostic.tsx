"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { testSupabaseConnection, getDiagnosticInfo } from "@/lib/supabase"

export function SupabaseDiagnostic() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const runDiagnostic = async () => {
    setTesting(true)

    try {
      // Obtener información de diagnóstico
      const info = getDiagnosticInfo()
      setDiagnosticInfo(info)

      // Probar conexión
      const result = await testSupabaseConnection()
      setConnectionStatus(result)

      // Mostrar detalles si hay errores
      if (!result.success) {
        setShowDetails(true)
      }
    } catch (error) {
      console.error("Error en diagnóstico:", error)
      setConnectionStatus({
        success: false,
        message: "Error al ejecutar diagnóstico",
        details: [error instanceof Error ? error.message : "Error desconocido"],
      })
      setShowDetails(true)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Verificando...</Badge>
    if (status) return <Badge variant="default">Conectado</Badge>
    return <Badge variant="destructive">Error</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnóstico de Supabase
        </CardTitle>
        <CardDescription>Estado de la conexión y configuración de la base de datos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado principal */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus?.success)}
            <span className="font-medium">
              {connectionStatus?.success === null
                ? "Verificando conexión..."
                : connectionStatus?.success
                  ? "Conexión establecida"
                  : "Error de conexión"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(connectionStatus?.success)}
            <Button variant="outline" size="sm" onClick={runDiagnostic} disabled={testing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Verificando..." : "Verificar"}
            </Button>
          </div>
        </div>

        {/* Mensaje principal */}
        {connectionStatus && (
          <Alert variant={connectionStatus.success ? "default" : "destructive"}>
            {connectionStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{connectionStatus.success ? "Conexión exitosa" : "Error de conexión"}</AlertTitle>
            <AlertDescription>{connectionStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Detalles expandibles */}
        {(diagnosticInfo || connectionStatus?.details) && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Detalles técnicos
                </span>
                <span className="text-xs">{showDetails ? "Ocultar" : "Mostrar"}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Variables de entorno */}
              {diagnosticInfo && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Variables de entorno:</h4>
                  <div className="grid gap-2 text-sm bg-muted p-3 rounded">
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                      <span
                        className={
                          diagnosticInfo.environmentVariables.supabaseUrl.includes("✓")
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {diagnosticInfo.environmentVariables.supabaseUrl}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                      <span
                        className={
                          diagnosticInfo.environmentVariables.supabaseAnonKey.includes("✓")
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {diagnosticInfo.environmentVariables.supabaseAnonKey}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>NODE_ENV:</span>
                      <span>{diagnosticInfo.environmentVariables.nodeEnv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cliente Supabase:</span>
                      <span className={diagnosticInfo.clientStatus.includes("✓") ? "text-green-600" : "text-red-600"}>
                        {diagnosticInfo.clientStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Errores de validación */}
              {diagnosticInfo?.validation?.errors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-red-600">Errores de configuración:</h4>
                  <ul className="text-sm space-y-1 bg-red-50 p-3 rounded border border-red-200">
                    {diagnosticInfo.validation.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-600">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detalles del error */}
              {connectionStatus?.details?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Detalles del error:</h4>
                  <ul className="text-sm space-y-1 bg-muted p-3 rounded">
                    {connectionStatus.details.map((detail: string, index: number) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instrucciones de solución */}
              {!connectionStatus?.success && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pasos para solucionar:</h4>
                  <ol className="text-sm space-y-1 bg-blue-50 p-3 rounded border border-blue-200">
                    <li>1. Verifica que las variables de entorno estén configuradas en tu archivo .env.local</li>
                    <li>2. Asegúrate de que la URL de Supabase sea correcta y comience con https://</li>
                    <li>3. Verifica que la clave anónima (anon key) sea válida</li>
                    <li>4. Confirma que tu proyecto de Supabase esté activo</li>
                    <li>5. Revisa que las tablas necesarias existan en tu base de datos</li>
                  </ol>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
