"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from "next/image"
import { toast } from "sonner";

export function UpdatePasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  
  const router = useRouter()

  React.useEffect(() => {
    // Al regresar del correo, supabase establece la sesión de recuperación automáticamente
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast("Enlace inválido o expirado", { 
          description: "Por favor solicita un nuevo enlace de recuperación.",
          duration: 6000
        });
        router.push("/auth");
      }
    };
    checkSession();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast("Las contraseñas no coinciden", { duration: 4000 });
      return;
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      toast("Error al actualizar la contraseña", { description: error.message, duration: 6000 });
    } else {
      toast("¡Contraseña actualizada! 🥳", { 
        description: "Tu contraseña ha sido cambiada exitosamente.",
        duration: 6000 
      });
      router.push("/dashboard")
    }
    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="flex flex-col justify-center p-6 md:p-8 md:min-h-[560px]" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6 w-full max-w-[350px] mx-auto">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Nueva contraseña</h1>
                <p className="text-balance text-muted-foreground">Ingresa tu nueva contraseña para acceder.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="******" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="******" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block overflow-hidden">
            <Image 
              src="/images/login.png" 
              height={1000} 
              width={1000} 
              alt="Imagen login" 
              className="absolute inset-0 h-full w-full object-cover" 
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By Yafran Barboza Acosta <a href="https://www.cosechasexpress.com/">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
