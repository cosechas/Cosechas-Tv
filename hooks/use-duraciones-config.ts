import { useState, useEffect } from 'react'

interface DuracionConfig {
  precios: number
  publicidad: number
  promociones: number
  eventos: number
  informativo: number
}

const DURACIONES_POR_DEFECTO: DuracionConfig = {
  precios: 3,
  publicidad: 5,
  promociones: 4,
  eventos: 6,
  informativo: 4,
}

export function useDuracionesConfig() {
  const [config, setConfig] = useState<DuracionConfig>(DURACIONES_POR_DEFECTO)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('duraciones_config')
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
      }
    } catch (error) {
      console.log("Error al cargar configuración de duraciones:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const getDuracion = (categoria: string): number => {
    return config[categoria as keyof DuracionConfig] || 4
  }
  const updateConfig = (newConfig: DuracionConfig) => {
    setConfig(newConfig)
    localStorage.setItem('duraciones_config', JSON.stringify(newConfig))
  }

  return {
    config,
    isLoaded,
    getDuracion,
    updateConfig,
    DURACIONES_POR_DEFECTO
  }
} 