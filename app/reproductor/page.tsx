"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

interface ImagenConDuracion {
  id: string
  titulo: string
  categoria: string
  url: string
  duracion: number
}

interface ConfiguracionDuraciones {
  precios: number
  publicidad: number
  promociones: number
  eventos: number
  informativo: number
}

interface ApiResponse {
  imagenes: ImagenConDuracion[]
  configuracion: ConfiguracionDuraciones
}

const CONFIGURACION_POR_DEFECTO: ConfiguracionDuraciones = {
  precios: 3,
  publicidad: 5,
  promociones: 4,
  eventos: 6,
  informativo: 4,
}

const APP_VERSION = 'v1.2-heartbeat-fix';

export function ImagePlayer() {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [cacheStatus, setCacheStatus] = useState("Cargando...")

  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const connectivityCheckRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [images, setImages] = useState<ImagenConDuracion[]>([])
  const [configuracion, setConfiguracion] = useState<ConfiguracionDuraciones>(CONFIGURACION_POR_DEFECTO)
  const [fade, setFade] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const searchParams = useSearchParams();
  let zona = searchParams.get("zona");
  if (!zona && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    zona = params.get("zona");
  }
  
  let pantalla = searchParams.get("pantalla");
  if (!pantalla && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    pantalla = params.get("pantalla");
  }
  if (!pantalla && typeof window !== "undefined") {
    try {
      pantalla = localStorage.getItem('selectedPantalla')
    } catch (e) {
      console.log("Error al leer pantalla del localStorage:", e)
    }
  }
  
  const imagenesCacheKey = zona && pantalla ? `imagenes_cache_zona_${zona}_pantalla_${pantalla}` : 'imagenes_cache';
  console.log('[REPRODUCTOR] Zona detectada:', zona);
  console.log('[REPRODUCTOR] Pantalla detectada:', pantalla);
  console.log('[REPRODUCTOR] Clave de cache usada:', imagenesCacheKey);

  useEffect(() => {
    if (!zona) {
      router.push('/seleccion-perfil')
      return
    }
    if (!pantalla) {
      router.push(`/seleccion-pantalla?zona=${zona}`)
      return
    }
  }, [zona, pantalla, router])

  useEffect(() => {
    const checkAndReload = async () => {
      try {
        const storedVersion = localStorage.getItem('app_version');
        
        if (storedVersion !== APP_VERSION) {
          console.log(`[VERSION] Actualizando: ${storedVersion} -> ${APP_VERSION}`);
          
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
              console.log('[VERSION] Service Worker desregistrado');
            }
          }
          
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(name => {
                console.log(`[VERSION] Borrando cache: ${name}`);
                return caches.delete(name);
              })
            );
          }

          localStorage.setItem('app_version', APP_VERSION);
          console.log('[VERSION] Recargando página...');
          window.location.reload();
        } else {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
              registration.update();
              console.log('[SW] Service Worker registrado y verificado');
            }).catch(err => {
              console.error('[SW] Error al registrar:', err);
            });
          }
        }
      } catch (e) {
        console.error('[VERSION] Error en proceso de actualización:', e);
      }
    };

    checkAndReload();
    
    const updateInterval = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, []);

  if (!zona || !pantalla) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Redirigiendo...</div>
      </div>
    )
  }

  const ciclosKey = zona ? `ciclos_completos_zona_${zona}` : 'ciclos_completos';
  const getCiclosCompletos = () => {
    try {
      return parseInt(localStorage.getItem(ciclosKey) || '0', 10);
    } catch {
      return 0;
    }
  };
  const setCiclosCompletos = (valor: number) => {
    try {
      localStorage.setItem(ciclosKey, valor.toString());
    } catch {}
  };

  const cargarImagenesLocal = () => {
    try {
      const data = localStorage.getItem(imagenesCacheKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [];
  };

  const guardarImagenesLocal = (imagenes: ImagenConDuracion[]) => {
    try {
      localStorage.setItem(imagenesCacheKey, JSON.stringify(imagenes));
    } catch {}
  };

  const getDuracion = (categoria: string): number => {
    try {
      const valor = configuracion?.[categoria as keyof ConfiguracionDuraciones]
      return typeof valor === 'number' && valor > 0 ? valor : 4
    } catch {
      return 4
    }
  }

  const filtrarImagenesPorPantalla = (imagenes: ImagenConDuracion[]): ImagenConDuracion[] => {
    if (!pantalla) return imagenes
    
    if (pantalla === "izquierda") {
      return imagenes.filter(img => img.categoria === "precios")
    } else if (pantalla === "derecha") {
      return imagenes.filter(img => 
        ["publicidad", "promociones", "eventos", "informativo"].includes(img.categoria)
      )
    }
    
    return imagenes
  }

  const cargarConfiguracionLocal = (): ConfiguracionDuraciones => {
    try {
      const savedConfig = localStorage.getItem('duraciones_config')
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        return { ...CONFIGURACION_POR_DEFECTO, ...parsedConfig }
      }
    } catch (error) {
      console.log("Error al cargar configuración local:", error)
    }
    return CONFIGURACION_POR_DEFECTO
  }

  const normalizarDuracionesPorConfiguracion = (imagenes: ImagenConDuracion[]): ImagenConDuracion[] => {
    return imagenes.map(img => ({
      ...img,
      duracion: img.categoria ? getDuracion(img.categoria) : (img.duracion || 4)
    }))
  }

  const guardarConfiguracionLocal = (config: ConfiguracionDuraciones) => {
    try {
      localStorage.setItem('duraciones_config', JSON.stringify(config))
    } catch (error) {
      console.log("Error al guardar configuración local:", error)
    }
  }

  const checkRealConnectivity = async (): Promise<boolean> => {
    const testUrls = [
      "https://www.google.com/favicon.ico",
      "https://httpbin.org/status/200",
      "https://www.cloudflare.com/favicon.ico",
      "https://www.apple.com/favicon.ico",
      "https://www.microsoft.com/favicon.ico",
    ]

    for (const url of testUrls) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        console.log(`Conectividad verificada con: ${url}`)
        return true
      } catch (error) {
        console.log(`Error verificando ${url}:`, error)
        continue
      }
    }

    console.log("No se pudo verificar conectividad con ningún servicio")
    return false
  }

  const updateConnectionStatus = async () => {
    try {
      const realConnectivity = await Promise.race([
        checkRealConnectivity(),
        new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
      ])
      setIsOnline(realConnectivity)
    } catch (error) {
      console.log("Error en verificación de conectividad:", error)
      setIsOnline(false)
    } finally {
      setConnectionChecked(true)
    }
  }

  const preloadImages = async () => {
    if (!images.length) return;
    const promises = images.map((img) => {
      return new Promise<void>((resolve, reject) => {
        const imgElement = new window.Image();
        imgElement.onload = () => resolve();
        imgElement.onerror = () => reject(new Error(`Error al cargar: ${img.url}`));
        imgElement.src = img.url;
      });
    });

    try {
      await Promise.all(promises);
      console.log("Todas las imágenes precargadas");
      setCacheStatus("Imágenes listas");
      setImagesLoaded(true);
      setTimeout(() => {
        setCacheStatus("");
      }, 3000);
    } catch (error) {
      console.log("Error al precargar:", error);
      setCacheStatus("Error en precarga");
    }
  };

  const enterFullscreen = () => {
    const element = document.getElementById('playerContainer') || document.documentElement
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

    if (!success) {
    try {
      window.moveTo(0, 0)
      window.resizeTo(screen.width, screen.height)
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
      if ((window as any).navigator && (window as any).navigator.setAppBadge) {
        ;(window as any).navigator.setAppBadge(0)
      }
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

    try {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    } catch (e) {
      console.log("Error al restaurar overflow")
    }
  }

  const keepScreenAwake = () => {
    try {
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then((wakeLock) => {
          console.log('Wake Lock activado para mantener pantalla encendida')
          ;(window as any).currentWakeLock = wakeLock
        }).catch((err) => {
          console.log('Wake Lock no disponible:', err)
        })
      }

      if ((window as any).webapis && (window as any).webapis.power) {
        try {
          ;(window as any).webapis.power.request('SCREEN', 'SCREEN_NORMAL')
        } catch (e) {
          console.log('Samsung Tizen power API no disponible')
        }
      }

      if ((window as any).webOS && (window as any).webOS.platform) {
        try {
          ;(window as any).webOS.platform.keepScreenOn()
        } catch (e) {
          console.log('LG webOS keepScreenOn no disponible')
        }
      }

      if ((window as any).VIDAA && (window as any).VIDAA.keepAwake) {
        try {
          ;(window as any).VIDAA.keepAwake()
        } catch (e) {
          console.log('Hisense Vidaa keepAwake no disponible')
        }
      }

      if ((window as any).opera && (window as any).opera.keepAwake) {
        try {
          ;(window as any).opera.keepAwake()
        } catch (e) {
          console.log('Opera TV keepAwake no disponible')
        }
      }

      const activityInterval = setInterval(() => {
        try {
          const event = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
          })
          document.dispatchEvent(event)

          const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
              identifier: Date.now(),
              target: document.body,
              clientX: Math.random() * window.innerWidth,
              clientY: Math.random() * window.innerHeight,
              pageX: Math.random() * window.innerWidth,
              pageY: Math.random() * window.innerHeight,
              radiusX: 1,
              radiusY: 1,
              rotationAngle: 0,
              force: 1
            })]
          })
          document.dispatchEvent(touchEvent)

          const keyEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'F12',
            code: 'F12'
          })
          document.dispatchEvent(keyEvent)
        } catch (e) {
          console.log('Error simulando actividad:', e)
        }
      }, 30000)

      ;(window as any).activityInterval = activityInterval

      const titleInterval = setInterval(() => {
        try {
          const currentTitle = document.title
          document.title = currentTitle === 'Cosechas Screen Hub' ? 'Cosechas Screen Hub.' : 'Cosechas Screen Hub'
        } catch (e) {
          console.log('Error cambiando título:', e)
        }
      }, 60000)

      ;(window as any).titleInterval = titleInterval

    } catch (e) {
      console.log('Error al activar keepScreenAwake:', e)
    }
  }

  const releaseScreenAwake = () => {
    try {
      if ((window as any).currentWakeLock) {
        ;(window as any).currentWakeLock.release()
        ;(window as any).currentWakeLock = null
      }

      if ((window as any).activityInterval) {
        clearInterval((window as any).activityInterval)
        ;(window as any).activityInterval = null
      }

      if ((window as any).titleInterval) {
        clearInterval((window as any).titleInterval)
        ;(window as any).titleInterval = null
      }
    } catch (e) {
      console.log('Error liberando keepScreenAwake:', e)
    }
  }

  const checkFullscreenStatus = () => {
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

  const cambiarImagen = () => {
    if (images.length === 0) return;
    
    let safeIndex = currentImageIndex;
    if (safeIndex >= images.length) {
      setCurrentImageIndex(0);
      safeIndex = 0;
    }
    const imagenActual = images[safeIndex];
    if (!imagenActual) return;
    
    let duracion = undefined as number | undefined;
    try {
      if (imagenActual?.categoria) {
        duracion = getDuracion(imagenActual.categoria);
      }
    } catch {}
    if (!duracion || duracion <= 0) {
      duracion = (imagenActual?.duracion ?? 4) || 4;
    }
    
    const duracionMs = duracion * 1000;
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    
    intervalRef.current = setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, duracionMs);
  };

  useEffect(() => {
    if (!imagesLoaded || images.length === 0) return;

    cambiarImagen();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentImageIndex, imagesLoaded, images, configuracion]);

  useEffect(() => {
    if (imagesLoaded && connectionChecked) {
      setIsReady(true)
      keepScreenAwake()
    }
  }, [imagesLoaded, connectionChecked])

  const forceMasterRefresh = async (newZona: string, syncVersion: string) => {
    console.log(`[SYNC] Iniciando Refresco Maestro... Zona=${newZona}, Versión=${syncVersion}`);
    
    // 1. Limpiar localStorage de imágenes y metadatos
    try {
      localStorage.removeItem(imagenesCacheKey);
      localStorage.setItem('last_sync_version', syncVersion);
      
      const rawTienda = localStorage.getItem('selectedTienda');
      if (rawTienda) {
        const tienda = JSON.parse(rawTienda);
        const updatedTienda = { ...tienda, ciudad_id: newZona, zona_id: newZona };
        localStorage.setItem('selectedTienda', JSON.stringify(updatedTienda));
      }
      localStorage.setItem('selectedZone', newZona);
      console.log('[SYNC] LocalStorage actualizado');
    } catch (e) {
      console.error('[SYNC] Error en localStorage:', e);
    }

    // 2. Desregistrar Service Workers (sin tocar sw.js)
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('[SYNC] Service Worker desregistrado');
        }
      } catch (e) {
        console.error('[SYNC] Error en SW:', e);
      }
    }

    // 3. Borrar Caches físicos de la API y del Navegador
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => {
            console.log(`[SYNC] Borrando cache: ${name}`);
            return caches.delete(name);
          })
        );
      } catch (e) {
        console.error('[SYNC] Error en caches:', e);
      }
    }

    // 4. Redirigir con Bust-Cache (evita cache de red del navegador)
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('zona', newZona);
    newParams.set('t', new Date().getTime().toString());
    
    console.log('[SYNC] Reiniciando con parámetros limpios...');
    window.location.search = newParams.toString();
  };

  useEffect(() => {
    const sendHeartbeat = async () => {
      if (!isOnline) return
      
      try {
        const rawTienda = localStorage.getItem('selectedTienda')
        if (!rawTienda) return
        
        const tienda = JSON.parse(rawTienda)
        if (!tienda?.id) return

        const response = await fetch('/api/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tienda_id: tienda.id,
            pantalla: pantalla,
            is_online: true
          }),
        })

        if (response.ok) {
          const data = await response.json()
          
          // Sincronización automática de ciudad/zona y versión de contenido
          const lastSyncVersion = localStorage.getItem('last_sync_version')
          
          const hayCambioCiudad = data.ciudad_id && data.ciudad_id !== zona
          const hayNuevaVersion = data.sync_version && data.sync_version !== lastSyncVersion

          if (hayCambioCiudad || hayNuevaVersion) {
            console.log(`[SYNC] Cambio detectado: Ciudad=${hayCambioCiudad}, Versión=${hayNuevaVersion}`)
            await forceMasterRefresh(data.ciudad_id || (zona as string), data.sync_version)
          }
        }
      } catch (error) {
        console.error('Error sending heartbeat or syncing:', error)
      }
    }

    if (isOnline) sendHeartbeat()
    
    const interval = setInterval(sendHeartbeat, 180000)
    return () => clearInterval(interval)
  }, [isOnline, pantalla])

  useEffect(() => {
    setImagesLoaded(false)
    setCacheStatus("Cargando...")
    
    const configLocal = cargarConfiguracionLocal()
    setConfiguracion(configLocal)
    
    ;(async () => {
      try {
        const res = await fetch('/api/configuracion/duraciones', { cache: 'no-store' })
        if (res.ok) {
          const cfg = await res.json()
          setConfiguracion(cfg)
          guardarConfiguracionLocal(cfg)
        }
      } catch {}
    })()
    
    const cargarImagenes = async () => {
      const imagenesLocales = cargarImagenesLocal();
      if (imagenesLocales.length > 0) {
        const imagenesFiltradas = filtrarImagenesPorPantalla(normalizarDuracionesPorConfiguracion(imagenesLocales));
        setImages(imagenesFiltradas);
        setImagesLoaded(true);
        setCacheStatus(`Imágenes cargadas de cache local (${imagenesFiltradas.length} para pantalla ${pantalla})`);
      }

      try {
        const response = await fetch(`/api/images${zona ? `?zona=${zona}` : ""}`);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          const imagenesFiltradas = filtrarImagenesPorPantalla(normalizarDuracionesPorConfiguracion(data.imagenes));
          setImages(imagenesFiltradas);
          guardarImagenesLocal(imagenesFiltradas);
          setCacheStatus(`Imágenes cargadas de la API (${imagenesFiltradas.length} para pantalla ${pantalla})`);
          if ('serviceWorker' in navigator) {
            const urls = imagenesFiltradas.map(img => img.url);
            navigator.serviceWorker.ready.then(registration => {
              if (registration.active) {
                registration.active.postMessage({
                  type: 'CACHE_IMAGES',
                  images: urls
                });
              }
            });
          }
          setImagesLoaded(true);
        } else {
          throw new Error("API error");
        }
      } catch {
        setCacheStatus("No se pudieron cargar imágenes (usando versión local si existe)");
        if (images.length === 0) {
        }
      }
    };

    cargarImagenes();
    preloadImages()
    updateConnectionStatus()

    connectivityCheckRef.current = setInterval(updateConnectionStatus, 10000)

    const handleFullscreenChange = () => checkFullscreenStatus()

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    const handleOnline = () => updateConnectionStatus()
    const handleOffline = () => updateConnectionStatus()

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        if (!isFullscreen) {
          enterFullscreen()
        } else {
          exitFullscreen()
        }
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        if (!isFullscreen) {
          enterFullscreen()
        } else {
          exitFullscreen()
        }
      }
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const autoFullscreen = localStorage.getItem('autoFullscreen') === 'true'
    if (autoFullscreen && !isFullscreen && isReady) {
      const handleFirstInteraction = () => {
        enterFullscreen()
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
      }
      document.addEventListener('click', handleFirstInteraction)
      document.addEventListener('keydown', handleFirstInteraction)
    }

    return () => {
      if (connectivityCheckRef.current) {
        clearInterval(connectivityCheckRef.current)
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
      releaseScreenAwake()
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [zona, isReady, isFullscreen]);

  useEffect(() => {
    if (images.length > 0) {
      preloadImages();
      try {
        localStorage.setItem(imagenesCacheKey, JSON.stringify(images))
        console.log('[REPRODUCTOR] Imágenes guardadas en cache local con clave', imagenesCacheKey, images);
      } catch (error) {
        console.log("[REPRODUCTOR] Error al guardar imágenes en cache", error)
      }
    } else {
      console.log('[REPRODUCTOR] No se guarda cache porque images está vacío.');
    }
  }, [images]);

  useEffect(() => {
    if (!imagesLoaded) return;
    setFade(true);
    const timeout = setTimeout(() => setFade(false), 400);
    return () => clearTimeout(timeout);
  }, [currentImageIndex, imagesLoaded]);

  useEffect(() => {
    if (!zona || !isOnline) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/images?zona=${zona}`)
        if (response.ok) {
          const data: ApiResponse = await response.json()
          const imagenesFiltradas = filtrarImagenesPorPantalla(normalizarDuracionesPorConfiguracion(data.imagenes));
          if (Array.isArray(imagenesFiltradas) && JSON.stringify(imagenesFiltradas) !== JSON.stringify(images)) {
            setImages(imagenesFiltradas);
            setImagesLoaded(false);
            setCacheStatus(`Actualizando imágenes... (${imagenesFiltradas.length} para pantalla ${pantalla})`);
            if ('serviceWorker' in navigator) {
              const urls = imagenesFiltradas.map(img => img.url);
              console.log('Enviando imágenes al SW:', urls);
              navigator.serviceWorker.ready.then(registration => {
                if (registration.active) {
                  registration.active.postMessage({
                    type: 'CACHE_IMAGES',
                    images: urls
                  });
                }
              });
            }
          }
        }
        try {
          const resCfg = await fetch('/api/configuracion/duraciones', { cache: 'no-store' })
          if (resCfg.ok) {
            const cfg = await resCfg.json()
            if (JSON.stringify(cfg) !== JSON.stringify(configuracion)) {
              setConfiguracion(cfg)
              guardarConfiguracionLocal(cfg)
            }
          }
        } catch {}
      } catch (error) {
        console.log("Error en polling de imágenes:", error)
      }
    }, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, [zona, images, isOnline, pantalla]);

  useEffect(() => {
    if (!imagesLoaded || images.length === 0 || !zona) return;
    if (currentImageIndex === images.length - 1) {
      const timeout = setTimeout(() => {
        const ciclos = getCiclosCompletos();
        setCiclosCompletos(ciclos + 1);
        console.log(`[REPRODUCTOR] Ciclo completo registrado para zona ${zona}. Total acumulado:`, ciclos + 1);
      }, getDuracion(images[images.length - 1].categoria) * 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentImageIndex, imagesLoaded, images, zona]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CACHE_READY') {
          setCacheStatus('Cache listo');
          setTimeout(() => setCacheStatus(''), 3000);
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, []);

  const registrarReproduccion = (_zona: string, _url: string) => {
    return;
  };

  useEffect(() => {}, []);

  useEffect(() => {}, [currentImageIndex, imagesLoaded, zona]);
  useEffect(() => {}, [zona]);

  const handleContainerClick = () => {
    if (!isFullscreen) {
      enterFullscreen()
    }
  }

  return (
    <div className="image-player">
      {/* Loader central */}
      {!isReady && (
        <div className="loader-center">
          Cargando...
        </div>
      )}
      {/* Contenido principal*/}
      {isReady && (
        <>
          {/* Contenedor principal */}
          <div className="image-container" onClick={handleContainerClick}>
            {images.length === 0 && (
              <div className="loader-center">
                No hay contenido para {pantalla === "izquierda" ? "precios" : "publicidad"} en esta zona
              </div>
            )}
            {images.map((img, index) => (
              <img
                key={img.id}
                src={img.url || "/placeholder.svg"}
                alt={img.titulo || `Imagen ${index + 1}`}
                className={`slideshow-image ${index === currentImageIndex ? "active" : ""} ${index === currentImageIndex && fade ? "fade" : ""}`}
                style={{ 
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0
                }}
              />
            ))}


          </div>

          {/* Indicadores de estado */}
          {cacheStatus && (
            <div id="cacheStatus" className={cacheStatus ? "visible" : ""}>
              {cacheStatus}
            </div>
          )}

          <div id="connectionStatus" className={`connection-status ${isOnline ? "online" : "offline"}`}>
            <span className={`status-dot ${isOnline ? "online-dot" : "offline-dot"} radar`} />
          </div>
        </>
      )}
      <style jsx>{`
        .image-player {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .loader-center {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 2rem;
          background: rgba(0,0,0,0.7);
          padding: 2rem 3rem;
          border-radius: 1rem;
          z-index: 2000;
        }
        .image-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          cursor: pointer;
        }

        :global(.slideshow-image) {
          opacity: 0;
          transition: opacity 0.7s ease-in-out;
          position: absolute !important;
        }

        :global(.slideshow-image.active) {
          opacity: 1;
        }

        :global(.slideshow-image.fade) {
          transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1);
        }



        /* Estilos para modo fullscreen */
        :fullscreen {
          background-color: black;
        }

        :-webkit-full-screen {
          background-color: black;
        }

        :-moz-full-screen {
          background-color: black;
        }

        :-ms-fullscreen {
          background-color: black;
        }



        /* Asegurar que el contenedor ocupe toda la pantalla en fullscreen */
        :fullscreen #playerContainer,
        :-webkit-full-screen #playerContainer,
        :-moz-full-screen #playerContainer,
        :-ms-fullscreen #playerContainer {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 9999 !important;
        }

        #cacheStatus {
          position: fixed;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 1001;
          transition: opacity 0.3s;
          opacity: 1;
        }

        #cacheStatus:not(.visible) {
          opacity: 0;
        }

        .connection-status {
          position: fixed;
          top: 18px;
          left: 18px;
          z-index: 1001;
          background: none;
          padding: 0;
          min-width: 0;
          box-shadow: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 0 8px rgba(0,0,0,0.2);
        }
        .online-dot {
          background: linear-gradient(135deg, #00ff6a 60%, #00c853 100%);
          border: 2px solid #00c853;
        }
        .offline-dot {
          background: linear-gradient(135deg, #ff3b3b 60%, #b71c1c 100%);
          border: 2px solid #b71c1c;
        }
        .radar::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.5;
          animation: radar-pulse 1.5s infinite;
          z-index: -1;
          background: inherit;
        }
        .online-dot.radar::after {
          box-shadow: 0 0 0 0 #00ff6a;
        }
        .offline-dot.radar::after {
          box-shadow: 0 0 0 0 #ff3b3b;
        }
        @keyframes radar-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          70% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }


      `}</style>
    </div>
  );
}

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Cargando reproductor...</div>}>
      <ImagePlayer />
    </Suspense>
  );
}
