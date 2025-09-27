'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PawPrint,
  ArrowLeft,
  LogIn,
  UserPlus,
  Menu,
  X,
  Home,
  Heart,
  Users,
  BarChart3,
  LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  showBackButton?: boolean;
  backUrl?: string;
  title?: string;
  transparent?: boolean;
}

export default function Header({ 
  showBackButton = false, 
  backUrl = '/', 
  title,
  transparent = false 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getDashboardUrl = () => {
    if (!user) return '/';

    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'VETERINARIO':
        return '/vet/dashboard';
      case 'FUNCIONARIO':
        return '/staff/dashboard';
      case 'CIDADAO':
      default:
        return '/citizen/dashboard';
    }
  };

  const isAuthPage = pathname?.startsWith('/auth');
  const isLandingPage = pathname === '/';

  const navigationItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '#animals', label: 'Adoção', icon: Heart },
    { href: '#features', label: 'Recursos', icon: BarChart3 },
    { href: '#stats', label: 'Impacto', icon: Users },
  ];

  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      router.push(`/${sectionId}`);
      return;
    }
    
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`${
      transparent 
        ? 'bg-white/80 backdrop-blur-md' 
        : 'bg-white'
    } border-b border-gray-200 sticky top-0 z-50`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Back Button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backUrl} className="flex items-center text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <Link href="/" className="flex items-center space-x-2">
              <PawPrint className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DIBEA</span>
              <Badge className="bg-green-100 text-green-800">IA</Badge>
            </Link>

            {title && (
              <div className="hidden md:block">
                <span className="text-gray-400">|</span>
                <span className="ml-3 text-lg font-medium text-gray-700">{title}</span>
              </div>
            )}
          </div>

          {/* Center - Navigation (Desktop) */}
          {isLandingPage && (
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side - Auth Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-sm">
                  <span className="text-gray-600">Olá, </span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {user.role === 'ADMIN' ? '👑 Admin' :
                     user.role === 'VETERINARIO' ? '🩺 Vet' :
                     user.role === 'FUNCIONARIO' ? '👨‍💼 Func' : '👤 Cidadão'}
                  </Badge>
                </div>
                <Link href={getDashboardUrl()}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <>
                {!isAuthPage && (
                  <>
                    <Link href="/auth/login" className="hidden md:block">
                      <Button variant="outline">
                        <LogIn className="w-4 h-4 mr-2" />
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="hidden md:block">
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Cadastrar
                      </Button>
                    </Link>
                  </>
                )}
                
                {isAuthPage && (
                  <div className="hidden md:flex items-center space-x-4">
                    {pathname === '/auth/login' ? (
                      <Link href="/auth/register">
                        <Button variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Criar Conta
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login">
                        <Button variant="outline">
                          <LogIn className="w-4 h-4 mr-2" />
                          Fazer Login
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            {isLandingPage && (
              <div className="space-y-2 mb-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-600">{user.email}</div>
                  <Badge variant="outline" className="mt-1">
                    {user.role === 'ADMIN' ? '👑 Admin' :
                     user.role === 'VETERINARIO' ? '🩺 Veterinário' :
                     user.role === 'FUNCIONARIO' ? '👨‍💼 Funcionário' : '👤 Cidadão'}
                  </Badge>
                </div>
                <Link href={getDashboardUrl()} className="block">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={logout}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register" className="block">
                  <Button className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
