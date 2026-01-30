"use client"

import * as React from "react"
import {
  Tv,
  Users,
  Clapperboard,
  House,
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Resumen General",
          url: "/dashboard/resumen",
        },
        {
          title: "Estadisticas",
          url: "#",
        },
        {
          title: "Actividad Reciente",
          url: "#",
        },
      ],
    },
    {
      title: "Contenido",
      url: "#",
      icon: Clapperboard,
      items: [
        {
          title: "Videos",
          url: "#",
        },
        {
          title: "Imagenes",
          url: "#",
        },
        {
          title: "Plantillas",
          url: "#",
        },
        {
          title: "Biblioteca",
          url: "#",
        },
        {
          title: "Upload",
          url: "/upload",
        },
      ],
    },
    { title: "Pantallas",
    url: "#",
    icon: Tv,
    items: [
      {
        title: "Duraciones",
        url: "/configuracion/duraciones",
      },
      {
        title: "Estado General",
        url: "#",
      },
      {
        title: "Configuracion",
        url: "#",
      },
      {
        title: "Mantenimiento",
        url: "#",
      },
    ],
  },
    {
      title: "Grupos",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Ciudades",
          url: "#",
        },
        {
          title: "Tiendas",
          url: "/grupos/tiendas",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Cosechas</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
