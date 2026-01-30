"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ScrollAreaExample() {
  return (
    <div className="space-y-6">
      {/* ScrollArea Vertical */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollArea Vertical</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Item {i + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Descripción del item {i + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ScrollArea Horizontal */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollArea Horizontal</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="shrink-0">
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">Item {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ScrollArea con contenido mixto */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollArea con Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 w-full rounded-md border p-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <Badge key={i} variant={i % 3 === 0 ? "default" : "secondary"}>
                    Badge {i + 1}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Lista de elementos</h4>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm">Elemento {i + 1}</span>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
