"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { testSupabaseConnection } from "@/lib/supabase"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState<string>("")
  const [checking, setChecking] = useState(false)

  const checkConnection = async () => {
    setChecking(true)
    setStatus("checking")

    try {
      const result = await testSupabaseConnection()

      if (result.success) {
        setStatus("connected")
        setMessage("Conexión establecida")
      } else {
        setStatus("error")
        setMessage(result.message)
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error al verificar conexión")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md border border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600 flex-1">{message}</span>
        <Button variant="outline" size="sm" onClick={checkConnection} disabled={checking}>
          {checking ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-blue-600">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>Verificando conexión...</span>
    </div>
  )
}
