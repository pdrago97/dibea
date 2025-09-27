'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ArrowLeft, 
  Home,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    if (user) {
      // Redireciona para o dashboard apropriado baseado no role
      const dashboardMap = {
        'ADMIN': '/admin/dashboard',
        'FUNCIONARIO': '/staff/dashboard',
        'VETERINARIO': '/vet/dashboard',
        'CIDADAO': '/citizen/dashboard'
      };
      router.push(dashboardMap[user.role as keyof typeof dashboardMap] || '/');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Acesso Negado</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você não tem permissão para acessar esta página.
              </AlertDescription>
            </Alert>

            {user ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Logado como: <span className="font-medium">{user.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Tipo de conta: <span className="font-medium">{user.role}</span>
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Você precisa estar logado para acessar esta página.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleGoBack}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button 
                onClick={handleGoHome}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                {user ? 'Ir para Dashboard' : 'Ir para Início'}
              </Button>

              {user ? (
                <Button 
                  onClick={logout}
                  variant="destructive" 
                  className="w-full"
                >
                  Fazer Logout
                </Button>
              ) : (
                <Link href="/login" className="block">
                  <Button className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              )}
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>
                Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
