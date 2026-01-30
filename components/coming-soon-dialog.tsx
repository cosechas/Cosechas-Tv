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
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Función en desarrollo</AlertDialogTitle>
          <AlertDialogDescription>
            La función <strong>{featureName}</strong> estará disponible en la versión 2.0. Estamos trabajando para traerte las mejores funcionalidades.
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