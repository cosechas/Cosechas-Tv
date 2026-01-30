import { NextResponse } from "next/server";

// Deshabilitado: no registrar reproducciones para evitar carga en BD
export async function POST() {
  return new NextResponse(null, { status: 204 });
}