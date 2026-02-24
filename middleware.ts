import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/topic'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

