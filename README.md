# Cosechas Screen Hub

Sistema de gestión de cartelera digital (Digital Signage) diseñado para maximizar la eficiencia operativa de las franquicias Cosechas. Permite la administración centralizada de contenidos en televisores, eliminando la necesidad de actualizaciones manuales con memorias USB.

## 🚀 Características Principales

- **Control Centralizado:** Gestiona el contenido de todas las tiendas desde un solo panel administrativo.
- **Reproductor Híbrido (Online/Offline):** El sistema descarga el contenido y sigue funcionando perfectamente aunque la tienda pierda la conexión a internet.
- **Soporte Multi-Plataforma:** Optimizado para funcionar en Smart TVs (Samsung Tizen, LG WebOS, Android TV) y cualquier navegador moderno.
- **Gestión de Pantallas:** Soporte para múltiples zonas por tienda (ej: Pantalla Menú, Pantalla Promociones) con contenido diferenciado.
- **Actualizaciones en Tiempo Real:** Cambia un precio o una imagen y se refleja en las tiendas en cuestión de minutos.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno enfocado en rendimiento y escalabilidad:

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Base de Datos & Auth:** [Supabase](https://supabase.com/)
- **Estilos:** Tailwind CSS + Shadcn/ui
- **Gestión de Medios:** Cloudinary / Supabase Storage
- **Lenguaje:** TypeScript

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- Node.js 18.17 o superior.
- Una cuenta activa en Supabase.

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd cosechas-screen-hub
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas pnpm (recomendado)
    pnpm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto basándote en el ejemplo. Necesitarás tus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Correr el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📦 Estructura del Proyecto

- `/app`: Rutas y páginas (Next.js App Router).
  - `/reproductor`: Lógica del reproductor de TV.
  - `/dashboard`: Panel de administración.
- `/components`: Componentes reutilizables de UI.
- `/lib`: Utilidades y configuración de clientes (Supabase).
- `/hooks`: Custom hooks para lógica compartida.

---
© 2024 Cosechas - Equipo de Tecnología Cosechas
