"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, LoaderCircle } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface Tienda {
  id: string
  nombre: string
  codigo: string
  ciudad_id: string
  tipo_tienda: "Local" | "Burbuja"
  ciudades?: {
    id: string
    nombre: string
    codigo: string
  }
  pantallas_conectadas: number
}

export default function Component() {
  const [pin, setPin] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tienda, setTienda] = useState<Tienda | null>(null)
  const [success, setSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [lockRemainingMs, setLockRemainingMs] = useState(0)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const rawTienda = localStorage.getItem('selectedTienda')
        const savedZone = localStorage.getItem('selectedZone')
        return rawTienda !== null && savedZone !== null
      } catch {
        return false
      }
    }
    return false
  })
  const router = useRouter()

  // Referencias para los sonidos
  const moveSoundRef = useRef<HTMLAudioElement | null>(null)
  const selectSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar sonidos
  useEffect(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const createBeep = (frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      }
      
      moveSoundRef.current = {
        play: () => createBeep(800, 0.1),
        currentTime: 0
      } as any
      
      selectSoundRef.current = {
        play: () => createBeep(1200, 0.2),
        currentTime: 0
      } as any

      errorSoundRef.current = {
        play: () => createBeep(400, 0.3),
        currentTime: 0
      } as any
      
    } catch (e) {
      moveSoundRef.current = { play: () => {}, currentTime: 0 } as any
      selectSoundRef.current = { play: () => {}, currentTime: 0 } as any
      errorSoundRef.current = { play: () => {}, currentTime: 0 } as any
    }
  }, [])

  // Auto-login: si ya hay una tienda/zone guardadas, saltar la pantalla de PIN
  useEffect(() => {
    try {
      const rawTienda = localStorage.getItem('selectedTienda')
      const savedZone = localStorage.getItem('selectedZone')
      if (rawTienda && savedZone && isAutoRedirecting) {
        const savedTienda = JSON.parse(rawTienda)
        setTienda(savedTienda)
        // Tiempo más largo para que el loader se mantenga durante toda la secuencia
        setTimeout(() => {
          router.push(`/seleccion-pantalla?zona=${savedZone}`)
        }, 3000)
      }
    } catch {}
  }, [router, isAutoRedirecting])

  // Cargar estado de intentos/bloqueo desde localStorage
  useEffect(() => {
    try {
      const storedAttempts = Number(localStorage.getItem('pinAttempts') || '0')
      const storedLock = localStorage.getItem('pinLockUntil')
      setAttempts(Number.isFinite(storedAttempts) ? storedAttempts : 0)
      setLockUntil(storedLock ? Number(storedLock) : null)
    } catch (e) {
      // ignorar
    }
  }, [])

  // Actualizar cuenta atrás y liberar bloqueo cuando expire
  useEffect(() => {
    if (!lockUntil) {
      setLockRemainingMs(0)
      return
    }
    const update = () => {
      const remaining = Math.max(0, lockUntil - Date.now())
      setLockRemainingMs(remaining)
      if (remaining <= 0) {
        setLockUntil(null)
        setAttempts(0)
        try {
          localStorage.removeItem('pinLockUntil')
          localStorage.setItem('pinAttempts', '0')
        } catch {}
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [lockUntil])

  // Registrar Service Worker para cache offline
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Función simple para reproducir sonido
  const playSound = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } catch (e) {
      // Silenciar errores de audio
    }
  }

  // Navegación por teclado/control remoto
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si el input está enfocado, no interceptar las teclas
      if (document.activeElement?.tagName === 'INPUT') {
        return
      }

      // Función para enfocar el input si está desenfocado
      const focusInputIfNeeded = () => {
        if (!isInputFocused) {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement
          if (input) {
            input.focus()
            setIsInputFocused(true)
          }
        }
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          focusInputIfNeeded()
          playSound(moveSoundRef)
          break

        case 'ArrowRight':
          event.preventDefault()
          focusInputIfNeeded()
          playSound(moveSoundRef)
          break

        case 'ArrowUp':
          event.preventDefault()
          focusInputIfNeeded()
          playSound(moveSoundRef)
          break

        case 'ArrowDown':
          event.preventDefault()
          focusInputIfNeeded()
          playSound(moveSoundRef)
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          focusInputIfNeeded()
          if (pin.length === 4) {
            playSound(selectSoundRef)
            handlePinSubmit()
          }
          break

        case 'Escape':
          event.preventDefault()
          // Limpiar PIN
          setPin('')
          setError(null)
          setTienda(null)
          setSuccess(false)
          break

        case 'Backspace':
          event.preventDefault()
          focusInputIfNeeded()
          if (pin.length > 0) {
            setPin(pin.slice(0, -1))
          }
          break

        default:
          // Solo aceptar números
          if (/^\d$/.test(event.key)) {
            event.preventDefault()
            focusInputIfNeeded()
            if (pin.length < 4) {
              setPin(pin + event.key)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pin, isInputFocused])

  // Función para manejar el envío del PIN
  const handlePinSubmit = async () => {
    if (loading) return
    if (lockUntil && Date.now() < lockUntil) {
      const remainingMs = lockUntil - Date.now()
      const minutes = Math.floor(remainingMs / 60000)
      const seconds = Math.floor((remainingMs % 60000) / 1000)
      setError(`Demasiados intentos. Espera ${String(minutes).padStart(1,'0')}:${String(seconds).padStart(2,'0')} minutos.`)
      return
    }
    
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos')
      playSound(errorSoundRef)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tiendas/validar-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTienda(data.tienda)
        setSuccess(true)
        playSound(selectSoundRef)
        // Reiniciar intentos y bloqueo al éxito
        setAttempts(0)
        setLockUntil(null)
        try {
          localStorage.setItem('pinAttempts', '0')
          localStorage.removeItem('pinLockUntil')
        } catch {}
        
                 // Guardar información de la tienda y zona en localStorage
         try {
           localStorage.setItem('selectedTienda', JSON.stringify(data.tienda))
           localStorage.setItem('selectedZone', data.tienda.zona_id) // Guardar zona para compatibilidad
         } catch (e) {
           console.log("Error al guardar datos en localStorage:", e)
         }

         // Redirigir después de un breve delay para mostrar el éxito
         setTimeout(() => {
           router.push(`/seleccion-pantalla?zona=${data.tienda.zona_id}`)
         }, 2500)
      } else {
        setError(data.error || 'PIN inválido')
        playSound(errorSoundRef)
        setPin('')
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        try { localStorage.setItem('pinAttempts', String(newAttempts)) } catch {}
        if (newAttempts > 3) { // más de 3 intentos erróneos
          const until = Date.now() + 5 * 60 * 1000
          setLockUntil(until)
          try { localStorage.setItem('pinLockUntil', String(until)) } catch {}
        }
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.')
      playSound(errorSoundRef)
      console.error('Error al validar PIN:', err)
      setPin('')
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      try { localStorage.setItem('pinAttempts', String(newAttempts)) } catch {}
      if (newAttempts > 3) {
        const until = Date.now() + 5 * 60 * 1000
        setLockUntil(until)
        try { localStorage.setItem('pinLockUntil', String(until)) } catch {}
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar PIN
  const clearPin = () => {
    setPin('')
    setError(null)
    setTienda(null)
    setSuccess(false)
  }

  // Validación automática cuando se complete el PIN
  useEffect(() => {
    const isLocked = lockUntil !== null && Date.now() < lockUntil
    if (pin.length === 4 && !loading && !success && !isLocked) {
      // Pequeño delay para mejor UX
      const timer = setTimeout(() => {
        handlePinSubmit()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [pin, loading, success, lockUntil])

  // Quitar focus cuando se hace clic en otras partes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.pin-input-container') && !target.closest('input[type="text"]')) {
        setIsInputFocused(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const selectionColor = "#A5A5A5"

  // Mostrar loader durante auto-redirección
  if (isAutoRedirecting && tienda) {
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

  // Mostrar pantalla de éxito a pantalla completa (similar a dashboard/test)
  // y mantener la redirección existente mediante setTimeout en handlePinSubmit
  if (success && tienda) {
    return (
      <div className="min-h-screen bg-[#151515] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-0 flex justify-center">
            <img src="/images/checkmark-icon.png" alt="Blue checkmark icon" className="w-20 h-20" />
          </div>
          <h1 className="text-[#ffffff] text-4xl font-bold mb-2 tracking-wide">{tienda.nombre}</h1>
          <p className="text-[#7f7f7f] text-lg font-medium uppercase">{tienda.ciudades?.nombre}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
      style={{ backgroundColor: "#151515" }}
    >
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <img src="/images/tienda-icon.png" alt="Store icon" className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ingreso a Tienda</h1>
          <p className="text-gray-400 text-sm">Ingresa el PIN de 4 dígitos de tu tienda</p>
        </div>

        {/* Input del PIN personalizado */}
        <div className="mb-6 pin-input-container">
          <div className="flex gap-4">
            {Array.from({ length: 4 }, (_, index) => {
              const digit = pin[index] || ''
              const isActive = isInputFocused && index === pin.length
              const hasValue = digit !== ''
              
              return (
                <div
                  key={index}
                  className={`
                    w-20 h-20 border-2 rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-300 cursor-pointer
                    ${isActive
                      ? `border-[${selectionColor}] bg-[${selectionColor}]20 text-white`
                      : hasValue
                      ? 'border-gray-400 bg-gray-800 text-white'
                      : 'border-gray-600 bg-gray-900 text-gray-500'
                    }
                  `}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0 8px 20px ${selectionColor}50) drop-shadow(0 0 15px ${selectionColor}40)`
                      : undefined,
                    boxShadow: isActive 
                      ? `0 0 0 2px ${selectionColor}80` 
                      : undefined,
                  }}
                  onClick={() => {
                    // Enfocar el input cuando se hace clic en un dígito
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement
                    if (input) {
                      input.focus()
                      setIsInputFocused(true)
                    }
                  }}
                >
                  {digit || '•'}
                </div>
              )
            })}
          </div>
          
          {/* Input oculto para capturar el PIN */}
          <input
            type="text"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPin(value)
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && pin.length === 0) {
                e.preventDefault()
              }
            }}
            className="sr-only"
            autoComplete="off"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
          />
        </div>

        {/* Estado de validación */}
        {loading && (
          <div className="text-center mb-4">
            <div className="text-blue-400 text-sm">Validando PIN...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Mensaje de bloqueo con temporizador */}
        {lockUntil && Date.now() < lockUntil && (
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">
              Demasiados intentos. Espera {
                `${Math.floor(lockRemainingMs / 60000)}:${String(Math.floor((lockRemainingMs % 60000) / 1000)).padStart(2,'0')}`
              } minutos.
            </span>
          </div>
        )}

        {success && tienda && null}

        {/* Instrucciones para TV */}
        <div className="text-center text-gray-500 text-xs mt-2">
          <p>Usa las flechas del control remoto para navegar</p>
          <p>Ingresa números para completar el PIN</p>
        </div>
      </div>
    </div>
  )
}