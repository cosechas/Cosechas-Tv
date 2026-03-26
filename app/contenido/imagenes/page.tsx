"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Search, CloudUpload, Download, Trash2, Eye, Filter, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { getCiudades } from "@/lib/database"
import type { Ciudad } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ── Helpers ─────────────────────────────────────────────────────
function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(d?: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

interface ImageItem {
  id: string
  titulo: string
  cloudinary_url: string
  cloudinary_public_id?: string
  created_at: string
  grupo_id?: string
  categoria?: string
  estado?: string
  file_size?: number
  formato?: string
}

// ── Page ─────────────────────────────────────────────────────────
export default function ImagenesPage() {
  const [imagenes, setImagenes]         = useState<ImageItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [searchQuery, setSearchQuery]   = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [ciudadesMap, setCiudadesMap]   = useState<Record<string, string>>({})
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<ImageItem | null>(null)
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null)
  const [fileSizes, setFileSizes]       = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from("contenidos").select("*").order("created_at", { ascending: false })
      if (!error && data) {
        setImagenes(data as ImageItem[])
        const missing = (data as ImageItem[]).filter(i => !i.file_size && i.cloudinary_url)
        if (missing.length) fetchMissingSizes(missing)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function fetchMissingSizes(imgs: ImageItem[]) {
    const results: Record<string, number> = {}
    await Promise.allSettled(imgs.map(async img => {
      try {
        const r = await fetch(img.cloudinary_url, { method: "HEAD" })
        const l = r.headers.get("content-length")
        if (l) results[img.id] = parseInt(l, 10)
      } catch { /* ignore */ }
    }))
    setFileSizes(p => ({ ...p, ...results }))
  }

  function resolveSize(img: ImageItem) { return img.file_size ?? fileSizes[img.id] }

  useEffect(() => {
    getCiudades().then((data: Ciudad[]) => {
      const m: Record<string, string> = {}
      data.forEach(c => { m[c.id] = c.nombre })
      setCiudadesMap(m)
    })
  }, [])

  const filteredImagenes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return imagenes.filter(img => {
      const mQ = !q || img.titulo?.toLowerCase().includes(q)
      const mC = categoryFilter === "all" || (img.categoria || "").toLowerCase() === categoryFilter
      return mQ && mC
    })
  }, [imagenes, searchQuery, categoryFilter])

  const handleDelete = useCallback(async (img: ImageItem) => {
    setDeletingId(img.id)
    const { error } = await supabase.from("contenidos").delete().eq("id", img.id)
    if (img.cloudinary_public_id) {
      await fetch("/api/contenidos/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: img.cloudinary_public_id }),
      })
    }
    if (!error) { setImagenes(p => p.filter(i => i.id !== img.id)); toast.success("Imagen eliminada") }
    else toast.error("Error al eliminar la imagen")
    setDeletingId(null)
    setImageToDelete(null)
  }, [])

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
                  <BreadcrumbLink href="/dashboard/resumen">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Contenido</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem><BreadcrumbPage>Imágenes</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="flex flex-1 flex-col gap-6 p-6 pt-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Imágenes</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {loading ? "Cargando..." : `${filteredImagenes.length} imágenes en total`}
                </p>
              </div>
              <Button className="gap-2 w-fit" asChild>
                <Link href="/upload"><CloudUpload className="h-4 w-4" />Subir Imágenes</Link>
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-imagenes" placeholder="Buscar imágenes..." className="pl-9"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]" id="filter-categoria">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="publicidad">Publicidad</SelectItem>
                  <SelectItem value="precios">Precios</SelectItem>
                  <SelectItem value="promociones">Promociones</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-3.5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <Separator className="my-2" />
                      <div className="h-3 bg-muted rounded w-1/4 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredImagenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="rounded-full bg-muted p-6">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-base">No se encontraron imágenes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery || categoryFilter !== "all" ? "Prueba con otros filtros" : "Sube tu primera imagen"}
                  </p>
                </div>
                <Button variant="outline" asChild><Link href="/upload">Subir imagen</Link></Button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {filteredImagenes.map(img => (
                  <ImageCard
                    key={img.id} img={img} resolvedSize={resolveSize(img)}
                    ciudadesMap={ciudadesMap} deletingId={deletingId}
                    imageToDelete={imageToDelete} setImageToDelete={setImageToDelete}
                    onPreview={() => setPreviewImage(img)} onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SidebarInset>

      {/* Lightbox */}
      <Dialog open={!!previewImage} onOpenChange={open => { if (!open) setPreviewImage(null) }}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewImage?.titulo}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex flex-col">
              <LightboxZoomImage
                src={previewImage.cloudinary_url || "/placeholder.svg"}
                alt={previewImage.titulo}
              />
              <div className="p-4 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-base truncate">{previewImage.titulo}</p>
                  <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                    {formatBytes(resolveSize(previewImage))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{formatDate(previewImage.created_at)}</p>
                {previewImage.grupo_id && ciudadesMap[previewImage.grupo_id] && (
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/60 mt-2">
                    {ciudadesMap[previewImage.grupo_id]}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

// ── Image Card ──────────────────────────────────────────────────
interface ImageCardProps {
  img: ImageItem; resolvedSize?: number; ciudadesMap: Record<string, string>
  deletingId: string | null; imageToDelete: ImageItem | null
  setImageToDelete: (img: ImageItem | null) => void
  onPreview: () => void; onDelete: (img: ImageItem) => void
}

function ImageCard({ img, resolvedSize, ciudadesMap, deletingId, imageToDelete, setImageToDelete, onPreview, onDelete }: ImageCardProps) {
  const regionName = img.grupo_id ? (ciudadesMap[img.grupo_id] || "") : ""
  return (
    <div className="group rounded-xl border-0 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative w-full cursor-pointer overflow-hidden" style={{ aspectRatio: "16/9" }} onClick={onPreview}>
        <Image src={img.cloudinary_url || "/placeholder.svg"} alt={img.titulo} fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-10">
          <button onClick={e => { e.stopPropagation(); onPreview() }} className="rounded-full bg-white/90 p-2 text-foreground hover:bg-white transition-colors" title="Ver imagen">
            <Eye className="h-4 w-4" />
          </button>
          <a href={img.cloudinary_url?.replace("/upload/", `/upload/fl_attachment:${encodeURIComponent(img.titulo || "imagen")}/`)}
            download={img.titulo || "imagen"} onClick={e => e.stopPropagation()}
            className="rounded-full bg-white/90 p-2 text-foreground hover:bg-white transition-colors" title="Descargar">
            <Download className="h-4 w-4" />
          </a>
          <button onClick={e => { e.stopPropagation(); setImageToDelete(img) }} className="rounded-full bg-white/90 p-2 text-red-600 hover:bg-white transition-colors" title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Gradient fade at bottom — prevents white images from blending into card */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[5]"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.13))",
          }}
        />
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug line-clamp-1 flex-1">{img.titulo || "Sin título"}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {resolvedSize !== undefined ? formatBytes(resolvedSize) : <span className="inline-block w-8 h-3 bg-muted rounded animate-pulse" />}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(img.created_at)}</p>
        <Separator className="my-2" />
        <p className="text-xs font-bold uppercase tracking-widest text-center text-foreground/60">{regionName || "—"}</p>
      </div>
      <AlertDialog open={imageToDelete?.id === img.id} onOpenChange={open => { if (!open) setImageToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImageToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await onDelete(img) }} disabled={deletingId === img.id} className="bg-red-600 hover:bg-red-700">
              {deletingId === img.id ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── LightboxZoomImage ────────────────────────────────────────────
// Panel de zoom LIBRE: sigue el cursor pixel a pixel sin saltos.
// Se posiciona a la derecha del cursor si hay espacio, si no va
// a la izquierda. Verticalmente se centra en el cursor.
// Todo calculado en px del contenedor en cada mousemove.
// ────────────────────────────────────────────────────────────────
const ZOOM_SCALE = 4.5   // multiplicador de zoom
const PANEL_W    = 360   // ancho del panel de zoom  (px del contenedor)
const PANEL_H    = 275   // alto del panel de zoom   (px del contenedor)
const LENS_GAP   = 16    // espacio entre borde de lente y panel

interface LightboxZoomImageProps {
  src: string
  alt: string
}

function LightboxZoomImage({ src, alt }: LightboxZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [mouse, setMouse] = useState({
    active: false,
    px: 0,      // posición del cursor en px dentro del contenedor
    py: 0,
    xPct: 0.5,  // fracción 0-1 para background-position
    yPct: 0.5,
    cW: 1,      // ancho del contenedor en px (actualizado en cada move)
    cH: 1,
  })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    setMouse({
      active: true,
      px,
      py,
      xPct: Math.max(0, Math.min(1, px / r.width)),
      yPct: Math.max(0, Math.min(1, py / r.height)),
      cW: r.width,
      cH: r.height,
    })
  }

  function onMouseLeave() {
    setMouse(s => ({ ...s, active: false }))
  }

  // Tamaño del recuadro de lente en px (1/escala del contenedor)
  const lensW = mouse.cW / ZOOM_SCALE
  const lensH = mouse.cH / ZOOM_SCALE

  // Posición del panel — calculada en cada render a partir del mouse
  let panelX = 0
  let panelY = 0
  if (mouse.active) {
    // Horizontal: derecha del cursor → si no cabe, izquierda
    const tryRight = mouse.px + lensW / 2 + LENS_GAP
    panelX = tryRight + PANEL_W <= mouse.cW
      ? tryRight
      : mouse.px - lensW / 2 - LENS_GAP - PANEL_W
    panelX = Math.max(0, Math.min(mouse.cW - PANEL_W, panelX))

    // Vertical: centrado en el cursor, clampeado
    panelY = mouse.py - PANEL_H / 2
    panelY = Math.max(0, Math.min(mouse.cH - PANEL_H, panelY))
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden select-none"
      style={{ aspectRatio: "16/9", cursor: mouse.active ? "crosshair" : "zoom-in" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Imagen base */}
      <Image src={src} alt={alt} fill className="object-contain"
        sizes="(max-width: 768px) 100vw, 800px" priority />

      {/* Lente — recuadro que sigue el cursor */}
      {mouse.active && (
        <div
          className="pointer-events-none absolute z-20 border-2 border-white/90"
          style={{
            width:     lensW,
            height:    lensH,
            left:      mouse.px,
            top:       mouse.py,
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255,255,255,0.18)",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.40)",
          }}
        />
      )}

      {/* Panel de zoom — libre, sigue el cursor sin saltos */}
      {mouse.active && (
        <div
          className="pointer-events-none absolute z-30 rounded-lg overflow-hidden border border-white/20 shadow-2xl"
          style={{
            width:              PANEL_W,
            height:             PANEL_H,
            left:               panelX,
            top:                panelY,
            backgroundImage:    `url(${src})`,
            backgroundSize:     `${ZOOM_SCALE * 200}%`,
            backgroundPosition: `${mouse.xPct * 100}% ${mouse.yPct * 100}%`,
            backgroundRepeat:   "no-repeat",
            backgroundColor:    "black",
          }}
        >
          <span className="absolute bottom-1 right-2 text-[11px] font-bold text-white tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {ZOOM_SCALE}&times;
          </span>
        </div>
      )}

      {/* Hint en reposo */}
      {!mouse.active && (
        <div className="absolute bottom-2 right-3 pointer-events-none">
          <span className="text-[10px] text-white/50 bg-black/50 rounded px-1.5 py-0.5 backdrop-blur-sm">
            Pasa el cursor para ampliar
          </span>
        </div>
      )}
    </div>
  )
}
