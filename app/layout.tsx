import type { Metadata } from 'next'
import './globals.css'
import {Geist,Geist_Mono} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: 'Cosechas Principal',
  description: 'Created by yafran.exe',
  icons: {
    icon: [
      { url: '/favicon_smartv.png', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/favicon_smartv.png', sizes: '126x126', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/icon-1440.png', sizes: '1440x1440', type: 'image/png' },
      { url: '/icon-1920.png', sizes: '1920x1920', type: 'image/png' },
      { url: '/icon-4k.png', sizes: '3840x3840', type: 'image/png' },
    ],
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans ${geistMono.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
