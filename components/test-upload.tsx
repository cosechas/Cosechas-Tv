"use client"

import type React from "react"

import { useState } from "react"
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function TestUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Crear preview
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else if (selectedFile.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(selectedFile)
      setPreview(videoUrl)
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setStatus("uploading")
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", "Test Upload")
    formData.append("category", "test")
    formData.append("groupType", "test")
    formData.append("groupId", "test")

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 300)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setResult(data)
      } else {
        setStatus("error")
        setResult(data)
      }
    } catch (error) {
      setStatus("error")
      setResult({
        success: false,
        message: "Error al realizar la solicitud",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setStatus("idle")
    setProgress(0)
    setResult(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Prueba de Subida</CardTitle>
        <CardDescription>Sube un archivo para probar la integración con Cloudinary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status !== "success" && status !== "error" && (
          <>
            {!file ? (
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById("test-file")?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium">Haz clic para seleccionar un archivo</p>
                <p className="text-xs text-muted-foreground mt-1">o arrastra y suelta aquí</p>
                <input
                  id="test-file"
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {preview && (
                  <div className="rounded-lg overflow-hidden border">
                    {file.type.startsWith("image/") ? (
                      <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-contain" />
                    ) : (
                      <video src={preview} controls className="w-full h-48 object-contain" />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {status === "uploading" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subiendo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {status === "success" && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-700">Subida exitosa</AlertTitle>
            <AlertDescription className="text-green-600">
              <p>El archivo se ha subido correctamente a Cloudinary.</p>
              {result?.url && (
                <div className="mt-4">
                  <img
                    src={result.url || "/placeholder.svg"}
                    alt="Uploaded"
                    className="w-full h-48 object-contain rounded-lg border"
                  />
                  <p className="mt-2 text-xs break-all">{result.url}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Error de subida</AlertTitle>
            <AlertDescription>
              <p>{result?.message || "No se pudo subir el archivo a Cloudinary"}</p>
              {result?.error && <p className="mt-2 text-sm font-mono bg-destructive/20 p-2 rounded">{result.error}</p>}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {(status === "success" || status === "error") && (
          <Button variant="outline" onClick={resetForm}>
            Reiniciar
          </Button>
        )}
        {status !== "success" && status !== "error" && (
          <Button onClick={uploadFile} disabled={!file || status === "uploading"}>
            {status === "uploading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Subir archivo"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
