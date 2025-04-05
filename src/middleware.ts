import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req;
    const token = req.nextauth.token; // Extraer el token de la sesión

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/login', '/auth/register'];

    // Verificar si la ruta actual es pública
    if (publicRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
      return NextResponse.next(); // Permitir acceso sin validación adicional
    }

    // Si no hay token y la ruta no es pública, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl));
    }

    const userLevel = (token.role as { level: number }).level; // Nivel del usuario

    // Definir niveles mínimos de acceso para cada ruta
    const levelBasedAccess = {
      '/admin': 5, // Solo usuarios con nivel >= 90 pueden acceder
      '/dashboard': 1, // Usuarios con nivel >= 10 pueden acceder
      '/settings': 5, // Solo usuarios con nivel >= 50 pueden acceder
      '/comunidades': 2, // Usuarios con nivel >= 2 pueden acceder
      '/edificios': 2, // Usuarios con nivel >= 2 pueden acceder
      '/documentos': 2, // Usuarios con nivel >= 2 pueden acceder
      '/avisos': 2, // Usuarios con nivel >= 2 pueden acceder
    };

    // Verificar si el usuario tiene acceso a la ruta
    const hasAccess = Object.entries(levelBasedAccess).some(([path, minLevel]) => {
      return nextUrl.pathname.startsWith(path) && userLevel >= minLevel;
    });

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/error/access-denied', nextUrl));
    }

    // Si pasa las validaciones, continuar con la solicitud
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Solo permite acceso si hay token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*', // Proteger todas las rutas bajo /dashboard
    '/admin/:path*', // Proteger todas las rutas bajo /admin
    '/settings/:path*', // Proteger todas las rutas bajo /settings
    '/comunidades/:path*', // Proteger todas las rutas bajo /comunidades
    '/edificios/:path*', // Proteger todas las rutas bajo /comunidades
    '/documentos/:path*', // Proteger todas las rutas bajo /comunidades
    '/avisos/:path*', // Proteger todas las rutas bajo /comunidades
  ],
};