"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
}

export function ComingSoonDialog({ isOpen, onClose, featureName }: ComingSoonDialogProps) {
  const isManual = featureName.toLowerCase().includes("manual")

  const title = isManual ? "Pendiente de Aprobación" : "Función en desarrollo"

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed mt-2 text-muted-foreground/90">
            {isManual ? (
              <>
                El documento <strong>{featureName}</strong> ya se encuentra redactado e implementado en el sistema. 
                <br /><br />
                Se habilitará su acceso a todos los usuarios una vez que <strong>Gerencia confirme la aprobación definitiva</strong> de sus lineamientos de uso.
              </>
            ) : (
              <>
                La función <strong>{featureName}</strong> estará disponible de forma nativa en la versión 2.0. 
                Estamos finalizando los flujos para traerte la mejor experiencia.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onClose}>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 