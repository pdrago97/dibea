'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Redirecionar baseado no role do usuário
      const dashboardMap = {
        'ADMIN': '/admin/dashboard',
        'FUNCIONARIO': '/staff/dashboard',
        'VETERINARIO': '/vet/dashboard',
        'CIDADAO': '/citizen/dashboard'
      };

      const targetDashboard = dashboardMap[user.role as keyof typeof dashboardMap];
      if (targetDashboard) {
        router.replace(targetDashboard);
      } else {
        // Fallback para página inicial se role não reconhecido
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Redirecionando para seu dashboard...</p>
      </div>
    </div>
  );
}
