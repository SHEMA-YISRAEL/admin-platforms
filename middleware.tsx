import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas públicas que no requieren autenticación
    const publicPaths = ['/login'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Si es una ruta pública, permitir el acceso
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Si es la ruta raíz /, redirigir a /topoquizz/content
    if (pathname === '/') {
        const redirectUrl = new URL('/topoquizz/content', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Rutas permitidas para topoquizz
    const allowedTopoquizzPaths = [
        '/topoquizz/content',
        '/topoquizz/dashboard',
        '/topoquizz/translate'
    ];

    // Rutas permitidas para neurapp
    const allowedNeurappPaths = [
        '/neurapp'
    ];

    const allAllowedPaths = [...allowedTopoquizzPaths, ...allowedNeurappPaths];

    // Verificar si la ruta actual está permitida
    const isAllowed = allAllowedPaths.some(path => pathname.startsWith(path));

    // Si no está permitida, redirigir a la primera ruta permitida
    if (!isAllowed && (pathname.startsWith('/topoquizz') || pathname.startsWith('/neurapp'))) {
        const redirectUrl = new URL('/topoquizz/content', request.url);
        return NextResponse.redirect(redirectUrl);
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