"use client"

import { useEffect, useState } from "react"
import { MapPin, Building, Plus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCiudades, getTiendasPorCiudad } from "@/lib/database"
import type { Ciudad, Tienda } from "@/lib/supabase"
import { AgregarTiendaDialog } from "./agregar-tienda-dialog"

export function CiudadesAccordion() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [tiendasPorCiudad, setTiendasPorCiudad] = useState<Record<string, Tienda[]>>({})
  const [loading, setLoading] = useState(true)
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  useEffect(() => {
    async function cargarCiudades() {
      try {
        const data = await getCiudades()
        setCiudades(data)
      } catch (error) {
        console.error("Error al cargar ciudades:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCiudades()
  }, [])

  const cargarTiendas = async (ciudadId: string) => {
    if (tiendasPorCiudad[ciudadId]) return

    try {
      const tiendas = await getTiendasPorCiudad(ciudadId)
      setTiendasPorCiudad((prev) => ({
        ...prev,
        [ciudadId]: tiendas,
      }))
    } catch (error) {
      console.error("Error al cargar tiendas:", error)
    }
  }

  const handleAgregarTienda = (ciudadId: string) => {
    setCiudadSeleccionada(ciudadId)
    setDialogAbierto(true)
  }

  const handleTiendaAgregada = (nuevaTienda: Tienda) => {
    if (nuevaTienda.ciudad_id) {
      setTiendasPorCiudad((prev) => ({
        ...prev,
        [nuevaTienda.ciudad_id]: [...(prev[nuevaTienda.ciudad_id] || []), nuevaTienda],
      }))
    }
    setDialogAbierto(false)
    setCiudadSeleccionada(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ciudades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ciudades y Tiendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {ciudades.map((ciudad) => (
              <AccordionItem key={ciudad.id} value={ciudad.id}>
                <AccordionTrigger className="hover:no-underline" onClick={() => cargarTiendas(ciudad.id)}>
                  <div className="flex items-center justify-between w-full mr-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{ciudad.nombre}</span>
                    </div>
                    <Badge variant="secondary">{tiendasPorCiudad[ciudad.id]?.length || 0} tiendas</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-muted-foreground">Tiendas en {ciudad.nombre}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAgregarTienda(ciudad.id)}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>

                    {tiendasPorCiudad[ciudad.id]?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay tiendas registradas en esta ciudad
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tiendasPorCiudad[ciudad.id]?.map((tienda) => (
                          <div
                            key={tienda.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{tienda.nombre}</p>
                                <p className="text-xs text-muted-foreground">Código: {tienda.codigo}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {tienda.pantallas_conectadas} pantallas
                              </Badge>
                              <Badge variant={tienda.activa ? "default" : "secondary"} className="text-xs">
                                {tienda.activa ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <AgregarTiendaDialog
        abierto={dialogAbierto}
        onClose={() => {
          setDialogAbierto(false)
          setCiudadSeleccionada(null)
        }}
        ciudadId={ciudadSeleccionada}
        onTiendaAgregada={handleTiendaAgregada}
      />
    </>
  )
}
