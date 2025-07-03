import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from '@/lib/auth-context'
import AuthDebug from '@/components/admin/AuthDebug'
import CookieDebug from '@/components/admin/CookieDebug'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Funeraria",
  description: "Sistema de gestión funeraria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          {/* Componentes de debug - solo visibles en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <AuthDebug />
              <CookieDebug />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
