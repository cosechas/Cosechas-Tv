"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Save, RotateCcw, CheckCircle, AlertCircle, Database, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DuracionConfig {
  precios: number
  publicidad: number
  promociones: number
  eventos: number
  informativo: number
}

const CATEGORIAS = [
  { key: "precios", label: "Precios", description: "Imágenes de precios y productos", color: "bg-green-500" },
  { key: "publicidad", label: "Publicidad", description: "Anuncios y promociones comerciales", color: "bg-blue-500" },
  { key: "promociones", label: "Promociones", description: "Ofertas especiales y descuentos", color: "bg-orange-500" },
  { key: "eventos", label: "Eventos", description: "Eventos especiales y celebraciones", color: "bg-purple-500" },
  { key: "informativo", label: "Informativo", description: "Información general y noticias", color: "bg-gray-500" },
]

const DURACIONES_POR_DEFECTO: DuracionConfig = {
  precios: 3,
  publicidad: 5,
  promociones: 4,
  eventos: 6,
  informativo: 4,
}

export default function DuracionesPage() {
  const [duraciones, setDuraciones] = useState<DuracionConfig>(DURACIONES_POR_DEFECTO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalDuraciones, setOriginalDuraciones] = useState<DuracionConfig | null>(null)
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const response = await fetch("/api/configuracion/duraciones")
        const data = await response.json()
        
        if (response.ok) {
          setDuraciones(data)
          setOriginalDuraciones(data)
          setDbStatus('connected')
          localStorage.setItem('duraciones_config', JSON.stringify(data))
        } else {
          throw new Error("Error en respuesta de API")
        }
      } catch (error) {
        console.error("Error al cargar desde API:", error)
        
        try {
          const savedConfig = localStorage.getItem('duraciones_config')
          if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig)
            setDuraciones(parsedConfig)
            setOriginalDuraciones(parsedConfig)
            setDbStatus('error')
            toast({
              title: "Modo offline",
              description: "Usando configuración guardada localmente",
              icon: <WifiOff className="h-4 w-4" />,
            })
          } else {
            setDuraciones(DURACIONES_POR_DEFECTO)
            setOriginalDuraciones(DURACIONES_POR_DEFECTO)
            setDbStatus('error')
            toast({
              title: "Sin conexión",
              description: "Usando valores por defecto",
              variant: "destructive",
            })
          }
        } catch (localError) {
          console.error("Error al cargar configuración local:", localError)
          setDuraciones(DURACIONES_POR_DEFECTO)
          setOriginalDuraciones(DURACIONES_POR_DEFECTO)
          setDbStatus('error')
        }
      } finally {
        setLoading(false)
      }
    }

    cargarConfiguracion()
  }, [toast])

  useEffect(() => {
    if (originalDuraciones) {
      const changed = JSON.stringify(duraciones) !== JSON.stringify(originalDuraciones)
      setHasChanges(changed)
    }
  }, [duraciones, originalDuraciones])

  const handleDuracionChange = (categoria: keyof DuracionConfig, valor: string) => {
    const numValor = parseInt(valor) || 1
    const clampedValor = Math.max(1, Math.min(30, numValor))
    
    setDuraciones(prev => ({
      ...prev,
      [categoria]: clampedValor
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('duraciones_config', JSON.stringify(duraciones))
      
      if (isOnline) {
        const response = await fetch("/api/configuracion/duraciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ duraciones }),
        })

        const data = await response.json()

        if (response.ok) {
          setOriginalDuraciones(duraciones)
          setHasChanges(false)
          setDbStatus('connected')
          toast({
            title: "Configuración guardada",
            description: "Guardada en base de datos y respaldo local",
            icon: <CheckCircle className="h-4 w-4" />,
          })
        } else {
          throw new Error(data.error || "Error al guardar en BD")
        }
      } else {
        // Solo guardar localmente si no hay conexión
        setOriginalDuraciones(duraciones)
        setHasChanges(false)
        toast({
          title: "Configuración guardada localmente",
          description: "Se guardará en la base de datos cuando haya conexión",
          icon: <WifiOff className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setDbStatus('error')
      toast({
        title: "Error",
        description: "Guardado localmente, pero no se pudo sincronizar con la base de datos",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalDuraciones) {
      setDuraciones(originalDuraciones)
      setHasChanges(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración de Duraciones</h1>
        <p className="text-muted-foreground">
          Configura cuánto tiempo se mostrará cada imagen según su categoría en el reproductor de TV.
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Duraciones por Categoría
          </CardTitle>
          <CardDescription>
            Ajusta la duración de visualización para cada tipo de contenido. Los cambios se guardan en la base de datos y respaldo local.
          </CardDescription>
          <div className={`mt-2 p-3 rounded-md flex items-center gap-2 ${
            dbStatus === 'connected' && isOnline
              ? 'bg-green-50 border border-green-200' 
              : dbStatus === 'error' || !isOnline
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-600" />
            )}
            <p className={`text-sm ${
              dbStatus === 'connected' && isOnline ? 'text-green-800' : 
              dbStatus === 'error' || !isOnline ? 'text-orange-800' : 'text-yellow-800'
            }`}>
              <strong>Estado:</strong> {
                dbStatus === 'connected' && isOnline ? 'Conectado a la base de datos' :
                !isOnline ? 'Sin conexión - Modo offline' :
                dbStatus === 'error' ? 'Error de conexión - Usando respaldo local' :
                'Conectando...'
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {CATEGORIAS.map((categoria, index) => (
            <div key={categoria.key}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={categoria.color}>
                    {categoria.label}
                  </Badge>
                  <div>
                    <h3 className="font-medium">{categoria.label}</h3>
                    <p className="text-sm text-muted-foreground">{categoria.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`duracion-${categoria.key}`} className="text-sm font-medium">
                    Duración:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`duracion-${categoria.key}`}
                      type="number"
                      min="1"
                      max="30"
                      value={duraciones[categoria.key as keyof DuracionConfig]}
                      onChange={(e) => handleDuracionChange(categoria.key as keyof DuracionConfig, e.target.value)}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">segundos</span>
                  </div>
                </div>
              </div>
              {index < CATEGORIAS.length - 1 && <Separator />}
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  Tienes cambios sin guardar
                </span>
              ) : (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Configuración guardada
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleReset} disabled={saving}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-none">
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Rango de Duración</h4>
              <p className="text-sm text-muted-foreground">
                Las duraciones pueden variar entre 1 y 30 segundos. Se recomienda usar duraciones más largas para contenido informativo y más cortas para precios.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Funcionamiento Offline</h4>
              <p className="text-sm text-muted-foreground">
                Los cambios se guardan localmente y funcionan sin conexión. Se sincronizarán con la base de datos cuando haya conexión.
              </p>
            </div>
          </div>
          
          {!isOnline && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <h4 className="font-medium text-orange-800 mb-2">Modo Offline</h4>
              <p className="text-sm text-orange-700">
                No hay conexión a internet. Los cambios se guardarán localmente y se sincronizarán cuando vuelva la conexión.
              </p>
            </div>
          )}
          
          {dbStatus === 'error' && isOnline && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-medium text-red-800 mb-2">Problema de Conexión</h4>
              <p className="text-sm text-red-700">
                No se pudo conectar con la base de datos. Esto puede deberse a:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>La tabla <code>configuracion_duraciones</code> no existe en Supabase</li>
                <li>Problemas de conectividad con la base de datos</li>
                <li>Configuración incorrecta de las credenciales</li>
              </ul>
              <p className="text-sm text-red-700 mt-2">
                Ejecuta el SQL en <code>sql/create_configuracion_duraciones.sql</code> en tu base de datos Supabase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 