import { AppSidebar } from "@/components/app-sidebar"
import { DebugSupabase } from "@/components/debug-supabase"
import { ThemeStatus } from "@/components/theme-status"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DebugPage() {
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Debug</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Debug de Conexión</h1>
              <p className="text-muted-foreground">
                Herramientas para diagnosticar problemas de conexión con Supabase.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Estado del Tema</CardTitle>
                  <CardDescription>
                    Información sobre el tema actual de la aplicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeStatus />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Debug de Supabase</CardTitle>
                  <CardDescription>
                    Diagnóstico de la conexión con la base de datos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DebugSupabase />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
