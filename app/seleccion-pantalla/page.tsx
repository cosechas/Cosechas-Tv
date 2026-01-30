"use client"
import { Play, LoaderCircle } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface ImagenConDuracion {
  id: string
  url: string
  categoria: string
  duracion: number
  titulo?: string
}

function SeleccionPantallaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null)
  const [images, setImages] = useState<ImagenConDuracion[]>([])
  const [loading, setLoading] = useState(true)
  const [fade, setFade] = useState<{ [screen: string]: boolean }>({})
  const [slideIndexes, setSlideIndexes] = useState<{ [screen: string]: number }>({})
  const [currentFocus, setCurrentFocus] = useState<'izquierda' | 'derecha' | null>('izquierda')
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const selectionColor = "#A5A5A5"

  let zona = searchParams.get("zona")
  if (!zona && typeof window !== "undefined") {
    try {
      zona = localStorage.getItem('selectedZone')
    } catch (e) {
      console.log("Error al leer zona del localStorage:", e)
    }
  }

  const [shouldAutoRedirect, setShouldAutoRedirect] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPantalla = localStorage.getItem('selectedPantalla')
        return savedPantalla !== null
      } catch {
        return false
      }
    }
    return false
  })
  
  useEffect(() => {
    try {
      const savedPantalla = localStorage.getItem('selectedPantalla')
      if (zona && savedPantalla && shouldAutoRedirect) {
        setIsAutoRedirecting(true)
        setTimeout(() => {
          router.push(`/reproductor?zona=${zona}&pantalla=${savedPantalla}`)
        }, 1500)
      }
    } catch (e) {
    }
  }, [zona, router, shouldAutoRedirect])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.1)
    } catch (error) {
      console.log("Error al reproducir sonido:", error)
    }
  }

  const filtrarImagenesPorPantalla = (imagenes: ImagenConDuracion[], pantalla: string): ImagenConDuracion[] => {
    console.log('Filtrando imágenes para pantalla:', pantalla, 'Total imágenes:', imagenes.length)
    
    if (pantalla === "izquierda") {
      const imagenesFiltradas = imagenes.filter(img => img.categoria === "precios")
      console.log('Imágenes para pantalla izquierda (precios):', imagenesFiltradas.length)
      return imagenesFiltradas
    } else if (pantalla === "derecha") {
      const imagenesFiltradas = imagenes.filter(img =>
        ["publicidad", "promociones", "eventos", "informativo"].includes(img.categoria)
      )
      console.log('Imágenes para pantalla derecha (otras):', imagenesFiltradas.length)
      return imagenesFiltradas
    }
    
    console.log('Sin filtro, retornando todas las imágenes')
    return imagenes
  }

  const cambiarImagen = (pantalla: string, imagenes: ImagenConDuracion[]) => {
    if (imagenes.length <= 1) return

    setFade(prev => ({ ...prev, [pantalla]: true }))
    
    setTimeout(() => {
      setSlideIndexes(prev => {
        const currentIndex = prev[pantalla] || 0
        const nextIndex = (currentIndex + 1) % imagenes.length
        return { ...prev, [pantalla]: nextIndex }
      })
      
      setTimeout(() => {
        setFade(prev => ({ ...prev, [pantalla]: false }))
      }, 350)
    }, 350)
  }

  useEffect(() => {
    if (!zona) {
      router.push('/seleccion-perfil')
      return
    }

    const cargarImagenes = async () => {
      try {
        setLoading(true)
        console.log('Cargando imágenes para zona:', zona)
        
        const response = await fetch(`/api/images?zona=${zona}`)
        const data = await response.json()
        
        console.log('Respuesta de API:', data)
        
        if (data.imagenes && Array.isArray(data.imagenes)) {
          setImages(data.imagenes)
          console.log('Imágenes cargadas:', data.imagenes.length)
        } else {
          console.log('No se encontraron imágenes o formato incorrecto')
          setImages([])
        }
      } catch (error) {
        console.error("Error al cargar imágenes:", error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    cargarImagenes()
  }, [zona, router])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          playBeep()
          setCurrentFocus('izquierda')
          break
        case 'ArrowRight':
          event.preventDefault()
          playBeep()
          setCurrentFocus('derecha')
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          playBeep()
          if (currentFocus) {
            const pantallaSeleccionada = currentFocus
            setSelectedScreen(pantallaSeleccionada)
            
            try {
              localStorage.setItem('selectedPantalla', pantallaSeleccionada)
            } catch (e) {
              console.log("Error al guardar pantalla en localStorage:", e)
            }
            
            router.push(`/reproductor?zona=${zona}&pantalla=${pantallaSeleccionada}`)
          }
          break
        case 'Escape':
          event.preventDefault()
          playBeep()
          router.push(`/seleccion-perfil`)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentFocus, zona, router])

  useEffect(() => {
    const interval = setInterval(() => {
      const imagenesIzquierda = filtrarImagenesPorPantalla(images, 'izquierda')
      const imagenesDerecha = filtrarImagenesPorPantalla(images, 'derecha')
      
      if (imagenesIzquierda.length > 1) {
        cambiarImagen('izquierda', imagenesIzquierda)
      }
      if (imagenesDerecha.length > 1) {
        cambiarImagen('derecha', imagenesDerecha)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [images])

  useEffect(() => {
    if (!zona) {
      router.push('/seleccion-perfil')
      return
    }

    setCurrentFocus(prev => prev ?? 'izquierda')
  }, [zona, router])

  if (shouldAutoRedirect || isAutoRedirecting) {
    return (
      <div className="min-h-screen bg-[#151515] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <LoaderCircle className="w-16 h-16 text-[#A5A5A5] animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!zona) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Redirigiendo...</div>
      </div>
    )
  }

  const imagenesIzquierda = filtrarImagenesPorPantalla(images, 'izquierda')
  const imagenesDerecha = filtrarImagenesPorPantalla(images, 'derecha')
  
  const currentIzquierda = slideIndexes['izquierda'] || 0
  const currentDerecha = slideIndexes['derecha'] || 0
  
  const imagenIzquierda = imagenesIzquierda[currentIzquierda] || null
  const imagenDerecha = imagenesDerecha[currentDerecha] || null

  console.log('Current focus:', currentFocus)
  console.log('Total imágenes cargadas:', images.length)
  console.log('Imágenes izquierda:', imagenesIzquierda.length, 'Current index:', currentIzquierda)
  console.log('Imágenes derecha:', imagenesDerecha.length, 'Current index:', currentDerecha)
  console.log('Imagen izquierda actual:', imagenIzquierda?.url)
  console.log('Imagen derecha actual:', imagenDerecha?.url)

  return (
         <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#1a1a1a" }}>
             <div className="flex flex-col items-center">
               <div className="flex items-center gap-8 lg:gap-12 mb-6">
        <div className="flex flex-col items-center">
          <div 
            className={`relative group cursor-pointer transition-all duration-300 ${
              currentFocus === 'izquierda' 
                ? 'scale-105' 
                : 'scale-100'
            }`}
            onClick={() => {
              playBeep()
              setCurrentFocus('izquierda')
            }}
            style={{
              filter:
                currentFocus === 'izquierda'
                  ? `drop-shadow(0 10px 25px ${selectionColor}40) drop-shadow(0 0 20px ${selectionColor}30)`
                  : undefined,
              boxShadow: currentFocus === 'izquierda' 
                ? `0 0 0 3px ${selectionColor}B0` 
                : undefined,
              borderRadius: currentFocus === 'izquierda' ? '8px' : undefined,
            }}
          >
             <div className="w-80 h-45 rounded-lg relative overflow-hidden min-h-[180px]">
              {imagenIzquierda ? (
                <img
                  src={imagenIzquierda.url}
                  alt={imagenIzquierda.titulo || "Contenido"}
                                     className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                     fade['izquierda'] ? 'opacity-0' : 'opacity-100'
                   }`}
                />
                               ) : (
                   <div className="w-full h-full bg-gray-800 flex items-center justify-center min-h-[180px]">
                     <div className="text-gray-400 text-center">
                       {loading ? "Cargando..." : images.length === 0 ? "Sin contenido para esta zona" : "Sin contenido para esta pantalla"}
                     </div>
                   </div>
                 )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center group-hover:bg-opacity-80 transition-all duration-300">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          </div>
                     <p className="text-gray-400 text-sm font-normal tracking-[0.2em] uppercase mt-4">PANTALLA IZQUIERDA</p>
        </div>

                 <div className="w-6 h-1 bg-gray-500 rounded-full"></div>

        <div className="flex flex-col items-center">
          <div 
            className={`relative group cursor-pointer transition-all duration-300 ${
              currentFocus === 'derecha' 
                ? 'scale-105' 
                : 'scale-100'
            }`}
            onClick={() => {
              playBeep()
              setCurrentFocus('derecha')
            }}
            style={{
              filter:
                currentFocus === 'derecha'
                  ? `drop-shadow(0 10px 25px ${selectionColor}40) drop-shadow(0 0 20px ${selectionColor}30)`
                  : undefined,
              boxShadow: currentFocus === 'derecha' 
                ? `0 0 0 3px ${selectionColor}B0` 
                : undefined,
              borderRadius: currentFocus === 'derecha' ? '8px' : undefined,
            }}
          >
             <div className="w-80 h-45 rounded-lg relative overflow-hidden min-h-[180px]">
               {imagenDerecha ? (
                 <img
                   src={imagenDerecha.url}
                   alt={imagenDerecha.titulo || "Contenido"}
                   className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                     fade['derecha'] ? 'opacity-0' : 'opacity-100'
                   }`}
                 />
               ) : (
                 <div className="w-full h-full bg-gray-800 flex items-center justify-center min-h-[180px]">
                   <div className="text-gray-400 text-center">
                     {loading ? "Cargando..." : images.length === 0 ? "Sin contenido para esta zona" : "Sin contenido para esta pantalla"}
                   </div>
                 </div>
               )}

               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-black bg-opacity-70 rounded-full flex items-center justify-center group-hover:bg-opacity-80 transition-all duration-300">
                   <Play className="w-6 h-6 text-white ml-1" fill="white" />
                 </div>
               </div>
             </div>
          </div>
                     <p className="text-gray-400 text-sm font-normal tracking-[0.2em] uppercase mt-4">PANTALLA DERECHA</p>
        </div>
               </div>

               <div className="text-center text-gray-500 text-xs mt-3">
                 <p>Usa las flechas del control remoto para navegar</p>
                 <p>Presiona ENTER para seleccionar</p>
               </div>
             </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="text-white text-xl">Cargando...</div>
    </div>
  )
}

export default function DualScreenComparison() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SeleccionPantallaContent />
    </Suspense>
  )
}
