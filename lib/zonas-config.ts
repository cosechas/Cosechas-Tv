export const zonaImages: Record<string, string> = {
  "antioquia": "/images/zonas/antioquia.png",
  "bolivar": "/images/zonas/valle-del-cauca-1.png", 
  "casanare": "/images/zonas/casanare.png",
  "cesar": "/images/zonas/cesar.png",
  "cordoba": "/images/zonas/cordoba.png",
  "cundinamarca": "/images/zonas/cundinamarca.png",
  "huila": "/images/zonas/huila.png",
  "cundinamarca": "/images/zonas/cundinamarca.png",
  "eje cafetero": "/images/zonas/eje-cafetero.png",
  "magdalena": "/images/zonas/magdalena.png",
  "santander" : "/images/zonas/santander.png",
  "valle del cauca": "/images/zonas/valle-del-cauca-2.png",
  
}

export const getZonaImage = (zonaNombre: string): string => {
  const normalizedName = zonaNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return zonaImages[normalizedName] || "/images/placeholder-zone.png"
}

export const getAvailableZonaImages = (): string[] => {
  return Object.values(zonaImages)
}
