import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Assume simple check: if no admin_token cookie or client doesn't pass it, 
  // actually localStorage is not available in middleware. 
  // In Next.js App Router, it's better to verify auth on the client or via cookies.
  // We'll redirect from / if there's no auth in the components, 
  // or we can just redirect / to /dashboard and let client layout protect it if we rely on localStorage.
  
  // Since getToken() uses localStorage, middleware cannot reliably read it unless we set a cookie.
  // We will let the (dashboard)/layout.tsx handle client-side protection.
  
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
