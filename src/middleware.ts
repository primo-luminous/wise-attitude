import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if user is trying to access protected routes
  if (pathname.startsWith('/main')) {
    const sessionCookie = request.cookies.get('session_token')
    
    if (!sessionCookie?.value) {
      // Redirect to login if no session token
      console.log('Middleware: No session token found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // ตรวจสอบว่า session token มีค่าและไม่ใช่ค่าว่าง
    if (sessionCookie.value.trim() === '') {
      console.log('Middleware: Empty session token, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // ตรวจสอบว่า session token มีความยาวที่ถูกต้อง (อย่างน้อย 32 ตัวอักษร)
    if (sessionCookie.value.length < 32) {
      console.log('Middleware: Invalid session token length, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // ตรวจสอบว่าต้องเปลี่ยนรหัสผ่านหรือไม่ (ยกเว้นหน้า change-password)
    if (pathname !== '/main/change-password') {
      // ตรวจสอบ session และ mustChangePassword flag
      // การตรวจสอบนี้จะทำใน getCurrentUser ใน page component
      // แต่เราสามารถเพิ่มการตรวจสอบเบื้องต้นได้ที่นี่
    }
    
    // ถ้า session token ผ่านการตรวจสอบเบื้องต้น ให้ผ่านไป
    // การ validate session จริงจะทำใน getCurrentUser
  }

  // Check if user is trying to access auth routes while already logged in
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/forgot-password') || pathname.startsWith('/auth/reset-password')) {
    const sessionCookie = request.cookies.get('session_token')
    
    // ตรวจสอบเบื้องต้นเท่านั้น ไม่ redirect ถ้าไม่แน่ใจ
    if (sessionCookie?.value && sessionCookie.value.trim() !== '' && sessionCookie.value.length >= 32) {
      // ให้ผ่านไป ให้ getCurrentUser ใน page component จัดการ
      // เพื่อป้องกันการ loop
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
