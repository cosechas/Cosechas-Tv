"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Monitor, Bell, Shield } from "lucide-react"
import { useState, useEffect } from "react"

export default function ConfiguracionGeneralPage() {
  const [autoFullscreen, setAutoFullscreen] = useState(false)

  useEffect(() => {
    const savedAutoFullscreen = localStorage.getItem('autoFullscreen')
    if (savedAutoFullscreen !== null) {
      setAutoFullscreen(savedAutoFullscreen === 'true')
    }
  }, [])

  const handleAutoFullscreenChange = (checked: boolean) => {
    setAutoFullscreen(checked)
    localStorage.setItem('autoFullscreen', checked.toString())
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración General</h1>
        <p className="text-muted-foreground">
          Configura los ajustes generales del sistema.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración del Sistema
            </CardTitle>
            <CardDescription>
              Ajustes básicos del sistema y comportamiento general.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre-sistema">Nombre del Sistema</Label>
                <Input id="nombre-sistema" placeholder="Cosechas Screen Hub" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zona-horaria">Zona Horaria</Label>
                <Input id="zona-horaria" placeholder="America/Asuncion" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Prueba</Label>
                <p className="text-sm text-muted-foreground">
                  Activa el modo de prueba para desarrollo
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Configuración de Pantallas
            </CardTitle>
            <CardDescription>
              Configuración específica para las pantallas de TV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-fullscreen"
                  checked={autoFullscreen}
                  onCheckedChange={handleAutoFullscreenChange}
                />
                <Label htmlFor="auto-fullscreen">Auto-pantalla completa</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Entrar automáticamente en pantalla completa al cargar el reproductor
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Actualización automática</Label>
                <p className="text-sm text-muted-foreground">
                  Recargar contenido automáticamente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las notificaciones del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones por correo electrónico
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones sobre el estado del sistema
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Configuración de seguridad y privacidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de dos factores</Label>
                <p className="text-sm text-muted-foreground">
                  Requerir 2FA para todos los usuarios
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de actividad</Label>
                <p className="text-sm text-muted-foreground">
                  Mantener registro de todas las actividades
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  )
} 