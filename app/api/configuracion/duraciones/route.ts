import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DURACIONES_POR_DEFECTO = {
  precios: 3,
  publicidad: 5,
  promociones: 4,
  eventos: 6,
  informativo: 4,
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('configuracion_duraciones')
      .select('*')
      .single();

    if (error || !data) {
      console.log("No se encontró configuración en BD, usando valores por defecto");
      return NextResponse.json(DURACIONES_POR_DEFECTO);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/configuracion/duraciones:", error);
    return NextResponse.json(DURACIONES_POR_DEFECTO);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { duraciones } = await req.json();

    if (!duraciones || typeof duraciones !== 'object') {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const duracionesValidadas = Object.entries(duraciones).reduce((acc, [categoria, duracion]) => {
      const duracionNum = Number(duracion);
      acc[categoria] = Math.max(1, Math.min(30, duracionNum));
      return acc;
    }, {} as Record<string, number>);

    console.log("Configuración validada:", duracionesValidadas);
    
    const { created_at, updated_at, ...duracionesLimpias } = duracionesValidadas;
    
    const { data, error } = await supabase
      .from('configuracion_duraciones')
      .upsert({
        id: 1,
        ...duracionesLimpias,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error("Error al guardar en BD:", error);
      return NextResponse.json({ 
        error: "Error al guardar en base de datos",
        details: error.message
      }, { status: 500 });
    }

    console.log("Configuración guardada en BD:", data);
    
    return NextResponse.json({ 
      success: true, 
      duraciones: duracionesValidadas,
      message: "Configuración guardada correctamente en base de datos"
    });
  } catch (error) {
    console.error("Error en POST /api/configuracion/duraciones:", error);
    return NextResponse.json({ 
      error: "Error al procesar solicitud",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
} 