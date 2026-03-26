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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/avatar-group"
import { cn } from "@/lib/utils"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Tv,
  Play,
  CloudUpload,
  Upload,
  Search,
  MoreVertical,
  Monitor,
  Calendar,
  Clock,
  Eye,
  Download,
  Trash2,
  Edit,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Box,
  View,
  X,
  RotateCcw,
  RotateCw,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { getCiudades, getTiendasPorCiudad } from "@/lib/database"
import { Tienda } from "@/lib/supabase"
import type { Ciudad } from "@/lib/supabase"
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import Comp547 from "@/components/comp-547"
import { ChartRadialText } from "@/components/ui/chart-radial-text"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "scheduled":
      return "bg-blue-500"
    case "inactive":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Activo"
    case "scheduled":
      return "Programado"
    case "inactive":
      return "Inactivo"
    default:
      return "Desconocido"
  }
}

function groupByZona(videos: any[]): Record<string, any[]> {
  return videos.reduce((acc: Record<string, any[]>, video: any) => {
    const zona = video.grupo_id || "Sin zona";
    if (!acc[zona]) acc[zona] = [];
    acc[zona].push(video);
    return acc;
  }, {});
}

async function rotateImageFile(imageUrl: string, direction: 'left' | 'right', fileName: string, fileType: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");

      const angle = direction === 'right' ? 90 : -90;
      
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (!blob) return reject("Error al generar imagen rotada");
        resolve(new File([blob], fileName, { type: fileType || "image/jpeg" }));
      }, fileType || "image/jpeg", 1.0);
    };
    img.onerror = () => reject("Error de CORS al cargar la imagen para rotar.");
    
    // Add timestamp to bypass browser cache
    img.src = imageUrl.includes("?") ? `${imageUrl}&t=${Date.now()}` : `${imageUrl}?t=${Date.now()}`;
  });
}

export default function ResumenPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [slideIndexes, setSlideIndexes] = useState<{ [zona: string]: number }>({});
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesMap, setCiudadesMap] = useState<Record<string, string>>({});
  const [reproduccionesPorZona, setReproduccionesPorZona] = useState<Record<string, number>>({});
  const [totalReproduccionesHoy, setTotalReproduccionesHoy] = useState(0);
  const [ciclosPorZona, setCiclosPorZona] = useState<Record<string, number>>({});
  const [totalCiclos, setTotalCiclos] = useState(0);
  const [videoToDelete, setVideoToDelete] = useState<any | null>(null);
  const [duracionesConfig, setDuracionesConfig] = useState<Record<string, number>>({});
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);
  const [avatarSheetZoneId, setAvatarSheetZoneId] = useState<string | null>(null);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (avatarSheetZoneId) {
      getTiendasPorCiudad(avatarSheetZoneId).then(setTiendas).catch(console.error);
    } else {
      setTiendas([]);
    }
  }, [avatarSheetZoneId]);

  const mockUsers = [
    { id: "1", name: "Juan Pérez", email: "juan@cosechas.com", avatar: "/images/zonas/antioquia.png" },
    { id: "2", name: "María García", email: "maria@cosechas.com", avatar: "/images/zonas/cordoba.png" },
    { id: "3", name: "Carlos López", email: "carlos@cosechas.com", avatar: "/images/zonas/cundinamarca.png" },
    { id: "4", name: "Ana Rodríguez", email: "ana@cosechas.com", avatar: "/placeholder-user.jpg" },
    { id: "5", name: "Luis Martínez", email: "luis@cosechas.com", avatar: "/placeholder-user.jpg" },
    { id: "6", name: "Sofia Torres", email: "sofia@cosechas.com", avatar: "/placeholder-user.jpg" },
  ];

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      const { data, error } = await supabase.from("contenidos").select("*").order("created_at", { ascending: false })
      if (!error && data) {
        setVideos(data)
      }
      setLoading(false)
    }
    fetchVideos()
  }, [])

  useEffect(() => {
    getCiudades().then((data) => {
      setCiudades(data);
      const map: Record<string, string> = {};
      data.forEach((c) => { map[c.id] = c.nombre; });
      setCiudadesMap(map);
    });
  }, []);

  useEffect(() => {
    async function fetchDuraciones() {
      const res = await fetch("/api/configuracion/duraciones");
      const data = await res.json();
      setDuracionesConfig(data);
    }
    fetchDuraciones();
  }, []);

  useEffect(() => {
    async function fetchReproducciones() {
      const hoy = new Date().toISOString().slice(0, 10);
      const { data, count, error } = await supabase
        .from("reproducciones")
        .select("zona, timestamp", { count: "exact" })
        .gte("timestamp", `${hoy}T00:00:00.000Z`)
        .lt("timestamp", `${hoy}T23:59:59.999Z`);
      if (!error && data) {
        const porZona: Record<string, number> = {};
        data.forEach((r: any) => {
          porZona[r.zona] = (porZona[r.zona] || 0) + 1;
        });
        setReproduccionesPorZona(porZona);
        setTotalReproduccionesHoy(count || 0);
      }
    }
    fetchReproducciones();
  }, []);

  useEffect(() => {
    async function fetchCiclos() {
      const { data, error } = await supabase
        .from("ciclos_reproduccion")
        .select("zona, ciclos");
      if (!error && data) {
        const porZona: Record<string, number> = {};
        let total = 0;
        data.forEach((r: any) => {
          porZona[r.zona] = (porZona[r.zona] || 0) + (r.ciclos || 0);
          total += r.ciclos || 0;
        });
        setCiclosPorZona(porZona);
        setTotalCiclos(total);
      }
    }
    fetchCiclos();
  }, []);

  const normalizeStatus = (estado: string | undefined | null): string => {
    const value = (estado || "").toLowerCase();
    if (value === "activo" || value === "active") return "active";
    if (value === "programado" || value === "scheduled" || value === "schedule") return "scheduled";
    if (value === "inactivo" || value === "inactive") return "inactive";
    return value;
  };

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesQuery = q.length === 0
        || (v.titulo && String(v.titulo).toLowerCase().includes(q))
        || (v.descripcion && String(v.descripcion).toLowerCase().includes(q));

      const category = (v.categoria || "").toLowerCase();
      const matchesCategory = categoryFilter === "all"
        || category === categoryFilter;

      const matchesStatus = statusFilter === "all"
        || normalizeStatus(v.estado) === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [videos, searchQuery, categoryFilter, statusFilter]);

  const videosPorZona = groupByZona(filteredVideos);
  const zonas = Object.keys(videosPorZona);

  useEffect(() => {
    if (zonas.length === 0 || videos.length === 0) return;
    
    const interval = setInterval(() => {
      zonas.forEach((zona) => {
        const videosEnZona = videosPorZona[zona];
        if (videosEnZona && videosEnZona.length > 1) {
          setSlideIndexes((prev) => {
            const next = { ...prev };
            const total = videosEnZona.length;
            next[zona] = total > 0 ? ((prev[zona] || 0) + 1) % total : 0;
            return next;
          });
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [zonas, videosPorZona, videos.length]);


  const handleDelete = useCallback(async (video: any) => {
    setDeletingId(video.id)
    const { error } = await supabase.from("contenidos").delete().eq("id", video.id)
    if (video.cloudinary_public_id) {
      await fetch("/api/contenidos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: video.cloudinary_public_id })
      })
    }
    setVideos((prev) => prev.filter((v) => v.id !== video.id))
    setDeletingId(null)
    setVideoToDelete(null)
  }, [])

  const handleDeleteById = async (id: string) => {
    const video = videos.find((v) => v.id === id);
    if (video) {
      await handleDelete(video);
    }
  };

  const handleReplaceById = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("file", file);

    try {
      const res = await fetch("/api/contenidos/replace", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al reemplazar");
      }
      
      const { content } = await res.json();
      
      setVideos((prev) => prev.map((v) => v.id === id ? content : v));
      toast.success("Imagen reemplazada correctamente");
    } catch (error: any) {
      console.error("Error replacing:", error);
      toast.error(`Error: ${error.message}`);
      throw error;
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!selectedZone) return;
    
    const categoria = activeTab === 'left' ? 'precios' : 'publicidad';
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("grupo_id", selectedZone);
      formData.append("categoria", categoria);
      
      try {
        const res = await fetch("/api/contenidos/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Error uploading");
        }
        
        const { content } = await res.json();
        
        setVideos(prev => [...prev, content]);
        toast.success(`Imagen ${file.name} subida correctamente`);
        
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(`Error subiendo ${file.name}: ${error.message}`);
      }
    }
  };

  const handleRotate = async (direction: 'left' | 'right') => {
    if (!previewUrl || !selectedZone || isRotating) return;
    const videosZona = videosPorZona[selectedZone];
    if (!videosZona) return;
    
    const video = videosZona.find((v: any) => v.cloudinary_url === previewUrl);
    if (!video) return;

    setIsRotating(true);
    const toastId = toast.loading("Rotando imagen y guardando...");

    try {
      const ext = previewUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `rotated-${Date.now()}.${ext}`;

      const rotatedFile = await rotateImageFile(previewUrl, direction, fileName, fileType);
      
      await handleReplaceById(video.id, rotatedFile);
      
      // Update preview to the new URL directly
      const updatedVideo = videosPorZona[selectedZone]?.find((v: any) => v.id === video.id);
      if (updatedVideo && updatedVideo.cloudinary_url) {
        setPreviewUrl(updatedVideo.cloudinary_url);
      } else {
        // Fallback close preview if wait failed
        setPreviewUrl(null);
      }
      toast.success("Imagen rotada correctamente", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al rotar la imagen por permisos o formato.", { id: toastId });
    } finally {
      setIsRotating(false);
    }
  };

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
                  <BreadcrumbPage>Resumen General</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Cloudinary Status Cards */}


          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Imagenes Activas</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videos.filter(v => v.estado === 'activo' || v.estado === 'active').length}</div>
                <p className="text-xs text-muted-foreground">+2 desde ayer</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pantallas Conectadas</CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">3 desconectadas</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ciclos Completados</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCiclos}</div>
                <p className="text-xs text-muted-foreground">+15% vs ayer</p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos Programados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Para esta semana</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar videos..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="publicidad">Publicidad</SelectItem>
                  <SelectItem value="precios">Precios</SelectItem>
                  <SelectItem value="promociones">Promociones</SelectItem>
                  <SelectItem value="eventos">Eventos</SelectItem>
                  <SelectItem value="informativo">Informativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="scheduled">Programados</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/upload">
                <CloudUpload className="h-4 w-4" />
                Subir Contenido
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8">Cargando videos...</div>
            ) : zonas.length === 0 ? (
              <div className="col-span-full text-center py-8">No hay contenidos subidos aún.</div>
            ) : (
              zonas.map((zona) => {
                const videosZona = videosPorZona[zona];
                let current = slideIndexes[zona] || 0;
                
                if (videosZona && current >= videosZona.length) {
                  current = 0;
                }
                
                const video = videosZona ? videosZona[current] : null;
                
                if (!video) return null;

                return (
                  <Card 
                    key={zona} 
                    className="overflow-hidden shadow-none"
                  >
                    <div className="relative">
                      <div 
                        className="relative w-full h-48 bg-gray-100 overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedZone(zona)}
                      >
                        <AnimatePresence>
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full"
                          >
                            <Image
                              src={video.cloudinary_url || "/placeholder.svg"}
                              alt={video.titulo || "Imagen"}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={current === 0}
                            />
                          </motion.div>
                        </AnimatePresence>
                        
                        <div className="absolute inset-0 bg-gray-100/100 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-10">
                          <img src="/images/folder.svg" alt="Carpeta" className="w-16 h-16 drop-shadow-xs" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 z-30">
                        <Badge className="bg-green-600 text-white">
                          {video.estado || "Activo"}
                        </Badge>
                      </div>
                      <div 
                        className="absolute top-2 right-2 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/reproductor?zona=${video.grupo_id}`, '_blank')}> <Play className="mr-2 h-4 w-4" /> Reproducir </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast(
                                "Opción no disponible 🙅🏽‍♂️",
                                {
                                  description: "La edición estará disponible en la versión 2.",
                                  duration: 6000,
                                }
                              );
                            }}> <Edit className="mr-2 h-4 w-4" /> Editar </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const url = video.cloudinary_url.replace(
                                  "/upload/",
                                  `/upload/fl_attachment:${encodeURIComponent(video.titulo || "contenido")}/`
                                );
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = video.titulo || "contenido";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar
                            </DropdownMenuItem>
                            <AlertDialog open={videoToDelete?.id === video.id} onOpenChange={open => { if (!open) setVideoToDelete(null); }}>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  disabled={deletingId === video.id}
                                  onSelect={e => { e.preventDefault(); setVideoToDelete(video); }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {deletingId === video.id ? "Eliminando..." : "Eliminar"}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro que deseas eliminar este contenido?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El contenido se eliminará permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setVideoToDelete(null)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await handleDelete(video);
                                    }}
                                    disabled={deletingId === video.id}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                                             <div className="absolute bottom-2 right-2 z-30">
                         <Badge variant="secondary" className="text-xs">
                           <Clock className="mr-1 h-3 w-3" />
                           {duracionesConfig[video.categoria] ? `${duracionesConfig[video.categoria]} s` : "-"}
                         </Badge>
                       </div>
                       {/* Gradient fade at bottom — prevents white images from blending */}
                       <div
                         className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[5]"
                         style={{
                           background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.13))",
                         }}
                       />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base line-clamp-2">{video.titulo}</CardTitle>
                          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => { 
                            e.stopPropagation(); 
                            setAvatarSheetZoneId(video.grupo_id);
                            setIsAvatarSheetOpen(true); 
                          }}>
                            <AvatarGroup users={mockUsers} max={4} size="sm" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-medium capitalize",
                              video.categoria === 'publicidad' && "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
                              video.categoria === 'precios' && "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20",
                              video.categoria === 'promociones' && "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20",
                              video.categoria === 'eventos' && "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20",
                              video.categoria === 'informativo' && "bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/20",
                              !['publicidad', 'precios', 'promociones', 'eventos', 'informativo'].includes(video.categoria) && "bg-gray-100 text-gray-600"
                            )}
                          >
                            {video.categoria}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Box className="mr-2 h-4 w-4" />
                            {ciudadesMap[video.grupo_id] || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="mr-2 h-4 w-4" />
                            {ciclosPorZona[video.grupo_id] || 0}
                          </span>
                        </div>
                        <span>{video.created_at ? new Date(video.created_at).toLocaleDateString() : "-"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Load More */}
          <div className="flex justify-center pt-4">
            <Button variant="outline">Cargar más videos</Button>
          </div>
          </div>
        </ScrollArea>
      </SidebarInset>
      <Sheet open={!!selectedZone} onOpenChange={(open) => { if(!open) { setSelectedZone(null); setPreviewUrl(null); } }}>
        <SheetContent className="sm:max-w-md flex flex-col overflow-visible h-full p-0">
          {previewUrl && (
            <div className="absolute top-1/2 right-full mr-4 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
              <div className="bg-black p-1 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300 relative">
                <img 
                  src={previewUrl} 
                  alt="Vista previa" 
                  className="max-w-[400px] max-h-[80vh] rounded-md object-contain transition-all duration-300"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white text-black hover:bg-gray-200 shadow-xl border border-gray-100 disabled:opacity-50"
                  onClick={() => setPreviewUrl(null)}
                  disabled={isRotating}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="shadow-xl px-4" onClick={() => handleRotate('left')} disabled={isRotating}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Izquierda
                </Button>
                <Button variant="secondary" className="shadow-xl px-4" onClick={() => handleRotate('right')} disabled={isRotating}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Derecha
                </Button>
              </div>
            </div>
          )}
          
          <div className="px-6 pt-6 pb-2 shrink-0">
            <SheetHeader>
              <SheetTitle>
                {selectedZone && ciudadesMap[selectedZone] ? ciudadesMap[selectedZone] : "Detalles de la Zona"}
              </SheetTitle>
              <SheetDescription>
                Información adicional de la zona seleccionada.
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-full w-full pr-4 -mr-4">
              <Comp547 
                key={`${selectedZone}-${activeTab}`}
                onPreview={(url) => setPreviewUrl(url)} 
                onDelete={handleDeleteById}
                onReplace={handleReplaceById}
                onUpload={handleUpload}
                defaultFiles={
                  selectedZone && videosPorZona[selectedZone] 
                  ? videosPorZona[selectedZone]
                      .filter((v: any) => activeTab === 'left' ? v.categoria === 'precios' : v.categoria === 'publicidad')
                      .map((v: any) => ({
                      id: v.id,
                      name: v.titulo || "Imagen",
                      size: 0,
                      type: "image/jpeg",
                      url: v.cloudinary_url,
                      uploadedAt: v.created_at
                    }))
                  : []
                }
              />
            </ScrollArea>
          </div>

          <div className="px-6 py-6 border-t shrink-0 flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant={activeTab === 'left' ? 'default' : 'outline'}
                onClick={() => setActiveTab('left')}
              >
                Izquierda
              </Button>
              <Button 
                className="flex-1" 
                variant={activeTab === 'right' ? 'default' : 'outline'}
                onClick={() => setActiveTab('right')}
              >
                Derecha
              </Button>
            </div>
            <Button className="w-full">Guardar</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isAvatarSheetOpen} onOpenChange={setIsAvatarSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Usuarios</SheetTitle>
            <SheetDescription>
              Gestión de usuarios asignados.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-9 flex flex-col items-center gap-4">
            {(() => {
              const TIEMPO_LIMITE_MS = 360000;
              const conectadas = tiendas.filter(t => t.ultima_conexion && (new Date().getTime() - new Date(t.ultima_conexion).getTime() < TIEMPO_LIMITE_MS)).length;
              const desconectadas = tiendas.length - conectadas;
              return (
                <ChartRadialText 
                  conectadas={conectadas}
                  desconectadas={desconectadas}
                />
              );
            })()}
          </div>
          <div className="mt-8 pb-20">
            <Table>
              <TableCaption>Tiendas asociadas a la zona.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Tienda</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Conexión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiendas.length > 0 ? (
                  tiendas.map((tienda) => {
                        const TIEMPO_LIMITE_MS = 360000; 
                        
                        const isOnline = tienda.ultima_conexion && (new Date().getTime() - new Date(tienda.ultima_conexion).getTime() < TIEMPO_LIMITE_MS);
                        
                        return (
                          <TableRow key={tienda.id}>
                            <TableCell className="font-medium max-w-[200px] truncate" title={tienda.nombre}>
                              {tienda.nombre}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                                <span>{isOnline ? "En línea" : "Fuera de línea"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {tienda.ultima_conexion 
                                ? new Date(tienda.ultima_conexion).toLocaleString() 
                                : "Nunca"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay tiendas en esta zona</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  )
}
