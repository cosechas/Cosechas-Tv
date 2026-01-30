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


export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [current, setCurrent] = React.useState(0);



  const router = useRouter()




  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const data = await res.json();
      if (data.access_token && data.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }
      router.push("/dashboard")
    } else {
      const data = await res.json()
      const errorMsg = data.error || "Error al iniciar sesión"
      setError("")
      toast("Inicio de sesión fallido 😴", {
        description: errorMsg,
        duration: 6000,
        // Puedes agregar un icono aquí si lo deseas
      })
    }
    setLoading(false)
  }

  const handleSocialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast(
      "Opción no disponible 🙅🏽‍♂️",
      {
        description: "La autenticación con Google estará disponible en la v2.",
        duration: 6000,
      }
    );
  }

  const loginImages = [
    "/images/login.png",];



  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden shadow-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bienvenido a cosechas</h1>
                <p className="text-balance text-muted-foreground">Inicia seccion con tu cuenta</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" placeholder="m@cosechasexpress.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={e => {
                      e.preventDefault();
                      toast(
                        "Recuperar contraseña 🔒",
                        {
                          description: "Comuníquese con el administrador.",
                          duration: 6000,
                          action: {
                            label: "Contactar",
                            onClick: () => window.open("mailto:gestion_sistemas@cosechasexpress.com")
                          }
                        }
                      );
                    }}
                  >
                    Olvidaste tu contraseña?
                  </a>
                </div>
                <Input id="password" type="password" placeholder="******" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando..." : "Continuar"}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">O continuar con</span>
              </div>
              <div className="flex">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleSocialClick}>
                  <svg width="24" height="24" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                    <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                    <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                    <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                    <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                  </svg>
                  <span>Iniciar con Google</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                ¿No tiene una cuenta?{" "}
                <a
                  href="#"
                  className="underline underline-offset-4"
                  onClick={e => {
                    e.preventDefault();
                    toast(
                      "Solicitud de cuenta 🔑",
                      {
                        description: "Comuníquese con el administrador.",
                        duration: 6000,
                        action: {
                          label: "Contactar",
                          onClick: () => window.open("mailto:gestion_sistemas@cosechasexpress.com")
                        }
                      }
                    );
                  }}
                >
                  Crea una
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block overflow-hidden">
            {loginImages.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                height={1000}
                width={1000}
                alt="Imagen login"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}

              />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By Yafran Barboza Acosta <a href="https://www.cosechasexpress.com/">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
