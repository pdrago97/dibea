'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronRight, 
  Home, 
  PawPrint, 
  Users, 
  Building, 
  FileText, 
  Heart, 
  Settings,
  BarChart3,
  Bot,
  Calendar,
  Stethoscope,
  Search,
  Eye
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: any;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showIcons?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showIcons = true, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb items from pathname if not provided
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Add home
    breadcrumbItems.push({
      label: 'Início',
      href: '/',
      icon: Home
    });

    // Map path segments to breadcrumb items
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Get label and icon based on segment
      const { label, icon } = getSegmentInfo(segment, pathSegments, index);

      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath,
        icon: showIcons ? icon : undefined,
        current: isLast
      });
    });

    return breadcrumbItems;
  };

  const getSegmentInfo = (segment: string, allSegments: string[], index: number) => {
    // Role-based segments
    if (segment === 'admin') {
      return { label: 'Administração', icon: Settings };
    }
    if (segment === 'citizen') {
      return { label: 'Cidadão', icon: Heart };
    }
    if (segment === 'vet') {
      return { label: 'Veterinário', icon: Stethoscope };
    }
    if (segment === 'staff') {
      return { label: 'Funcionário', icon: Users };
    }

    // Entity segments
    if (segment === 'animals') {
      return { label: 'Animais', icon: PawPrint };
    }
    if (segment === 'users') {
      return { label: 'Usuários', icon: Users };
    }
    if (segment === 'municipalities') {
      return { label: 'Municípios', icon: Building };
    }
    if (segment === 'procedures') {
      return { label: 'Procedimentos', icon: FileText };
    }
    if (segment === 'adoptions') {
      return { label: 'Adoções', icon: Heart };
    }
    if (segment === 'reports') {
      return { label: 'Relatórios', icon: BarChart3 };
    }
    if (segment === 'dashboard') {
      return { label: 'Dashboard', icon: BarChart3 };
    }
    if (segment === 'chat') {
      return { label: 'Chat IA', icon: Bot };
    }
    if (segment === 'appointments') {
      return { label: 'Consultas', icon: Calendar };
    }
    if (segment === 'explorer') {
      return { label: 'Explorador', icon: Search };
    }
    if (segment === 'approvals') {
      return { label: 'Aprovações', icon: Eye };
    }

    // Action segments
    if (segment === 'create') {
      return { label: 'Criar', icon: undefined };
    }
    if (segment === 'edit') {
      return { label: 'Editar', icon: undefined };
    }
    if (segment === 'view') {
      return { label: 'Visualizar', icon: undefined };
    }
    if (segment === 'pending') {
      return { label: 'Pendentes', icon: undefined };
    }
    if (segment === 'settings') {
      return { label: 'Configurações', icon: Settings };
    }

    // Special cases for IDs (usually UUIDs or numbers)
    if (segment.match(/^[a-f0-9-]{36}$/) || segment.match(/^\d+$/)) {
      // Try to get entity name from previous segment
      const previousSegment = allSegments[index - 1];
      if (previousSegment === 'animals') {
        return { label: 'Animal', icon: PawPrint };
      }
      if (previousSegment === 'users') {
        return { label: 'Usuário', icon: Users };
      }
      if (previousSegment === 'procedures') {
        return { label: 'Procedimento', icon: FileText };
      }
      if (previousSegment === 'adoptions') {
        return { label: 'Adoção', icon: Heart };
      }
      return { label: 'Item', icon: undefined };
    }

    // Default: capitalize and remove hyphens/underscores
    const label = segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return { label, icon: undefined };
  };

  const breadcrumbItems = items || generateBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for home page only
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {item.current ? (
              <span className="flex items-center text-gray-900 font-medium">
                {item.icon && showIcons && (
                  <item.icon className="w-4 h-4 mr-2 text-gray-600" />
                )}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || '#'}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.icon && showIcons && (
                  <item.icon className="w-4 h-4 mr-2" />
                )}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Utility component for page headers with breadcrumb
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
}

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbItems, 
  actions, 
  showBreadcrumb = true 
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {showBreadcrumb && (
        <Breadcrumb items={breadcrumbItems} />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized breadcrumb for entity pages
interface EntityBreadcrumbProps {
  entityType: 'animal' | 'user' | 'procedure' | 'adoption' | 'municipality';
  entityName?: string;
  entityId?: string;
  action?: 'view' | 'edit' | 'create';
  userRole: 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';
}

export function EntityBreadcrumb({ 
  entityType, 
  entityName, 
  entityId, 
  action, 
  userRole 
}: EntityBreadcrumbProps) {
  const getEntityIcon = () => {
    switch (entityType) {
      case 'animal': return PawPrint;
      case 'user': return Users;
      case 'procedure': return FileText;
      case 'adoption': return Heart;
      case 'municipality': return Building;
      default: return FileText;
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case 'animal': return 'Animais';
      case 'user': return 'Usuários';
      case 'procedure': return 'Procedimentos';
      case 'adoption': return 'Adoções';
      case 'municipality': return 'Municípios';
      default: return 'Entidades';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'ADMIN': return 'Administração';
      case 'FUNCIONARIO': return 'Funcionário';
      case 'VETERINARIO': return 'Veterinário';
      case 'CIDADAO': return 'Cidadão';
      default: return 'Dashboard';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'ADMIN': return Settings;
      case 'FUNCIONARIO': return Users;
      case 'VETERINARIO': return Stethoscope;
      case 'CIDADAO': return Heart;
      default: return Home;
    }
  };

  const items: BreadcrumbItem[] = [
    {
      label: 'Início',
      href: '/',
      icon: Home
    },
    {
      label: getRoleLabel(),
      href: `/${userRole.toLowerCase()}/dashboard`,
      icon: getRoleIcon()
    },
    {
      label: getEntityLabel(),
      href: `/${userRole.toLowerCase()}/${entityType}s`,
      icon: getEntityIcon()
    }
  ];

  // Add entity name if provided
  if (entityName && entityId) {
    items.push({
      label: entityName,
      href: action ? `/${userRole.toLowerCase()}/${entityType}s/${entityId}` : undefined,
      icon: getEntityIcon()
    });
  }

  // Add action if provided
  if (action) {
    const actionLabels = {
      view: 'Visualizar',
      edit: 'Editar',
      create: 'Criar'
    };

    items.push({
      label: actionLabels[action],
      current: true
    });
  }

  return <Breadcrumb items={items} />;
}
