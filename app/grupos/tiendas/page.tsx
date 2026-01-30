import { AppSidebar } from "@/components/app-sidebar"
import { TiendasDashboard } from "@/components/tiendas-dashboard"
import { ValidacionSimple } from "@/components/validacion-simple"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TiendasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/grupos">Grupos</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tiendas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4  pt-0">
          <div className="mx-auto scroll-smooth w-full max-w-screen-xl px-3 lg:px-10 mt-3 md:mt-6 md:py-3 duration-500 animate-in fade-in-5 slide-in-from-bottom-2">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiendas</h1>
              <p className="text-muted-foreground">
                Administra todas las tiendas del sistema. Visualiza información detallada, gestiona ubicaciones y
                controla el estado de las pantallas conectadas.
              </p>
            </div>

            <Tabs defaultValue="dashboard" className="w-full mt-4">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="validacion">Validar Conexión</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="space-y-6">
                <TiendasDashboard />
              </TabsContent>
              <TabsContent value="validacion" className="space-y-6">
                <ValidacionSimple />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
