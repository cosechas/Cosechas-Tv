"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload,CloudUpload, X, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { getCiudades } from "@/lib/database"
import type { Ciudad } from "@/lib/supabase"
import { TokenVerificationModal } from "@/components/token-verification-modal"
import { toast } from "sonner";

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("")
  const [groupType, setGroupType] = useState("")
  const [groupId, setGroupId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [tokenVerified, setTokenVerified] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const [currentPreview, setCurrentPreview] = useState(0)

  // Prevenir que el navegador abra archivos arrastrados fuera del área de drop
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  useEffect(() => {
    getCiudades().then(setCiudades).catch(() => setCiudades([]))
  }, [])

  // Cuando cambian los archivos, resetear el preview actual si es necesario
  useEffect(() => {
    if (currentPreview >= files.length) setCurrentPreview(0)
  }, [files, currentPreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    const validTypes = ["video/mp4", "video/mov", "video/avi", "image/jpeg", "image/png", "image/gif"]
    const maxSize = 100 * 1024 * 1024 // 100MB
    let validFiles: File[] = []
    let newPreviews: string[] = []
    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        setMessage("Tipo de archivo no soportado. Use MP4, MOV, AVI, JPG, PNG o GIF.")
        setUploadStatus("error")
        continue
      }
      if (file.size > maxSize) {
        setMessage("El archivo es demasiado grande. Máximo 100MB.")
        setUploadStatus("error")
        continue
      }
      validFiles.push(file)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(file)
        newPreviews.push(videoUrl)
      }
    }
    setFiles(prev => [...prev, ...validFiles])
    setPreviews(prev => [...prev, ...newPreviews])
    setUploadStatus("idle")
    setMessage("")
    // Resetear el input para permitir seleccionar los mismos archivos nuevamente
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!files.length) {
      setMessage("Por favor selecciona al menos un archivo.")
      setUploadStatus("error")
      return
    }
    if (!tokenVerified) {
      setShowTokenModal(true)
      return
    }
    setIsUploading(true)
    setProgress(0)
    setUploadStatus("idle")
    setMessage("")
    try {
      const formData = new FormData()
      files.forEach((file, idx) => {
        formData.append("files", file)
      })
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("groupType", groupType)
      formData.append("groupId", groupId)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setProgress(100)
        setUploadStatus("success")
        toast("¡Contenido subido! 🥳", {
          description: "Los archivos se han subido exitosamente y ya están disponibles.",
          duration: 6000
        });
        setMessage("")
        setFiles([])
        setPreviews([])
        setTitle("")
        setDescription("")
        setCategory("")
        setGroupType("")
        setGroupId("")
        setTokenVerified(false)
        setTimeout(() => {
          setUploadStatus("idle")
          setMessage("")
        }, 3000)
      } else {
        setUploadStatus("error")
        setMessage(result.error || "Error al subir los archivos. Inténtalo de nuevo.")
      }
    } catch (error) {
      setUploadStatus("error")
      setMessage("Error al subir los archivos. Inténtalo de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = (idx?: number) => {
    if (typeof idx === "number") {
      setFiles(files => files.filter((_, i) => i !== idx))
      setPreviews(previews => previews.filter((_, i) => i !== idx))
    } else {
      setFiles([])
      setPreviews([])
    }
    setUploadStatus("idle")
    setMessage("")
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    console.log("DRAG OVER");
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log("DRAG LEAVE");
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log("DROP");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      // Simular evento de input para reutilizar la lógica existente
      handleFileChange({ target: { files: droppedFiles } } as any);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-none">
      <TokenVerificationModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onVerified={() => {
          setTokenVerified(true)
          setShowTokenModal(false)
          // Reintentar submit automáticamente
          setTimeout(() => {
            const form = document.querySelector("form") as HTMLFormElement
            if (form) form.requestSubmit()
          }, 100)
        }}
      />
      <CardHeader>
        <CardTitle>Subir Nuevo Contenido</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Estado de carga/error */}
          {message && (
            <Alert variant={uploadStatus === "error" ? "destructive" : "default"}>
              {uploadStatus === "success" && <CheckCircle className="h-4 w-4" />}
              {uploadStatus === "error" && <AlertCircle className="h-4 w-4" />}
              <AlertTitle>
                {uploadStatus === "success" && "¡Éxito!"}
                {uploadStatus === "error" && "Error"}
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Input de archivos - siempre presente pero oculto */}
          <Input id="file" type="file" className="hidden" accept="video/*,image/*" multiple onChange={handleFileChange} />
          
          {/* Área de carga de archivos */}
          {!files.length ? (
            <div
              ref={dropRef}
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors"
              style={{ background: isDragging ? '#e6f0fa' : undefined, borderColor: isDragging ? '#90caf9' : undefined }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragLeave}
              onClick={() => document.getElementById("file")?.click()}
            >
              <CloudUpload className="h-10 w-10 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Arrastra archivos o haz clic para seleccionar</p>
                <p className="text-sm text-muted-foreground">
                  Soporta videos MP4, MOV, AVI e imágenes JPG, PNG, GIF (máx. 100MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={e => { e.stopPropagation(); document.getElementById("file")?.click(); }}
              >
                Seleccionar Archivos
              </Button>
            </div>
          ) : (
            <div 
              ref={dropRef}
              className="relative w-full flex flex-col items-center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragLeave}
            >
              <div className="relative w-full h-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed"
                style={{ borderColor: isDragging ? '#90caf9' : undefined, background: isDragging ? '#e6f0fa' : undefined }}
              >
                {/* Flecha izquierda */}
                {files.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                    onClick={e => { e.stopPropagation(); setCurrentPreview((prev) => (prev - 1 + files.length) % files.length) }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {/* Botón eliminar */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full bg-background/80 z-10"
                  onClick={() => clearFile(currentPreview)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {/* Preview del archivo actual */}
                {previews[currentPreview] ? (
                  files[currentPreview].type.startsWith("image/") ? (
                    <img
                      src={previews[currentPreview] || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video src={previews[currentPreview]} controls className="max-w-full max-h-full object-contain" />
                  )
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{files[currentPreview].name}</p>
                    <p className="text-xs text-muted-foreground">{(files[currentPreview].size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                {/* Flecha derecha */}
                {files.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                    onClick={e => { e.stopPropagation(); setCurrentPreview((prev) => (prev + 1) % files.length) }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>
              {/* Indicador de posición */}
              {files.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {files.map((_, idx) => (
                    <span key={idx} className={`w-2 h-2 rounded-full ${idx === currentPreview ? 'bg-primary' : 'bg-muted-foreground/30'}`}></span>
                  ))}
                </div>
              )}
              {/* Botón para agregar más archivos */}
              <div className="mt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <CloudUpload className="h-4 w-4 mr-2" />
                  Agregar más archivos ({files.length} seleccionado{files.length !== 1 ? 's' : ''})
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  También puedes arrastrar y soltar más archivos aquí
                </p>
              </div>
            </div>
          )}

          {/* Formulario de metadatos */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Título del contenido" required value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" placeholder="Descripción del contenido" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select name="category" value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="precios">Precios</SelectItem>
                    <SelectItem value="publicidad">Publicidad</SelectItem>
                    <SelectItem value="promociones">Promociones</SelectItem>
                    <SelectItem value="eventos">Eventos</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="groupType">Zonas</Label>
                <Select name="groupType" value={groupType} onValueChange={setGroupType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zona">Zonas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="groupId">Asignar a</Label>
              <Select name="groupId" value={groupId} onValueChange={setGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map((ciudad) => (
                    <SelectItem key={ciudad.id} value={ciudad.id}>
                      {ciudad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {/* Barra de progreso */}
          {isUploading && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span>Subiendo...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Botones */}
          <div className="w-full flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => clearFile()} disabled={!files.length || isUploading}>
              Limpiar
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || showTokenModal}
            >
              {isUploading ? "Subiendo..." : "Subir Contenido"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
