import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
            // Configuración de seguridad para cookies
            httpOnly: false, // Permitir acceso desde JavaScript para limpieza
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60, // 24 horas
          })
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
            // Configuración de seguridad para eliminar cookies
            httpOnly: false, // Permitir acceso desde JavaScript para limpieza
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
            expires: new Date(0),
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión y la ruta es /admin, redirigir a /auth
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Si hay sesión y la ruta es /admin, verificar el rol de administrador
  if (session && req.nextUrl.pathname.startsWith('/admin')) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    // Permitir acceso a crear-memorial para admin y cliente
    if (req.nextUrl.pathname.startsWith('/admin/crear-memorial')) {
      if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'cliente')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } else {
      // Para otras rutas de admin, solo permitir admin
      if (!roleData || roleData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
} 