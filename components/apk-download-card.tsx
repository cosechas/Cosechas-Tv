"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Reemplaza con la URL real de descarga del APK
const APK_URL = "/downloads/cosechas-tv-v1.1.2.apk"

export function ApkDownloadCard() {
  return (
    <div className="mx-3 mb-2 rounded-xl border border-border/60 bg-sidebar-accent/40 p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
          App para Televisores
        </p>
        <p className="text-xs text-sidebar-foreground/60 leading-snug">
          Escanea el QR o descarga el APK directamente.
        </p>
      </div>

      {/* QR Code - coloca tu SVG en public/qr-app.svg */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-2 shadow-inner border border-border/30 inline-block">
          <img
            src="/qr-app.svg"
            alt="QR Cosechas TV APK"
            width={100}
            height={100}
            className="rounded block"
          />
        </div>
      </div>

      {/* Versión */}
      <p className="text-center text-[10px] text-sidebar-foreground/50 font-mono tracking-wide">
        COSECHAS TV · v1.1.2
      </p>

      {/* Botón de descarga */}
      <Button asChild size="sm" className="w-full h-9 gap-2 text-xs font-semibold rounded-lg">
        <a href={APK_URL} download="cosechas-tv-v1.1.2.apk">
          <Download className="h-3.5 w-3.5" />
          Descargar APK
        </a>
      </Button>
    </div>
  )
}
