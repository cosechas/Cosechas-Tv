import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner";

interface TokenVerificationModalProps {
  open: boolean
  onClose: () => void
  onVerified: () => void
}

const EMAIL = "sistemas@cosechasexpress.com"

export function TokenVerificationModal({ open, onClose, onVerified }: TokenVerificationModalProps) {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading" | "resent">("idle")
  const [message, setMessage] = useState("")
  const [tokenRequested, setTokenRequested] = useState(false)

  React.useEffect(() => {
    if (open) {
      requestToken()
    } else {
      setStatus("idle")
      setMessage("")
      setToken("")
      setTokenRequested(false)
    }
    // eslint-disable-next-line
  }, [open])

  const requestToken = async () => {
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/verify-token/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("idle")
        setMessage("")
        setTokenRequested(true)
      } else {
        setStatus("error")
        setMessage(data.error || "No se pudo enviar el token.")
      }
    } catch {
      setStatus("error")
      setMessage("Error al solicitar el token.")
    }
  }

  const resendToken = async () => {
    setStatus("resent")
    setMessage("")
    try {
      const res = await fetch("/api/verify-token/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus("idle")
        setMessage("Nuevo código enviado.")
      } else {
        setStatus("error")
        setMessage(data.error || "No se pudo reenviar el token.")
      }
    } catch {
      setStatus("error")
      setMessage("Error al reenviar el token.")
    }
  }

  const validateToken = async () => {
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/verify-token/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL, token }),
      })
      const data: any = await res.json()
      if (data.success) {
        setStatus("success")
        setMessage("")
        toast("¡Éxito! ✅", {
          description: "Token verificado correctamente.",
          duration: 6000
        })
        setTimeout(() => {
          setStatus("idle")
          setMessage("")
          setToken("")
          setTokenRequested(false)
          onVerified()
          onClose()
        }, 1000)
      } else {
        setStatus("error")
        setMessage("")
        toast("Codigo no valido ", {
          description: data.error || "Token incorrecto.",
          duration: 6000,
          action: {
            label: "Solicitar",
            onClick: resendToken
          }
        })
      }
    } catch {
      setStatus("error")
      setMessage("")
      toast("Error de verificación", {
        description: "Error al validar el token.",
        duration: 6000
      })
    }
  }

  const handleClose = () => {
    setStatus("idle")
    setMessage("")
    setToken("")
    setTokenRequested(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-8 rounded-xl">
        <DialogHeader className="items-center">
          <DialogTitle className="text-center text-2xl font-semibold mb-2">Verificación de código</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-sm text-muted-foreground text-center mb-2">
            Te hemos enviado un código a <span className="font-semibold">{EMAIL}</span>
          </div>
          <InputOTP
            maxLength={6}
            value={token}
            onChange={setToken}
            containerClassName="justify-center"
            className="mx-auto"
            disabled={status === "loading" || status === "success"}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <div className="text-xs text-muted-foreground text-center">
            ¿No recibiste el código?{' '}
            <button
              type="button"
              className="underline underline-offset-2 font-medium disabled:opacity-50"
              onClick={resendToken}
              disabled={status === "loading" || status === "resent"}
            >
              Haz clic para reenviar
            </button>
            {status === "resent" && <span className="ml-2 text-green-600">Enviado</span>}
          </div>
          {message && status === "error" && (
            null
          )}
          {message && status === "success" && (
            null
          )}
          <div className="flex w-full gap-2 mt-2">
            <Button variant="ghost" onClick={handleClose} className="w-1/2" disabled={status === "loading"}>
              Cancelar
            </Button>
            <Button
              onClick={validateToken}
              disabled={token.length !== 6 || status === "loading" || status === "success"}
              className="w-1/2"
            >
              Validar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 