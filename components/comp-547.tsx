"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, Trash2Icon, RefreshCw, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
} from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function Component({ 
  onPreview, 
  defaultFiles = [],
  onDelete,
  onReplace,
  onUpload
}: { 
  onPreview?: (url: string) => void;
  defaultFiles?: FileMetadata[];
  onDelete?: (id: string) => Promise<void>;
  onReplace?: (id: string, file: File) => Promise<void>;
  onUpload?: (files: File[]) => Promise<void>;
}) {
  const maxSizeMB = 100;
  const maxSize = maxSizeMB * 1024 * 1024; // 100MB default
  const maxFiles = 20;

  const [replacingId, setReplacingId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [pendingPreviews, setPendingPreviews] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      replaceFile,
      clearFiles,
      getInputProps,
      setFiles,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    initialFiles: defaultFiles,
    maxFiles,
    maxSize,
    multiple: true,
    onFilesAdded: (addedFiles) => {
      if (onUpload) {
        const filesToUpload = addedFiles
          .map((f) => (f.file instanceof File ? f.file : null))
          .filter((f): f is File => f !== null);
        
        if (filesToUpload.length > 0) {
          setPendingUploadFiles(filesToUpload);
          const initialNames: Record<string, string> = {};
          const previews: Record<string, string> = {};

          filesToUpload.forEach(f => {
            const ext = f.name.lastIndexOf('.') > 0 ? f.name.substring(f.name.lastIndexOf('.')) : '';
            const nameWithoutExt = f.name.replace(ext, '') || f.name;
            initialNames[f.name] = nameWithoutExt; 
            previews[f.name] = URL.createObjectURL(f);
          });
          setFileNames(initialNames);
          setPendingPreviews(previews);
          setIsDialogOpen(true);
        }
      }
    },
  });

  const handleConfirmUpload = async () => {
    if (!onUpload) return;
    setIsUploading(true);
    try {
      const renamedFiles = pendingUploadFiles.map(file => {
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const newBaseName = fileNames[file.name] || file.name.replace(ext, '');
        const finalName = `${newBaseName}${ext}`;
        return new File([file], finalName, { type: file.type });
      });
      await onUpload(renamedFiles);
      setPendingUploadFiles([]);
      setIsDialogOpen(false);
      
      // Cleanup previews
      Object.values(pendingPreviews).forEach(url => URL.revokeObjectURL(url));
      setPendingPreviews({});
      
      clearFiles();
    } catch (error) {
      console.error("Error al subir archivos:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setIsDialogOpen(false);
    setPendingUploadFiles([]);
    
    // Cleanup previews
    Object.values(pendingPreviews).forEach(url => URL.revokeObjectURL(url));
    setPendingPreviews({});
    
    // Remove the pending files from the UI list if cancelled
    const filesToRemove = pendingUploadFiles.map(f => {
      const matchingFile = files.find(stateFile => stateFile.file.name === f.name && stateFile.file.size === f.size);
      return matchingFile?.id;
    }).filter(Boolean) as string[];
    
    filesToRemove.forEach(id => removeFile(id));
  };

  useEffect(() => {
    setFiles(defaultFiles);
  }, [defaultFiles, setFiles]);

  const handleReplaceClick = (id: string) => {
    setReplacingId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingId) {
      const file = e.target.files[0];
      
      if (onReplace) {
        try {
          await onReplace(replacingId, file);
        } catch (error) {
          console.error("Error replacing file:", error);
          return;
        }
      }
      
      replaceFile(replacingId, file);
      setReplacingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        className="hidden"
        ref={replaceInputRef}
        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif"
        onChange={handleReplaceChange}
      />
      <div
        className="relative flex min-h-52 flex-col items-center not-data-[files]:justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          {...getInputProps()}
          aria-label="Upload image file"
          className="sr-only"
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            aria-hidden="true"
            className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 font-medium text-sm">Suba sus imágenes aquí</p>
          <p className="text-muted-foreground text-xs">
            SVG, PNG, JPG o GIF (max. {maxSizeMB}MB)
          </p>
          <Button className="mt-4" onClick={openFileDialog} variant="outline">
            <UploadIcon aria-hidden="true" className="-ms-1 opacity-60" />
            Subir imágenes
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-destructive text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
              key={file.id}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div 
                  className="aspect-square shrink-0 rounded bg-accent cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onPreview?.(file.preview)}
                >
                  <img
                    alt={file.file.name}
                    className="size-10 rounded-[inherit] object-cover"
                    src={file.preview}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate font-medium text-[13px]">
                    {file.file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {'uploadedAt' in file.file && file.file.uploadedAt
                      ? new Date(file.file.uploadedAt).toLocaleDateString()
                      : formatBytes(file.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  aria-label="Replace file"
                  className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                  onClick={() => handleReplaceClick(file.id)}
                  size="icon"
                  variant="ghost"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  aria-label="Remove file"
                  className="size-8 text-destructive/80 hover:bg-transparent hover:text-destructive"
                  onClick={async () => {
                    if (onDelete) {
                      await onDelete(file.id);
                    }
                    removeFile(file.id);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2Icon aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        aria-live="polite"
        className="mt-2 text-center text-muted-foreground text-xs"
        role="region"
      >
        Agrega tus archivos y dales un formato amigable.
      </p>

      {/* Dialog for renaming files */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelUpload()}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nombrar contenido</DialogTitle>
            <DialogDescription>
              Por favor asigne un nombre a los archivos antes de subirlos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {pendingUploadFiles.map((file, index) => {
               const previewUrl = pendingPreviews[file.name] || files.find(f => f.file.name === file.name && f.file.size === file.size)?.preview;
               
               return (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 space-y-0">
                  {previewUrl && (
                    <img src={previewUrl} alt={file.name} className="h-12 w-12 object-cover rounded-md border" />
                  )}
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground truncate block max-w-[250px]">{file.name}</Label>
                    <Input 
                      value={fileNames[file.name] || ""} 
                      onChange={(e) => setFileNames({...fileNames, [file.name]: e.target.value})} 
                      placeholder="Ej: Promo Verano"
                    />
                  </div>
                </div>
               );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelUpload} disabled={isUploading}>Cancelar</Button>
            <Button onClick={handleConfirmUpload} disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Confirmar subida"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
