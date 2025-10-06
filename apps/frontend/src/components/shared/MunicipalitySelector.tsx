'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Check, Search, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

interface Municipality {
  id: string;
  nome: string;
  uf: string;
  ativo: boolean;
}

interface MunicipalitySelectorProps {
  currentMunicipalityId?: string;
  onSelect?: (municipality: Municipality) => void;
  userRole?: 'ADMIN' | 'SUPER_ADMIN' | 'FUNCIONARIO' | 'CIDADAO' | 'TUTOR';
}

export default function MunicipalitySelector({ 
  currentMunicipalityId,
  onSelect,
  userRole = 'CIDADAO'
}: MunicipalitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [current, setCurrent] = useState<Municipality | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Admins podem ver todos, cidadãos só podem solicitar mudança
  const canChangeMunicipality = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

  useEffect(() => {
    fetchMunicipalities();
    
    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentMunicipalityId && municipalities.length > 0) {
      const found = municipalities.find(m => m.id === currentMunicipalityId);
      if (found) setCurrent(found);
    } else if (municipalities.length > 0) {
      setCurrent(municipalities[0]); // Default to first
    }
  }, [currentMunicipalityId, municipalities]);

  const fetchMunicipalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setMunicipalities(data || []);
    } catch (err) {
      console.error('Erro ao buscar municípios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (municipality: Municipality) => {
    if (canChangeMunicipality) {
      setCurrent(municipality);
      setIsOpen(false);
      onSelect?.(municipality);
      // TODO: Save to user preferences/context
    } else {
      // Cidadão precisa solicitar mudança
      alert('Para trocar de município, envie uma solicitação pelo chat ou configurações.');
      setIsOpen(false);
    }
  };

  const filteredMunicipalities = municipalities.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.uf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
      >
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {current ? `${current.nome} - ${current.uf}` : 'Selecionar município'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {canChangeMunicipality ? 'Trocar Município' : 'Seu Município'}
              </h3>
              {!canChangeMunicipality && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Requer aprovação
                </span>
              )}
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Carregando municípios...
              </div>
            ) : filteredMunicipalities.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhum município encontrado
              </div>
            ) : (
              <div className="py-2">
                {filteredMunicipalities.map((municipality) => {
                  const isSelected = current?.id === municipality.id;
                  
                  return (
                    <button
                      key={municipality.id}
                      onClick={() => handleSelect(municipality)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-emerald-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                            {municipality.nome}
                          </p>
                          <p className="text-xs text-gray-500">{municipality.uf}</p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer (for non-admins) */}
          {!canChangeMunicipality && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">
                💡 Para alterar seu município, entre em contato com o suporte.
              </p>
              <Button size="sm" variant="outline" className="w-full text-xs">
                Solicitar Mudança
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
