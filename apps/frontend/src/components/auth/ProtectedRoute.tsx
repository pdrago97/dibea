'use client';

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
  fallbackPath?: string;
  showLoading?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  fallbackPath = '/auth/login',
  showLoading = true 
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Se não está logado, redireciona para login
      if (!user) {
        router.push(fallbackPath);
        return;
      }

      // Se tem roles requeridos e não tem permissão, redireciona
      if (requiredRoles && !hasRole(requiredRoles)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, requiredRoles, hasRole, router, fallbackPath]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    if (!showLoading) return null;
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, não renderiza nada (redirecionamento já foi feito)
  if (!user) {
    return null;
  }

  // Se tem roles requeridos e não tem permissão, não renderiza
  if (requiredRoles && !hasRole(requiredRoles)) {
    return null;
  }

  // Se passou por todas as verificações, renderiza o conteúdo
  return <>{children}</>;
}

// Componente para mostrar conteúdo apenas para roles específicos
interface RoleBasedProps {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function RoleBased({ children, roles, fallback = null }: RoleBasedProps) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Componente para mostrar conteúdo apenas para usuários autenticados
interface AuthenticatedOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthenticatedOnly({ children, fallback = null }: AuthenticatedOnlyProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
