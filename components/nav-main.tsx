"use client"

import { useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"

// Lista de rutas que están implementadas
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

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
      isActive?: boolean
    }[]
  }[]
}) {
  const [comingSoonDialog, setComingSoonDialog] = useState<{
    isOpen: boolean
    featureName: string
  }>({
    isOpen: false,
    featureName: ""
  })

  const handleNavigation = (url: string, title: string) => {
    // Verificar si la ruta está implementada
    if (implementedRoutes.includes(url)) {
      // Navegar normalmente
      window.location.href = url
    } else {
      // Mostrar diálogo de "próximamente"
      setComingSoonDialog({
        isOpen: true,
        featureName: title
      })
    }
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    onClick={(e) => {
                      // Si el elemento no tiene sub-items, manejar la navegación directamente
                      if (!item.items || item.items.length === 0) {
                        e.preventDefault()
                        handleNavigation(item.url, item.title)
                      }
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild 
                          isActive={subItem.isActive}
                          onClick={(e) => {
                            e.preventDefault()
                            handleNavigation(subItem.url, subItem.title)
                          }}
                        >
                          <a href={subItem.url}>
                            {subItem.icon && <subItem.icon className="h-3 w-3 mr-1" />}
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <ComingSoonDialog
        isOpen={comingSoonDialog.isOpen}
        onClose={() => setComingSoonDialog({ isOpen: false, featureName: "" })}
        featureName={comingSoonDialog.featureName}
      />
    </>
  )
}
