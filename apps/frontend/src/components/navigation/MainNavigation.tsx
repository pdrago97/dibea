'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PawPrint,
  Home,
  Users,
  Heart,
  FileText,
  Settings,
  Bell,
  User,
  Building,
  Stethoscope,
  Calendar,
  BarChart3,
  Shield,
  Bot,
  Clock,
  AlertTriangle,
  MessageSquare,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavItem, StatusBadge } from '@/components/ui/design-system';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  onClick?: () => void;
  badge?: number;
  entity?: string;
  children?: NavigationItem[];
  roles?: string[];
}

interface MainNavigationProps {
  userRole: 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';
  userName?: string;
  notifications?: number;
  onLogout?: () => void;
}

export function MainNavigation({ userRole, userName, notifications = 0, onLogout }: MainNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: `/${userRole.toLowerCase()}/dashboard`
      },
      {
        id: 'explorer',
        label: 'Explorador',
        icon: Search,
        href: '/explorer',
        entity: 'report'
      }
    ];

    switch (userRole) {
      case 'ADMIN':
        return [
          ...baseItems,
          {
            id: 'users',
            label: 'Usuários',
            icon: Users,
            entity: 'user',
            children: [
              { id: 'users-list', label: 'Todos os Usuários', icon: Users, href: '/admin/users' },
              { id: 'users-create', label: 'Criar Usuário', icon: Plus, href: '/admin/users/create' },
              { id: 'users-pending', label: 'Aprovações Pendentes', icon: Clock, href: '/admin/users/pending', badge: 5 }
            ]
          },
          {
            id: 'animals',
            label: 'Animais',
            icon: PawPrint,
            entity: 'animal',
            children: [
              { id: 'animals-list', label: 'Todos os Animais', icon: PawPrint, href: '/admin/animals' },
              { id: 'animals-pending', label: 'Aprovações Pendentes', icon: Clock, href: '/admin/animals/pending', badge: 3 }
            ]
          },
          {
            id: 'municipalities',
            label: 'Municípios',
            icon: Building,
            entity: 'municipality',
            href: '/admin/municipalities'
          },
          {
            id: 'procedures',
            label: 'Procedimentos',
            icon: FileText,
            entity: 'procedure',
            children: [
              { id: 'procedures-list', label: 'Todos os Procedimentos', icon: FileText, href: '/admin/procedures' },
              { id: 'procedures-pending', label: 'Aprovações Pendentes', icon: Clock, href: '/admin/procedures/pending', badge: 2 }
            ]
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: BarChart3,
            entity: 'report',
            href: '/admin/reports'
          },
          {
            id: 'ai-agents',
            label: 'Agentes IA',
            icon: Bot,
            href: '/admin/ai-agents'
          },
          {
            id: 'system',
            label: 'Sistema',
            icon: Settings,
            children: [
              { id: 'system-settings', label: 'Configurações', icon: Settings, href: '/admin/settings' },
              { id: 'system-logs', label: 'Logs do Sistema', icon: FileText, href: '/admin/logs' }
            ]
          }
        ];

      case 'FUNCIONARIO':
        return [
          ...baseItems,
          {
            id: 'animals',
            label: 'Animais',
            icon: PawPrint,
            entity: 'animal',
            children: [
              { id: 'animals-list', label: 'Meus Animais', icon: PawPrint, href: '/staff/animals' },
              { id: 'animals-create', label: 'Cadastrar Animal', icon: Plus, href: '/staff/animals/create' }
            ]
          },
          {
            id: 'adoptions',
            label: 'Adoções',
            icon: Heart,
            entity: 'adoption',
            children: [
              { id: 'adoptions-list', label: 'Processos de Adoção', icon: Heart, href: '/staff/adoptions' },
              { id: 'adoptions-pending', label: 'Pendentes', icon: Clock, href: '/staff/adoptions/pending', badge: 8 }
            ]
          },
          {
            id: 'procedures',
            label: 'Procedimentos',
            icon: FileText,
            entity: 'procedure',
            href: '/staff/procedures'
          },
          {
            id: 'chat',
            label: 'Chat IA',
            icon: MessageSquare,
            href: '/staff/chat'
          }
        ];

      case 'VETERINARIO':
        return [
          ...baseItems,
          {
            id: 'appointments',
            label: 'Consultas',
            icon: Calendar,
            children: [
              { id: 'appointments-today', label: 'Hoje', icon: Calendar, href: '/vet/appointments/today' },
              { id: 'appointments-week', label: 'Esta Semana', icon: Calendar, href: '/vet/appointments/week' },
              { id: 'appointments-schedule', label: 'Agendar', icon: Plus, href: '/vet/appointments/create' }
            ]
          },
          {
            id: 'animals',
            label: 'Animais',
            icon: PawPrint,
            entity: 'animal',
            children: [
              { id: 'animals-patients', label: 'Meus Pacientes', icon: PawPrint, href: '/vet/animals' },
              { id: 'animals-urgent', label: 'Casos Urgentes', icon: AlertTriangle, href: '/vet/animals/urgent', badge: 2 }
            ]
          },
          {
            id: 'procedures',
            label: 'Procedimentos',
            icon: Stethoscope,
            entity: 'procedure',
            href: '/vet/procedures'
          },
          {
            id: 'chat',
            label: 'Chat IA',
            icon: MessageSquare,
            href: '/vet/chat'
          }
        ];

      case 'CIDADAO':
        return [
          ...baseItems,
          {
            id: 'animals',
            label: 'Adoção',
            icon: Heart,
            entity: 'animal',
            children: [
              { id: 'animals-browse', label: 'Buscar Animais', icon: Search, href: '/citizen/animals' },
              { id: 'animals-favorites', label: 'Favoritos', icon: Heart, href: '/citizen/favorites' }
            ]
          },
          {
            id: 'adoptions',
            label: 'Meus Processos',
            icon: FileText,
            entity: 'adoption',
            href: '/citizen/adoptions'
          },
          {
            id: 'chat',
            label: 'Chat IA',
            icon: MessageSquare,
            href: '/citizen/chat'
          }
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getRoleBadge = () => {
    const roleConfig = {
      ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      FUNCIONARIO: { label: 'Funcionário', color: 'bg-blue-100 text-blue-800' },
      VETERINARIO: { label: 'Veterinário', color: 'bg-green-100 text-green-800' },
      CIDADAO: { label: 'Cidadão', color: 'bg-purple-100 text-purple-800' }
    };

    const config = roleConfig[userRole];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <PawPrint className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DIBEA</span>
          </Link>
          {getRoleBadge()}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName || 'Usuário'}</p>
              <p className="text-sm text-gray-500">{userRole.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.includes(item.id) ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <NavItem
                          key={child.id}
                          icon={child.icon}
                          label={child.label}
                          href={child.href}
                          onClick={child.onClick}
                          active={isActive(child.href)}
                          badge={child.badge}
                          entity={child.entity as any}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  onClick={item.onClick}
                  active={isActive(item.href)}
                  badge={item.badge}
                  entity={item.entity as any}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
            {notifications > 0 && (
              <Badge className="ml-auto bg-red-500 text-white">
                {notifications > 99 ? '99+' : notifications}
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <PawPrint className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">DIBEA</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {getRoleBadge()}
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs">
                  {notifications > 99 ? '99+' : notifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            {/* Mobile menu content - similar to desktop sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2">
                <PawPrint className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">DIBEA</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Mobile navigation content */}
            <div className="p-4">
              <div className="mb-4">
                <p className="font-medium text-gray-900">{userName || 'Usuário'}</p>
                <p className="text-sm text-gray-500">{userRole.toLowerCase()}</p>
              </div>
              
              {/* Navigation items for mobile */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    onClick={() => {
                      item.onClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    active={isActive(item.href)}
                    badge={item.badge}
                    entity={item.entity as any}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
