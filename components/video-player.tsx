"use client"
import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
}

export function VideoPlayer({ src, poster, className, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar el reproductor
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)

    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay was prevented
        setIsPlaying(false)
      })
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [autoPlay])

  // Controlar la reproducción
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Controlar el volumen
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Controlar la posición del video
  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    const video = videoRef.current
    if (!video) return

    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Controlar pantalla completa
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      enterFullscreen()
    } else {
      exitFullscreen()
    }
  }

  const enterFullscreen = () => {
    const element = containerRef.current
    if (!element) return

    let tried = false
    let success = false

    const tryFullscreen = () => {
      tried = true
      try {
        if (element.requestFullscreen) {
          element.requestFullscreen()
          success = true
        } else if ((element as any).webkitRequestFullscreen) {
          ;(element as any).webkitRequestFullscreen()
          success = true
        } else if ((element as any).mozRequestFullScreen) {
          ;(element as any).mozRequestFullScreen()
          success = true
        } else if ((element as any).msRequestFullscreen) {
          ;(element as any).msRequestFullscreen()
          success = true
        } else {
          tried = false
        }
      } catch (e) {
        console.log("Error en fullscreen estándar:", e)
        tried = false
      }
    }

    const ua = navigator.userAgent.toLowerCase()

    // Samsung Tizen
    if ((window as any).webapis && (window as any).webapis.avplay) {
      try {
        ;(window as any).webapis.avplay.setDisplayRect(0, 0, screen.width, screen.height)
        success = true
        tried = true
      } catch (e) {
        console.log("Samsung Tizen API no disponible")
      }
    }

    // LG webOS
    if (ua.includes("webos") || ua.includes("lg")) {
      try {
        if ((window as any).webOS && (window as any).webOS.platform && (window as any).webOS.platform.fullscreen) {
          ;(window as any).webOS.platform.fullscreen()
          success = true
          tried = true
        }
      } catch (e) {
        console.log("LG webOS fullscreen no soportado")
      }
    }

    // Hisense Vidaa
    if (ua.includes("hisense") || ua.includes("vidaa")) {
      try {
        if ((window as any).VIDAA && (window as any).VIDAA.fullscreen) {
          ;(window as any).VIDAA.fullscreen()
          success = true
          tried = true
        }
      } catch (e) {
        console.log("Hisense Vidaa fullscreen no soportado")
      }
    }

    // Opera TV
    if (ua.includes("opera") && ua.includes("tv")) {
      try {
        if ((window as any).opera && (window as any).opera.fullscreen) {
          ;(window as any).opera.fullscreen()
          success = true
          tried = true
        }
      } catch (e) {
        console.log("Opera TV fullscreen no soportado")
      }
    }

    if (!tried) {
      tryFullscreen()
    }

    // Hacks adicionales para navegadores que no soportan fullscreen
    if (!success) {
      try {
        window.moveTo(0, 0)
        window.resizeTo(screen.width, screen.height)
        document.documentElement.style.overflow = "hidden"
        document.body.style.overflow = "hidden"
      } catch (e) {
        console.log("Resize/overflow no soportado")
      }
    }
  }

  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        ;(document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
    } catch (e) {
      console.log("Error al salir de fullscreen:", e)
    }

    // Restaurar estado normal
    try {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    } catch (e) {
      console.log("Error al restaurar overflow")
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        (window.innerHeight === screen.height && window.innerWidth === screen.width) ||
        (window.outerHeight === screen.height && window.outerWidth === screen.width)
      )
      setIsFullscreen(fullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    // Event listeners para teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 para pantalla completa
      if (e.key === "F11") {
        e.preventDefault()
        toggleFullscreen()
      }
      // F para pantalla completa (como YouTube)
      if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        toggleFullscreen()
      }
      // Esc para salir de pantalla completa
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  // Mostrar/ocultar controles automáticamente
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  // Formatear tiempo
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative group overflow-hidden rounded-lg bg-black", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay para play/pause al hacer clic */}
      <div className="absolute inset-0 bg-transparent cursor-pointer" onClick={togglePlay} />

      {/* Controles */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Barra de progreso */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.01}
          onValueChange={handleSeek}
          className="mb-4"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <span className="text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Indicador de carga */}
      {!duration && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
      )}
    </div>
  )
}
