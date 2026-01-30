"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Edit, Calendar, Trash2, MoreVertical, Monitor, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { VideoPlayer } from "@/components/video-player"
import { toast } from "sonner";
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

interface VideoCardProps {
  video: {
    id: string
    title: string
    url: string
    thumbnail: string
    duration?: number
    format?: string
    created_at?: string
    tags?: string[]
  }
  onDelete?: () => void
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(video.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el video");
      }

      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente",
      });

      if (onDelete) {
        onDelete();
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el video",
      });
    } finally {
      setIsDeleting(false);
      setOpenAlert(false);
    }
  }

  // Formatear duración
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative">
          <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" className="rounded-full" onClick={handlePlay}>
              <Play className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {formatDuration(video.duration)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
          <CardDescription>
            {video.format?.toUpperCase()} • {formatDate(video.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                12
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                1.2k
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePlay}>
                  <Play className="mr-2 h-4 w-4" />
                  Reproducir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast(
                    "Opción no disponible 🙅🏽‍♂️",
                    {
                      description: "La edición estará disponible en la versión 2.",
                      duration: 6000,
                    }
                  );
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar
                </DropdownMenuItem>
                <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      disabled={isDeleting}
                      onSelect={e => { e.preventDefault(); setOpenAlert(true); }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro que deseas eliminar este video?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El video se eliminará permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>{video.title}</DialogTitle>
            <DialogDescription>
              {video.format?.toUpperCase()} • {formatDuration(video.duration)}
            </DialogDescription>
          </DialogHeader>
          <VideoPlayer src={video.url} poster={video.thumbnail} className="aspect-video" autoPlay />
        </DialogContent>
      </Dialog>
    </>
  )
}
