'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, PawPrint, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/navigation/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Se já está logado ao carregar a página, redireciona
  useEffect(() => {
    if (isAuthenticated) {
      // Aguarda um frame para garantir que o user está completamente carregado
      const timer = setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/dashboard';
        console.log('Login page: User is authenticated, redirecting to:', redirect);
        router.push(redirect);
      }, 100); // Pequeno delay para garantir sincronização
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou senha incorretos');
        setIsLoading(false);
      }
      // Se sucesso, o useEffect vai redirecionar quando isAuthenticated mudar
      // Não definir isLoading como false aqui para manter o estado de carregamento
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  // Quick login function for demo accounts
  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  if (isAuthenticated) {
    return null; // Evita flash de conteúdo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Fixed Navigation Header */}
      <Header showBackButton={true} backUrl="/" title="Login" />

      <div className="flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <PawPrint className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DIBEA</span>
            <Badge className="bg-green-100 text-green-800">IA</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de Volta
          </h1>
          <p className="text-gray-600">
            Entre na sua conta para acessar o sistema
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LogIn className="w-5 h-5 mr-2" />
              Fazer Login
            </CardTitle>
            <CardDescription>
              Use suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Contas de demonstração:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => quickLogin('admin@dibea.com', 'admin123')}
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  👑 <strong>Admin:</strong> admin@dibea.com / admin123
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('vet@dibea.com', 'vet123')}
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  🩺 <strong>Veterinário:</strong> vet@dibea.com / vet123
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('func@dibea.com', 'func123')}
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  👨‍💼 <strong>Funcionário:</strong> func@dibea.com / func123
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('cidadao@dibea.com', 'cidadao123')}
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                >
                  👤 <strong>Cidadão:</strong> cidadao@dibea.com / cidadao123
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Clique em qualquer conta para preencher automaticamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600">
            ← Voltar para a página inicial
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
