'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  PawPrint, 
  Heart, 
  FileText, 
  User,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Calendar,
  MapPin,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MunicipalitySelector from '@/components/shared/MunicipalitySelector';
import NotificationsPanel from '@/components/shared/NotificationsPanel';
import CommandPalette from '@/components/shared/CommandPalette';

interface CitizenLayoutProps {
  children: React.ReactNode;
}

export default function CitizenLayout({ children }: CitizenLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

  // Listen for Cmd+K / Ctrl+K
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const navigation = [
    { 
      name: 'Início', 
      href: '/citizen/dashboard', 
      icon: Home,
      badge: null,
      description: 'Visão geral'
    },
    { 
      name: 'Buscar Animais', 
      href: '/animals/search', 
      icon: Search,
      badge: null,
      description: 'Encontre seu novo amigo'
    },
    { 
      name: 'Meus Processos', 
      href: '/citizen/adoptions', 
      icon: Heart,
      badge: '1',
      description: 'Adoções em andamento'
    },
    { 
      name: 'Meus Animais', 
      href: '/citizen/animals', 
      icon: PawPrint,
      badge: null,
      description: 'Animais adotados'
    },
    { 
      name: 'Agendamentos', 
      href: '/citizen/appointments', 
      icon: Calendar,
      badge: null,
      description: 'Consultas e procedimentos'
    },
    { 
      name: 'Documentos', 
      href: '/citizen/documents', 
      icon: FileText,
      badge: null,
      description: 'Comprovantes e certificados'
    },
    { 
      name: 'Chat', 
      href: '/citizen/chat', 
      icon: MessageSquare,
      badge: null,
      description: 'Fale conosco'
    }
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <Link href="/citizen/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">DIBEA</span>
                <p className="text-xs text-blue-600 font-medium">Adote um Amigo</p>
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {sidebarOpen && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 m-4 rounded-xl border border-blue-100">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Status</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Cidadão</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Heart className="w-4 h-4" />
                <span>1 processo em andamento</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Bell className="w-4 h-4" />
                <span>2 notificações não lidas</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                    ${active 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge className={`${
                            active 
                              ? 'bg-white/20 text-white hover:bg-white/20' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          } text-xs px-2`}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${
                        active ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          <Link
            href="/citizen/profile"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {sidebarOpen && <span>Meu Perfil</span>}
          </Link>
          
          <button
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-all
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm z-10"
        >
          {sidebarOpen ? (
            <X className="w-3 h-3 text-gray-600" />
          ) : (
            <Menu className="w-3 h-3 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Welcome Message */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Olá, Pedro! 👋
            </h2>
            <p className="text-sm text-gray-500">Bem-vindo ao seu painel de adoção</p>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Quick Search - Opens Command Palette */}
            <Button 
              variant="outline" 
              className="gap-2 hidden md:flex"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Buscar animais</span>
              <kbd className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded">⌘K</kbd>
            </Button>

            {/* Notifications - Functional */}
            <NotificationsPanel userId="current-user-id" />

            {/* Municipality Selector - Functional */}
            <div className="hidden md:block">
              <MunicipalitySelector 
                userRole="CIDADAO"
                onSelect={(municipality) => {
                  console.log('Município selecionado:', municipality);
                  // TODO: Save to user preferences
                }}
              />
            </div>

            {/* User Avatar - Clickable */}
            <button 
              onClick={() => window.location.href = '/citizen/profile'}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
