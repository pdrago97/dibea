'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  municipalityId?: string;
  municipality?: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccess: (resource: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setIsLoading(false);
        return;
      }

      // Para desenvolvimento, usar dados do localStorage
      try {
        const user = JSON.parse(userData);
        setUser(user);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);

      // Real authentication via API
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Login failed:', response.statusText, errorData);
        return false;
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.success && data.token && data.user) {
        console.log('💾 Saving to localStorage and cookies...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Salvar token em cookie para o middleware
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        setUser(data.user);
        console.log('🎉 Login successful!');
        return true;
      }

      console.warn('⚠️ Login response missing required fields:', data);
      return false;
      
      /* REMOVED MOCK AUTH
      const mockUsers = {
        'admin@dibea.com': {
          id: '1',
          name: 'Administrador DIBEA',
          email: 'admin@dibea.com',
          role: 'ADMIN' as UserRole,
          municipalityId: '1',
          municipality: { id: '1', name: 'São Paulo' },
          isActive: true
        },
        'funcionario@dibea.com': {
          id: '2',
          name: 'João Silva',
          email: 'funcionario@dibea.com',
          role: 'FUNCIONARIO' as UserRole,
          municipalityId: '1',
          municipality: { id: '1', name: 'São Paulo' },
          isActive: true
        },
        'vet@dibea.com': {
          id: '3',
          name: 'Dra. Maria Santos',
          email: 'vet@dibea.com',
          role: 'VETERINARIO' as UserRole,
          municipalityId: '1',
          municipality: { id: '1', name: 'São Paulo' },
          isActive: true
        },
        'cidadao@dibea.com': {
          id: '4',
          name: 'Pedro Cidadão',
          email: 'cidadao@dibea.com',
          role: 'CIDADAO' as UserRole,
          municipalityId: '1',
          municipality: { id: '1', name: 'São Paulo' },
          isActive: true
        }
      };

      const mockPasswords = {
        'admin@dibea.com': 'admin123',
        'funcionario@dibea.com': 'func123',
        'vet@dibea.com': 'vet123',
        'cidadao@dibea.com': 'cidadao123'
      };

      */
      return false;
    } catch (error) {
      console.error('💥 Erro no login:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Erro de rede - verifique se o backend está rodando em http://localhost:3000');
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Remover cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    setUser(null);
    router.push('/auth/login');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    console.log('[hasRole] Called with:', { roles, userRole: user?.role, user: user });
    if (!user) {
      console.log('[hasRole] No user, returning false');
      return false;
    }
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const result = roleArray.includes(user.role);
    console.log('[hasRole] Result:', { roleArray, userRole: user.role, includes: result });
    return result;
  };

  const canAccess = (resource: string): boolean => {
    if (!user) return false;

    const permissions: Record<UserRole, string[]> = {
      ADMIN: ['*'], // Admin pode acessar tudo
      FUNCIONARIO: [
        'animals.*',
        'adoptions.*',
        'notifications.*',
        'tasks.*',
        'reports.basic'
      ],
      VETERINARIO: [
        'animals.read',
        'animals.medical',
        'medical-records.*',
        'notifications.read',
        'reports.medical'
      ],
      CIDADAO: [
        'animals.read',
        'adoptions.own',
        'notifications.own',
        'profile.own'
      ]
    };

    const userPermissions = permissions[user.role] || [];
    
    // Admin tem acesso total
    if (userPermissions.includes('*')) return true;
    
    // Verificar permissões específicas
    return userPermissions.some(permission => {
      if (permission.endsWith('.*')) {
        return resource.startsWith(permission.slice(0, -2));
      }
      return permission === resource;
    });
  };

  const redirectBasedOnRole = (role: UserRole) => {
    const redirectMap: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      FUNCIONARIO: '/staff/dashboard',
      VETERINARIO: '/vet/dashboard',
      CIDADAO: '/citizen/dashboard'
    };

    router.push(redirectMap[role]);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar se o usuário tem permissão para acessar uma rota
export function useRequireAuth(requiredRoles?: UserRole | UserRole[]) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      console.log('[useRequireAuth] Still loading, waiting...');
      return;
    }

    // Not logged in
    if (!user) {
      console.log('[useRequireAuth] No user found, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Check role if required
    if (requiredRoles) {
      // Add small delay to ensure user is fully loaded
      const timer = setTimeout(() => {
        const authorized = hasRole(requiredRoles);
        console.log('[useRequireAuth] User role:', user.role, 'Required:', requiredRoles, 'Authorized:', authorized);
        
        if (!authorized) {
          console.log('[useRequireAuth] User not authorized, redirecting to unauthorized');
          router.push('/unauthorized');
          return;
        }
        
        console.log('[useRequireAuth] User authorized:', user.email, 'Role:', user.role);
      }, 50);

      return () => clearTimeout(timer);
    }

    console.log('[useRequireAuth] User authorized (no role check):', user.email);
  }, [user, isLoading, requiredRoles, hasRole, router]);

  return { user, isLoading, isAuthorized: !requiredRoles || (user && hasRole(requiredRoles)) };
}
