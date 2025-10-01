'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { FloatingChat } from '@/components/chat/FloatingChat';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  const [userRole, setUserRole] = useState<'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO'>('CIDADAO');
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role || 'CIDADAO');
          setUserName(user.name);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
        {/* Floating Chat - Aparece em todas as páginas */}
        <FloatingChat userRole={userRole} userName={userName} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
