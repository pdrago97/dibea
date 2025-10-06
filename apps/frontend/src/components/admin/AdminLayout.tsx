'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PawPrint, 
  Users, 
  FileText, 
  Calendar, 
  Stethoscope,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Heart,
  AlertCircle,
  TrendingUp,
  Building2,
  Shield,
  Activity,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MunicipalitySelector from '@/components/shared/MunicipalitySelector';
import NotificationsPanel from '@/components/shared/NotificationsPanel';
import CommandPalette from '@/components/shared/CommandPalette';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

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
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard,
      badge: null,
      enabled: true
    },
    { 
      name: 'Animais', 
      href: '/admin/animals', 
      icon: PawPrint,
      badge: '4',
      enabled: true
    },
    { 
      name: 'Usuários', 
      href: '/admin/users', 
      icon: Users,
      badge: null,
      enabled: true
    },
    { 
      name: 'Clínicas', 
      href: '/admin/clinics', 
      icon: Building2,
      badge: null,
      enabled: true
    },
    { 
      name: 'Chat IA', 
      href: '/admin/chat', 
      icon: MessageSquare,
      badge: null,
      enabled: true
    },
    { 
      name: 'Agentes', 
      href: '/admin/agents', 
      icon: Shield,
      badge: null,
      enabled: true
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: Activity,
      badge: null,
      enabled: true
    },
    // Coming soon pages
    { 
      name: 'Adoções', 
      href: '#', 
      icon: Heart,
      badge: 'Breve',
      enabled: false
    },
    { 
      name: 'Veterinários', 
      href: '#', 
      icon: Stethoscope,
      badge: 'Breve',
      enabled: false
    },
    { 
      name: 'Agendamentos', 
      href: '#', 
      icon: Calendar,
      badge: 'Breve',
      enabled: false
    },
    { 
      name: 'Campanhas', 
      href: '#', 
      icon: TrendingUp,
      badge: 'Breve',
      enabled: false
    },
    { 
      name: 'Denúncias', 
      href: '#', 
      icon: AlertCircle,
      badge: 'Breve',
      enabled: false
    }
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">DIBEA</span>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const disabled = !item.enabled;
              
              if (disabled) {
                return (
                  <div
                    key={item.name}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      text-gray-400 cursor-not-allowed opacity-50 border-l-2 border-transparent
                      ${!sidebarOpen && 'justify-center'}
                    `}
                    title={!sidebarOpen ? `${item.name} (Em breve)` : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-2">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${active 
                      ? 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600' 
                      : 'text-gray-700 hover:bg-gray-50 border-l-2 border-transparent'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-500'}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs px-2">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings & Logout */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <Link
            href="/admin/settings"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <Settings className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {sidebarOpen && <span>Configurações</span>}
          </Link>
          
          <button
            onClick={handleLogout}
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
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm"
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
          {/* Search - Opens Command Palette */}
          <div className="flex-1 max-w-xl">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors text-left"
            >
              <Search className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Buscar animais, tutores, processos...</span>
              <kbd className="ml-auto px-2 py-0.5 text-xs bg-white border border-gray-300 rounded">⌘K</kbd>
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications - Functional */}
            <NotificationsPanel userId="current-admin-id" />

            {/* Municipality Selector - Functional */}
            <MunicipalitySelector 
              userRole="ADMIN"
              onSelect={(municipality) => {
                console.log('Município selecionado:', municipality);
                // TODO: Save to admin context/filter
              }}
            />

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-left">
                    <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'ADMIN'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
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
