import { NextRequest, NextResponse } from "next/server";

// Definir los roles disponibles
type UserRole = 'translator';
// Roles futuros: 'admin' | 'editor' | 'viewer' | etc.

// Definir permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
    'translator': ['/topoquizz/translate'],
    // Agregar más roles aquí en el futuro:
    // 'admin': ['/topoquizz/content', '/topoquizz/dashboard', '/topoquizz/translate', '/neurapp'],
    // 'editor': ['/topoquizz/content', '/topoquizz/translate'],
    // 'viewer': ['/topoquizz/content']
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas públicas que no requieren autenticación
    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Si es una ruta pública, permitir el acceso
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Obtener el rol del usuario desde las cookies
    const userRole = request.cookies.get('userRole')?.value as UserRole | undefined;
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated || !userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar si el rol existe en los permisos
    if (!rolePermissions[userRole]) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Obtener las rutas permitidas para el rol del usuario
    const allowedPaths = rolePermissions[userRole];

    // Si es la ruta raíz /, redirigir a la primera ruta permitida del usuario
    if (pathname === '/') {
        const defaultPath = allowedPaths[0] || '/login';
        return NextResponse.redirect(new URL(defaultPath, request.url));
    }

    // Verificar si el usuario tiene acceso a la ruta actual
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path));

    // Si intenta acceder a una ruta protegida sin permisos
    if (!hasAccess && (pathname.startsWith('/topoquizz') || pathname.startsWith('/neurapp'))) {
        // Redirigir a la primera ruta permitida para su rol
        const defaultPath = allowedPaths[0] || '/login';
        return NextResponse.redirect(new URL(defaultPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/topoquizz/:path*',
        '/neurapp/:path*'
    ]
}