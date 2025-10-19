import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/admin',
  '/staff', 
  '/vet',
  '/citizen',
  '/notifications',
  '/dashboard'
];

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/animals',
  '/unauthorized'
];

// Mapeamento de roles para dashboards
const roleDashboardMap = {
  'ADMIN': '/admin/dashboard',
  'FUNCIONARIO': '/staff/dashboard', 
  'VETERINARIO': '/vet/dashboard',
  'CIDADAO': '/citizen/dashboard'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Se for rota pública, permitir acesso
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // A página /dashboard/page.tsx já faz o redirecionamento correto baseado no role
  // Não precisamos fazer nada aqui, apenas permitir o acesso

  // Verificar autorização baseada em role para rotas específicas
  if (token && isProtectedRoute) {
    // Aqui você poderia implementar verificação de role mais específica
    // Por exemplo, verificar se um CIDADAO está tentando acessar /admin
    
    if (pathname.startsWith('/admin')) {
      // Verificar se o usuário é ADMIN
      // Por simplicidade, vamos permitir por enquanto
      // Em produção, você decodificaria o token para verificar o role
    }
    
    if (pathname.startsWith('/staff')) {
      // Verificar se o usuário é FUNCIONARIO
    }
    
    if (pathname.startsWith('/vet')) {
      // Verificar se o usuário é VETERINARIO  
    }
    
    if (pathname.startsWith('/citizen')) {
      // Verificar se o usuário é CIDADAO
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - files with extensions (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
  ],
};
