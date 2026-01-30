"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="text-sm text-muted-foreground">Cargando tema...</div>
  }

  return (
    <div className="text-xs text-muted-foreground">
      Tema: {theme} | Resuelto: {resolvedTheme}
    </div>
  )
} 