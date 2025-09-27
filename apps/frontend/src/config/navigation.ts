import {
  Home,
  Search,
  Users,
  PawPrint,
  Building,
  FileText,
  Heart,
  Calendar,
  Stethoscope,
  Settings,
  BarChart3,
  Bot,
  MessageSquare,
  Shield,
  Database,
  Activity,
  Bell,
  Plus,
  Eye,
  Clock,
  AlertTriangle,
  Award,
  Star,
  TrendingUp
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';

export interface NavigationRoute {
  id: string;
  label: string;
  href: string;
  icon: any;
  description?: string;
  roles: UserRole[];
  badge?: number;
  children?: NavigationRoute[];
  entity?: 'animal' | 'user' | 'procedure' | 'adoption' | 'municipality' | 'document' | 'notification' | 'report';
  priority?: 'high' | 'medium' | 'low';
}

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  // Universal routes (available to all roles)
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Painel principal com visão geral',
    roles: ['ADMIN', 'FUNCIONARIO', 'VETERINARIO', 'CIDADAO']
  },
  {
    id: 'explorer',
    label: 'Explorador',
    href: '/explorer',
    icon: Search,
    description: 'Navegue por todas as entidades do sistema',
    roles: ['ADMIN', 'FUNCIONARIO', 'VETERINARIO', 'CIDADAO'],
    entity: 'report'
  },

  // Admin routes
  {
    id: 'admin-users',
    label: 'Gestão de Usuários',
    href: '/admin/users',
    icon: Users,
    description: 'Gerenciar todos os usuários do sistema',
    roles: ['ADMIN'],
    entity: 'user',
    children: [
      {
        id: 'admin-users-list',
        label: 'Todos os Usuários',
        href: '/admin/users',
        icon: Users,
        roles: ['ADMIN']
      },
      {
        id: 'admin-users-create',
        label: 'Criar Usuário',
        href: '/admin/users/create',
        icon: Plus,
        roles: ['ADMIN']
      },
      {
        id: 'admin-users-pending',
        label: 'Aprovações Pendentes',
        href: '/admin/users/pending',
        icon: Clock,
        roles: ['ADMIN'],
        badge: 5,
        priority: 'high'
      }
    ]
  },
  {
    id: 'admin-animals',
    label: 'Gestão de Animais',
    href: '/admin/animals',
    icon: PawPrint,
    description: 'Gerenciar todos os animais cadastrados',
    roles: ['ADMIN'],
    entity: 'animal',
    children: [
      {
        id: 'admin-animals-list',
        label: 'Todos os Animais',
        href: '/admin/animals',
        icon: PawPrint,
        roles: ['ADMIN']
      },
      {
        id: 'admin-animals-pending',
        label: 'Aprovações Pendentes',
        href: '/admin/animals/pending',
        icon: Clock,
        roles: ['ADMIN'],
        badge: 3,
        priority: 'medium'
      }
    ]
  },
  {
    id: 'admin-municipalities',
    label: 'Municípios',
    href: '/admin/municipalities',
    icon: Building,
    description: 'Gerenciar municípios participantes',
    roles: ['ADMIN'],
    entity: 'municipality'
  },
  {
    id: 'admin-procedures',
    label: 'Procedimentos',
    href: '/admin/procedures',
    icon: FileText,
    description: 'Gerenciar procedimentos veterinários',
    roles: ['ADMIN'],
    entity: 'procedure',
    children: [
      {
        id: 'admin-procedures-list',
        label: 'Todos os Procedimentos',
        href: '/admin/procedures',
        icon: FileText,
        roles: ['ADMIN']
      },
      {
        id: 'admin-procedures-pending',
        label: 'Aprovações Pendentes',
        href: '/admin/procedures/pending',
        icon: Clock,
        roles: ['ADMIN'],
        badge: 2,
        priority: 'low'
      }
    ]
  },
  {
    id: 'admin-reports',
    label: 'Relatórios',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Relatórios e analytics do sistema',
    roles: ['ADMIN'],
    entity: 'report'
  },
  {
    id: 'admin-ai-agents',
    label: 'Agentes IA',
    href: '/admin/ai-agents',
    icon: Bot,
    description: 'Gerenciar agentes de inteligência artificial',
    roles: ['ADMIN']
  },
  {
    id: 'admin-system',
    label: 'Sistema',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configurações e logs do sistema',
    roles: ['ADMIN'],
    children: [
      {
        id: 'admin-settings',
        label: 'Configurações',
        href: '/admin/settings',
        icon: Settings,
        roles: ['ADMIN']
      },
      {
        id: 'admin-logs',
        label: 'Logs do Sistema',
        href: '/admin/logs',
        icon: Activity,
        roles: ['ADMIN']
      }
    ]
  },

  // Staff routes
  {
    id: 'staff-animals',
    label: 'Meus Animais',
    href: '/staff/animals',
    icon: PawPrint,
    description: 'Animais sob sua responsabilidade',
    roles: ['FUNCIONARIO'],
    entity: 'animal',
    children: [
      {
        id: 'staff-animals-list',
        label: 'Meus Animais',
        href: '/staff/animals',
        icon: PawPrint,
        roles: ['FUNCIONARIO']
      },
      {
        id: 'staff-animals-create',
        label: 'Cadastrar Animal',
        href: '/staff/animals/create',
        icon: Plus,
        roles: ['FUNCIONARIO']
      }
    ]
  },
  {
    id: 'staff-adoptions',
    label: 'Adoções',
    href: '/staff/adoptions',
    icon: Heart,
    description: 'Processos de adoção',
    roles: ['FUNCIONARIO'],
    entity: 'adoption',
    children: [
      {
        id: 'staff-adoptions-list',
        label: 'Processos de Adoção',
        href: '/staff/adoptions',
        icon: Heart,
        roles: ['FUNCIONARIO']
      },
      {
        id: 'staff-adoptions-pending',
        label: 'Pendentes',
        href: '/staff/adoptions/pending',
        icon: Clock,
        roles: ['FUNCIONARIO'],
        badge: 8,
        priority: 'high'
      }
    ]
  },
  {
    id: 'staff-procedures',
    label: 'Procedimentos',
    href: '/staff/procedures',
    icon: FileText,
    description: 'Procedimentos administrativos',
    roles: ['FUNCIONARIO'],
    entity: 'procedure'
  },

  // Veterinarian routes
  {
    id: 'vet-appointments',
    label: 'Consultas',
    href: '/vet/appointments',
    icon: Calendar,
    description: 'Agenda de consultas',
    roles: ['VETERINARIO'],
    children: [
      {
        id: 'vet-appointments-today',
        label: 'Hoje',
        href: '/vet/appointments/today',
        icon: Calendar,
        roles: ['VETERINARIO']
      },
      {
        id: 'vet-appointments-week',
        label: 'Esta Semana',
        href: '/vet/appointments/week',
        icon: Calendar,
        roles: ['VETERINARIO']
      },
      {
        id: 'vet-appointments-create',
        label: 'Agendar',
        href: '/vet/appointments/create',
        icon: Plus,
        roles: ['VETERINARIO']
      }
    ]
  },
  {
    id: 'vet-animals',
    label: 'Pacientes',
    href: '/vet/animals',
    icon: PawPrint,
    description: 'Animais sob seus cuidados',
    roles: ['VETERINARIO'],
    entity: 'animal',
    children: [
      {
        id: 'vet-animals-patients',
        label: 'Meus Pacientes',
        href: '/vet/animals',
        icon: PawPrint,
        roles: ['VETERINARIO']
      },
      {
        id: 'vet-animals-urgent',
        label: 'Casos Urgentes',
        href: '/vet/animals/urgent',
        icon: AlertTriangle,
        roles: ['VETERINARIO'],
        badge: 2,
        priority: 'high'
      }
    ]
  },
  {
    id: 'vet-procedures',
    label: 'Procedimentos',
    href: '/vet/procedures',
    icon: Stethoscope,
    description: 'Procedimentos veterinários',
    roles: ['VETERINARIO'],
    entity: 'procedure'
  },

  // Citizen routes
  {
    id: 'citizen-animals',
    label: 'Adoção',
    href: '/citizen/animals',
    icon: Heart,
    description: 'Animais disponíveis para adoção',
    roles: ['CIDADAO'],
    entity: 'animal',
    children: [
      {
        id: 'citizen-animals-browse',
        label: 'Buscar Animais',
        href: '/citizen/animals',
        icon: Search,
        roles: ['CIDADAO']
      },
      {
        id: 'citizen-animals-favorites',
        label: 'Favoritos',
        href: '/citizen/favorites',
        icon: Heart,
        roles: ['CIDADAO']
      }
    ]
  },
  {
    id: 'citizen-adoptions',
    label: 'Meus Processos',
    href: '/citizen/adoptions',
    icon: FileText,
    description: 'Seus processos de adoção',
    roles: ['CIDADAO'],
    entity: 'adoption'
  },

  // Common routes (available to multiple roles)
  {
    id: 'chat',
    label: 'Chat IA',
    href: '/chat',
    icon: MessageSquare,
    description: 'Converse com agentes inteligentes',
    roles: ['ADMIN', 'FUNCIONARIO', 'VETERINARIO', 'CIDADAO']
  }
];

// Utility functions
export function getRoutesForRole(role: UserRole): NavigationRoute[] {
  return NAVIGATION_ROUTES.filter(route => route.roles.includes(role));
}

export function getRouteById(id: string): NavigationRoute | undefined {
  const findRoute = (routes: NavigationRoute[]): NavigationRoute | undefined => {
    for (const route of routes) {
      if (route.id === id) return route;
      if (route.children) {
        const found = findRoute(route.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findRoute(NAVIGATION_ROUTES);
}

export function hasPermission(route: NavigationRoute, userRole: UserRole): boolean {
  return route.roles.includes(userRole);
}

export function getEntityRoutes(entity: string, userRole: UserRole): NavigationRoute[] {
  return getRoutesForRole(userRole).filter(route => route.entity === entity);
}

export function getPendingApprovals(userRole: UserRole): NavigationRoute[] {
  const routes = getRoutesForRole(userRole);
  const pendingRoutes: NavigationRoute[] = [];
  
  const findPending = (routes: NavigationRoute[]) => {
    routes.forEach(route => {
      if (route.badge && route.badge > 0 && route.priority === 'high') {
        pendingRoutes.push(route);
      }
      if (route.children) {
        findPending(route.children);
      }
    });
  };
  
  findPending(routes);
  return pendingRoutes;
}
