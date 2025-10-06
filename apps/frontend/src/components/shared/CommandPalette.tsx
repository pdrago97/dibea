'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, PawPrint, Heart, Users, FileText, Calendar, Home, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: any;
  category: 'Animais' | 'Processos' | 'Navegação' | 'Ações';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    // Navegação
    {
      id: 'nav-home',
      title: 'Ir para Início',
      description: 'Dashboard principal',
      icon: Home,
      category: 'Navegação',
      action: () => window.location.href = '/citizen/dashboard',
      keywords: ['dashboard', 'home', 'inicio']
    },
    {
      id: 'nav-search',
      title: 'Buscar Animais',
      description: 'Encontre seu novo amigo',
      icon: Search,
      category: 'Navegação',
      action: () => window.location.href = '/animals/search',
      keywords: ['buscar', 'procurar', 'adotar']
    },
    {
      id: 'nav-processes',
      title: 'Meus Processos',
      description: 'Acompanhe suas adoções',
      icon: Heart,
      category: 'Navegação',
      action: () => window.location.href = '/citizen/adoptions',
      keywords: ['processos', 'adocoes', 'andamento']
    },
    {
      id: 'nav-animals',
      title: 'Meus Animais',
      description: 'Animais já adotados',
      icon: PawPrint,
      category: 'Navegação',
      action: () => window.location.href = '/citizen/animals',
      keywords: ['meus', 'animais', 'pets']
    },
    {
      id: 'nav-docs',
      title: 'Documentos',
      description: 'Certificados e comprovantes',
      icon: FileText,
      category: 'Navegação',
      action: () => window.location.href = '/citizen/documents',
      keywords: ['documentos', 'certificados', 'rga']
    },
    {
      id: 'nav-appointments',
      title: 'Agendamentos',
      description: 'Consultas e procedimentos',
      icon: Calendar,
      category: 'Navegação',
      action: () => window.location.href = '/citizen/appointments',
      keywords: ['agendamentos', 'consultas', 'veterinario']
    },
    
    // Ações Rápidas
    {
      id: 'action-chat',
      title: 'Abrir Chat',
      description: 'Fale com o suporte',
      icon: TrendingUp,
      category: 'Ações',
      action: () => window.location.href = '/citizen/chat',
      keywords: ['chat', 'suporte', 'ajuda', 'falar']
    },
    {
      id: 'action-profile',
      title: 'Meu Perfil',
      description: 'Ver e editar informações',
      icon: Users,
      category: 'Ações',
      action: () => window.location.href = '/citizen/profile',
      keywords: ['perfil', 'conta', 'configuracoes']
    }
  ], []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  const filteredCommands = useMemo(() => {
    if (!searchTerm.trim()) return commands;

    const term = searchTerm.toLowerCase();
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(term) ||
      cmd.description?.toLowerCase().includes(term) ||
      cmd.keywords?.some(k => k.includes(term))
    );
  }, [searchTerm, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar animais, navegar, ações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 text-base border-none focus:ring-0 shadow-none"
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Nenhum resultado encontrado
                </p>
                <p className="text-xs text-gray-500">
                  Tente buscar por "animais", "processos" ou "documentos"
                </p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    {/* Category Header */}
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category}
                      </h3>
                    </div>

                    {/* Commands */}
                    {cmds.map((cmd, index) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                            ${isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'}
                          `}
                        >
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-emerald-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isSelected ? 'text-emerald-600' : 'text-gray-600'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isSelected ? 'text-emerald-700' : 'text-gray-900'
                            }`}>
                              {cmd.title}
                            </p>
                            {cmd.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {cmd.description}
                              </p>
                            )}
                          </div>

                          <ArrowRight className={`w-4 h-4 ${
                            isSelected ? 'text-emerald-600' : 'text-gray-400'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
                Selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
                Fechar
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
