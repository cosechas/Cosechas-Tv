"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"

export default function NotFound() {
  const [comingSoonDialog, setComingSoonDialog] = useState<{
    isOpen: boolean
    featureName: string
  }>({
    isOpen: false,
    featureName: ""
  })

  const implementedRoutes = [
    "/dashboard",
    "/dashboard/resumen",
    "/dashboard/estadisticas", 
    "/dashboard/actividad",
    "/grupos/ciudades",
    "/grupos/tiendas",
    "/configuracion/general",
    "/configuracion/duraciones",
    "/upload",
    "/test-conexion",
    "/debug",
    "/diagnostico",
    "/auth",
    "/cloudinary/test-upload",
    "/cloudinary/validate",
    "/seleccion-perfil",
    "/seleccion-pantalla",
    "/reproductor",
    "/seed-ciudades"
  ]

  useEffect(() => {
    const currentPath = window.location.pathname
    
    const possibleFeatures = [
      { path: "/contenido", name: "Gestión de Contenido" },
      { path: "/pantallas", name: "Gestión de Pantallas" },
      { path: "/programacion", name: "Programación" },
      { path: "/reportes", name: "Reportes y Analytics" },
      { path: "/videos", name: "Gestión de Videos" },
      { path: "/imagenes", name: "Gestión de Imágenes" },
      { path: "/plantillas", name: "Plantillas" },
      { path: "/biblioteca", name: "Biblioteca" },
      { path: "/campanas", name: "Campañas" },
      { path: "/eventos", name: "Eventos" },
      { path: "/audiencia", name: "Reportes de Audiencia" },
      { path: "/rendimiento", name: "Reportes de Rendimiento" },
      { path: "/usuarios", name: "Gestión de Usuarios" },
      { path: "/permisos", name: "Gestión de Permisos" },
      { path: "/integracion", name: "Configuración de Integración" }
    ]

    const matchingFeature = possibleFeatures.find(feature => 
      currentPath.startsWith(feature.path)
    )

    if (matchingFeature && !implementedRoutes.includes(currentPath)) {
      // Mostrar diálogo de "próximamente" automáticamente
      setComingSoonDialog({
        isOpen: true,
        featureName: matchingFeature.name
      })
    }
  }, [])

  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = "/dashboard"
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Página no encontrada
            </CardTitle>
            <CardDescription>
              La página que buscas no existe o aún no está disponible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Es posible que esta función esté en desarrollo y esté disponible en una versión futura.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGoBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button onClick={handleGoHome} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ComingSoonDialog
        isOpen={comingSoonDialog.isOpen}
        onClose={() => setComingSoonDialog({ isOpen: false, featureName: "" })}
        featureName={comingSoonDialog.featureName}
      />
    </>
  )
} 