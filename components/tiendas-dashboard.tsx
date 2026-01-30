"use client"

import { useEffect, useState } from "react"
import {
  Building,
  MapPin,
  Monitor,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  Grid3X3,
  Table,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getTiendas, getCiudades, eliminarTienda, registrarActividad, verificarConexion } from "@/lib/database"
import type { Tienda, Ciudad } from "@/lib/supabase"
import { AgregarTiendaDialog } from "./agregar-tienda-dialog"
import { EditarTiendaDialog } from "./editar-tienda-dialog"
import { TiendasTabla } from "./tiendas-tabla"

// Funciones para colores de estado consistentes
const getStatusColor = (activa: boolean) => {
  return activa ? "bg-green-500" : "bg-gray-500"
}

const getStatusText = (activa: boolean) => {
  return activa ? "Activa" : "Inactiva"
}

export function TiendasDashboard() {
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conexionEstado, setConexionEstado] = useState<"checking" | "connected" | "error">("checking")
  const [filtroTexto, setFiltroTexto] = useState("")
  const [filtroCiudad, setFiltroCiudad] = useState<string>("all")
  const [dialogAgregarAbierto, setDialogAgregarAbierto] = useState(false)
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false)
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<Tienda | null>(null)
  const [vistaActual, setVistaActual] = useState<"grid" | "table">("grid")
  const [cargando, setCargando] = useState(false)

  const verificarEstadoConexion = async () => {
    setConexionEstado("checking")

    try {
      const conexionOk = await verificarConexion()
      setConexionEstado(conexionOk ? "connected" : "error")
      return conexionOk
    } catch (error) {
      console.error("Error al verificar conexión:", error)
      setConexionEstado("error")
      return false
    }
  }

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    setCargando(true)

    try {
      // Verificar conexión primero
      const conexionOk = await verificarEstadoConexion()

      if (!conexionOk) {
        throw new Error(
          "No se pudo establecer conexión con la base de datos. Posibles causas:\n" +
            "• Variables de entorno no configuradas\n" +
            "• URL de Supabase incorrecta\n" +
            "• Clave de API inválida\n" +
            "• Proyecto de Supabase inactivo\n" +
            "• Problemas de conectividad",
        )
      }

      // Cargar datos con timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: La consulta tardó demasiado")), 10000),
      )

      const [tiendasData, ciudadesData] = (await Promise.race([
        Promise.all([
          getTiendas().catch((err) => {
            console.error("Error al cargar tiendas:", err)
            throw new Error("No se pudieron cargar las tiendas: " + (err.message || "Error desconocido"))
          }),
          getCiudades().catch((err) => {
            console.error("Error al cargar ciudades:", err)
            throw new Error("No se pudieron cargar las ciudades: " + (err.message || "Error desconocido"))
          }),
        ]),
        timeoutPromise,
      ])) as [Tienda[], Ciudad[]]

      setTiendas(tiendasData)
      setCiudades(ciudadesData)
      setConexionEstado("connected")

      // Limpiar error si todo salió bien
      setError(null)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al cargar datos"
      setError(errorMessage)
      setConexionEstado("error")


      // Usar datos de prueba en desarrollo si hay error
      if (process.env.NODE_ENV === "development") {
        console.log("🔧 Modo desarrollo: Usando datos de prueba")
        setTiendas([
          {
            id: "dev-1",
            nombre: "Tienda Demo 1",
            codigo: "DEMO1",
            ciudad_id: "dev-ciudad-1",
            tipo_tienda: "Local",
            activa: true,
            pantallas_conectadas: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ciudades: {
              id: "dev-ciudad-1",
              nombre: "Ciudad Demo 1",
              codigo: "DEMO1",
              activa: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
          {
            id: "dev-2",
            nombre: "Tienda Demo 2",
            codigo: "DEMO2",
            ciudad_id: "dev-ciudad-2",
            tipo_tienda: "Burbuja",
            activa: false,
            pantallas_conectadas: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ciudades: {
              id: "dev-ciudad-2",
              nombre: "Ciudad Demo 2",
              codigo: "DEMO2",
              activa: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ])
        setCiudades([
          {
            id: "dev-ciudad-1",
            nombre: "Ciudad Demo 1",
            codigo: "DEMO1",
            activa: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "dev-ciudad-2",
            nombre: "Ciudad Demo 2",
            codigo: "DEMO2",
            activa: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      }
    } finally {
      setLoading(false)
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const tiendasFiltradas = tiendas.filter((tienda) => {
    const coincideTexto =
      tienda.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      tienda.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
    const coincideCiudad = filtroCiudad === "all" || tienda.ciudad_id === filtroCiudad
    return coincideTexto && coincideCiudad
  })

  const handleTiendaAgregada = (nuevaTienda: Tienda) => {
    setTiendas((prev) => [...prev, nuevaTienda])
    setDialogAgregarAbierto(false)
  }

  const handleTiendaActualizada = (tiendaActualizada: Tienda) => {
    setTiendas((prev) => prev.map((t) => (t.id === tiendaActualizada.id ? tiendaActualizada : t)))
    setDialogEditarAbierto(false)
    setTiendaSeleccionada(null)
  }

  const handleTiendaEliminada = (tiendaId: string) => {
    setTiendas((prev) => prev.filter((t) => t.id !== tiendaId))
  }

  const handleEditarTienda = (tienda: Tienda) => {
    setTiendaSeleccionada(tienda)
    setDialogEditarAbierto(true)
  }

  const handleEliminarTienda = async (tienda: Tienda) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la tienda "${tienda.nombre}"?`)) {
      return
    }

    try {
      await eliminarTienda(tienda.id)

      // Registrar actividad
      await registrarActividad({
        tipo: "tienda_eliminada",
        descripcion: `Tienda eliminada: ${tienda.nombre}`,
        tienda_id: tienda.id,
        ciudad_id: tienda.ciudad_id,
      })

      handleTiendaEliminada(tienda.id)

    } catch (error) {
      console.error("Error al eliminar tienda:", error)
    }
  }

  // Calcular estadísticas
  const totalPantallas = tiendas.reduce((sum, tienda) => sum + tienda.pantallas_conectadas, 0)
  const tiendasActivas = tiendas.filter((tienda) => tienda.activa).length
  const promedioPantallas = tiendas.length > 0 ? Math.round(totalPantallas / tiendas.length) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-none">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main >
      <div className="space-y-6">
        {/* Estado de conexión */}
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {conexionEstado === "checking" && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                {conexionEstado === "connected" && <Wifi className="h-4 w-4 text-green-500" />}
                {conexionEstado === "error" && <WifiOff className="h-4 w-4 text-red-500" />}
                <span className="font-medium">
                  Estado de conexión: {conexionEstado === "checking" && "Verificando..."}
                  {conexionEstado === "connected" && "Conectado"}
                  {conexionEstado === "error" && "Sin conexión"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cargarDatos}
                disabled={cargando}
                className="flex items-center gap-2"
              >
                {cargando ? "Conectando..." : "Reintentar"}
                <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de error detallado */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión con la base de datos</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <div className="mt-4 p-3 bg-destructive/10 rounded border">
                <p className="text-sm font-medium mb-2">Pasos para solucionar:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Verifica que las variables de entorno estén configuradas en .env.local</li>
                  <li>Confirma que NEXT_PUBLIC_SUPABASE_URL sea correcta</li>
                  <li>Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY sea válida</li>
                  <li>Asegúrate de que tu proyecto de Supabase esté activo</li>
                  <li>Revisa que las tablas 'ciudades' y 'tiendas' existan</li>
                  <li>Confirma que RLS esté configurado correctamente</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas generales */}
        <div className="grid gap-4 md:grid-cols-4 ">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tiendas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{tiendas.length}</div>
              <p className="text-xs text-muted-foreground">{tiendasActivas} activas</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pantallas</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPantallas}</div>
              <p className="text-xs text-muted-foreground">Pantallas conectadas</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promedioPantallas}</div>
              <p className="text-xs text-muted-foreground">Pantallas por tienda</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ciudades</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ciudades.length}</div>
              <p className="text-xs text-muted-foreground">Con presencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Controles y filtros */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-none">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Buscar tiendas..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filtroCiudad} onValueChange={setFiltroCiudad}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {ciudades.map((ciudad) => (
                  <SelectItem key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón Exportar antes de Agregar Tienda */}
            <Button variant="outline" onClick={() => {
              // Prepara los datos para exportar
              const data = tiendasFiltradas.map((t) => ({
                Nombre: t.nombre,
                Código: t.codigo,
                Tipo: t.tipo_tienda,
                "Razón social": t.razon_social || "",
                "NIT/C.C": t.nit_cc || "",
                Ciudad: t.ciudades?.nombre || "",
                Teléfono: t.telefono || "",
                Correo: t.email || "",
                Pantallas: t.pantallas_conectadas,
                Estado: t.activa ? "Activa" : "Inactiva",
                "Fecha Creación": new Date(t.created_at).toLocaleDateString(),
              }));
              const XLSX = require("xlsx");
              const ws = XLSX.utils.json_to_sheet(data);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Tiendas");
              XLSX.writeFile(wb, "tiendas.xlsx");
            }} disabled={tiendasFiltradas.length === 0}>
              Exportar
            </Button>
            <Button
              onClick={() => setDialogAgregarAbierto(true)}
              className="gap-2"
              disabled={conexionEstado !== "connected"}
            >
              <Plus className="h-4 w-4" />
              Agregar Tienda
            </Button>
          </div>
        </div>

        {/* Solo vista tabla */}
        <TiendasTabla
          tiendas={tiendasFiltradas}
          onTiendaActualizada={handleTiendaActualizada}
          onTiendaEliminada={handleTiendaEliminada}
        />
      </div>

      <AgregarTiendaDialog
        abierto={dialogAgregarAbierto}
        onClose={() => setDialogAgregarAbierto(false)}
        ciudadId={null}
        onTiendaAgregada={handleTiendaAgregada}
      />

      <EditarTiendaDialog
        abierto={dialogEditarAbierto}
        onClose={() => {
          setDialogEditarAbierto(false)
          setTiendaSeleccionada(null)
        }}
        tienda={tiendaSeleccionada}
        onTiendaActualizada={handleTiendaActualizada}
      />
    </main>
  )
}
