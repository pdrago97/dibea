import React from 'react';
import { LucideIcon } from 'lucide-react';

// Design System Constants
export const DIBEA_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d'
  },
  accent: {
    50: '#fef3c7',
    100: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const ENTITY_COLORS = {
  animal: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    iconClass: 'text-blue-600'
  },
  user: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-600',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    iconClass: 'text-green-600'
  },
  procedure: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    iconClass: 'text-purple-600'
  },
  adoption: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    bgClass: 'bg-pink-50',
    textClass: 'text-pink-700',
    borderClass: 'border-pink-200',
    iconClass: 'text-pink-600'
  },
  municipality: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    iconClass: 'text-indigo-600'
  },
  document: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
    iconClass: 'text-yellow-600'
  },
  notification: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    iconClass: 'text-orange-600'
  },
  report: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-200',
    iconClass: 'text-teal-600'
  }
};

export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  active: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
};

// Entity Card Component
interface EntityCardProps {
  entity: 'animal' | 'user' | 'procedure' | 'adoption' | 'municipality' | 'document' | 'notification' | 'report';
  title: string;
  subtitle?: string;
  description?: string;
  status?: keyof typeof STATUS_COLORS;
  icon: LucideIcon;
  actions?: React.ReactNode;
  metadata?: { label: string; value: string }[];
  onClick?: () => void;
  className?: string;
}

export function EntityCard({ 
  entity, 
  title, 
  subtitle, 
  description, 
  status, 
  icon: Icon, 
  actions, 
  metadata,
  onClick,
  className = ''
}: EntityCardProps) {
  // Get static classes based on entity type to avoid dynamic class generation issues
  const getEntityClasses = () => {
    switch (entity) {
      case 'animal':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' };
      case 'user':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' };
      case 'procedure':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-600' };
      case 'adoption':
        return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'text-pink-600' };
      case 'municipality':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-600' };
      case 'document':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-600' };
      case 'notification':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' };
      case 'report':
        return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: 'text-teal-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: 'text-gray-600' };
    }
  };

  const getStatusClasses = () => {
    if (!status) return null;
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'approved': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'active': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'inactive': return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'urgent': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const entityColors = getEntityClasses();
  const statusColors = getStatusClasses();

  return (
    <div 
      className={`
        ${entityColors.bg} ${entityColors.border} border rounded-lg p-4 
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''} 
        transition-all duration-200 ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`${entityColors.bg} p-2 rounded-lg border ${entityColors.border}`}>
            <Icon className={`w-5 h-5 ${entityColors.icon}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${entityColors.text}`}>{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        {status && statusColors && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
            {status}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-700 mb-3">{description}</p>
      )}

      {metadata && metadata.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {metadata.map((item, index) => (
            <div key={index} className="text-xs">
              <span className="text-gray-500">{item.label}:</span>
              <span className="ml-1 font-medium text-gray-700">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'approved': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'active': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'inactive': return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'urgent': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const colors = getStatusClasses();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${colors.bg} ${colors.text} ${sizeClasses[size]}
    `}>
      {label || status}
    </span>
  );
}

// Navigation Item Component
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
  entity?: keyof typeof ENTITY_COLORS;
}

export function NavItem({ icon: Icon, label, href, onClick, active, badge, entity }: NavItemProps) {
  const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors";
  const activeClasses = active 
    ? "bg-blue-100 text-blue-700 border border-blue-200" 
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  
  const entityColors = entity ? ENTITY_COLORS[entity] : null;
  const iconColor = entityColors?.icon || (active ? 'text-blue-600' : 'text-gray-500');

  const content = (
    <>
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${activeClasses}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${activeClasses} w-full text-left`}>
      {content}
    </button>
  );
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  entity?: keyof typeof ENTITY_COLORS;
}

export function SectionHeader({ title, subtitle, action, entity }: SectionHeaderProps) {
  const entityColors = entity ? ENTITY_COLORS[entity] : null;
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className={`text-2xl font-bold ${entityColors?.text || 'text-gray-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
