import { NextRequest, NextResponse} from "next/server";


export function middleware(request: NextRequest){
    const {pathname}= request.nextUrl

    // Rutas permitidas
    const allowedPaths = ['/topoquizz/content', '/topoquizz/dashboard']
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path))
    if (!isAllowed) {
        const redirectUrl = new URL('/topoquizz/content', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/topoquizz/:path*']
}