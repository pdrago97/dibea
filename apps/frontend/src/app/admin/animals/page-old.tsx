'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, 
  Search, 
  LayoutGrid,
  LayoutList,
  Filter,
  Download,
  Upload,
  MoreVertical,
  MapPin,
  Calendar,
  Activity,
  TrendingUp,
  Users,
  Heart,
  Stethoscope,
  Home,
  Command,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Animal {
  id: string;
  nome: string;
  especie: 'CANINO' | 'FELINO' | 'OUTROS';
  raca: string | null;
  sexo: 'MACHO' | 'FEMEA';
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  data_nascimento: string | null;
  peso: number | null;
  cor: string | null;
  temperamento: string | null;
  observacoes: string | null;
  status: 'DISPONIVEL' | 'ADOTADO' | 'EM_TRATAMENTO' | 'OBITO' | 'PERDIDO';
  qr_code: string | null;
  microchip_id: string | null;
  municipality_id: string;
  created_at: string;
  updated_at: string;
  municipios: {
    nome: string;
  };
  fotos_animal: {
    id: string;
    url: string;
    principal: boolean;
    ordem: number;
  }[];
  adocoes: any[];
}

export default function ModernAnimalsManagement() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [selectedAnimals, setSelectedAnimals] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    disponivel: 0,
    adotado: 0,
    tratamento: 0,
    thisMonth: 0,
    avgAdoptionTime: 0
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, speciesFilter]);

  const fetchData = async () => {
    await Promise.all([fetchAnimals(), fetchStats()]);
  };

  const fetchStats = async () => {
    try {
      const [
        { count: total },
        { count: disponivel },
        { count: adotado },
        { count: tratamento }
      ] = await Promise.all([
        supabase.from('animais').select('*', { count: 'exact', head: true }),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'DISPONIVEL'),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'ADOTADO'),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'EM_TRATAMENTO')
      ]);

      // Get this month's data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonth } = await supabase
        .from('animais')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        total: total || 0,
        disponivel: disponivel || 0,
        adotado: adotado || 0,
        tratamento: tratamento || 0,
        thisMonth: thisMonth || 0,
        avgAdoptionTime: 12 // Mock - calculate from adoption data
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('animais')
        .select(`
          *,
          municipios (nome),
          fotos_animal (id, url, principal, ordem),
          adocoes (id, status, created_at)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (speciesFilter && speciesFilter !== 'all') {
        query = query.eq('especie', speciesFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnimals(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar animais:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = animals.filter(animal => 
    animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.raca?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                        (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) return `${ageInMonths}m`;
    return `${Math.floor(ageInMonths / 12)}a`;
  };

  const getPrimaryPhoto = (animal: Animal) => {
    const primary = animal.fotos_animal?.find(f => f.principal);
    if (primary) return primary.url;
    const first = animal.fotos_animal?.[0];
    if (first) return first.url;
    return animal.especie === 'CANINO' 
      ? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop'
      : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      DISPONIVEL: {
        label: 'Disponível',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        icon: CheckCircle2,
        dot: 'bg-emerald-500'
      },
      ADOTADO: {
        label: 'Adotado',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        icon: Heart,
        dot: 'bg-blue-500'
      },
      EM_TRATAMENTO: {
        label: 'Tratamento',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        icon: Stethoscope,
        dot: 'bg-amber-500'
      },
      OBITO: {
        label: 'Óbito',
        color: 'text-gray-700 bg-gray-50 border-gray-200',
        icon: Circle,
        dot: 'bg-gray-500'
      },
      PERDIDO: {
        label: 'Perdido',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        icon: AlertCircle,
        dot: 'bg-orange-500'
      }
    };
    return configs[status as keyof typeof configs] || configs.DISPONIVEL;
  };

  const StatCard = ({ icon: Icon, label, value, trend, trendLabel }: any) => (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-emerald-600">+{trend}%</span>
            <span className="text-gray-500">{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
    </Card>
  );

  const AnimalGridCard = ({ animal }: { animal: Animal }) => {
    const statusConfig = getStatusConfig(animal.status);
    const StatusIcon = statusConfig.icon;
    const age = calculateAge(animal.data_nascimento);

    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={getPrimaryPhoto(animal)}
            alt={animal.nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick Actions - Show on Hover */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg">
              <Heart className="w-4 h-4 text-gray-700" />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg">
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm ${statusConfig.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
              <span className="text-xs font-medium">{statusConfig.label}</span>
            </div>
          </div>

          {/* Species Tag */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-lg">{animal.especie === 'CANINO' ? '🐕' : '🐈'}</span>
              <span className="text-xs font-medium text-gray-700">
                {animal.especie === 'CANINO' ? 'Cachorro' : 'Gato'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{animal.nome}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{animal.raca || 'SRD'}</span>
              <span className="text-gray-300">•</span>
              <span>{animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}</span>
              {age && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{age}</span>
                </>
              )}
            </div>
          </div>

          {/* Info Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200">
              <Activity className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">{animal.porte}</span>
            </div>
            {animal.peso && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-xs font-medium text-gray-700">{animal.peso}kg</span>
              </div>
            )}
            {animal.microchip_id && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md border border-blue-200">
                <span className="text-xs font-medium text-blue-700">Microchip</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{animal.municipios.nome}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 h-9 text-sm font-medium border-gray-200 hover:bg-gray-50"
              onClick={() => window.location.href = `/admin/animals/${animal.id}`}
            >
              Ver Detalhes
            </Button>
            {animal.status === 'DISPONIVEL' && (
              <Button 
                className="flex-1 h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Heart className="w-4 h-4 mr-1.5" />
                Adotar
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const AnimalListRow = ({ animal }: { animal: Animal }) => {
    const statusConfig = getStatusConfig(animal.status);
    const StatusIcon = statusConfig.icon;
    const age = calculateAge(animal.data_nascimento);

    return (
      <div className="group flex items-center gap-4 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
        {/* Checkbox */}
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={selectedAnimals.has(animal.id)}
          onChange={() => {
            const newSelected = new Set(selectedAnimals);
            if (newSelected.has(animal.id)) {
              newSelected.delete(animal.id);
            } else {
              newSelected.add(animal.id);
            }
            setSelectedAnimals(newSelected);
          }}
        />

        {/* Photo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={getPrimaryPhoto(animal)}
            alt={animal.nome}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name & Breed */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{animal.nome}</p>
          <p className="text-sm text-gray-500 truncate">{animal.raca || 'SRD'}</p>
        </div>

        {/* Species */}
        <div className="flex items-center gap-2 w-32">
          <span className="text-lg">{animal.especie === 'CANINO' ? '🐕' : '🐈'}</span>
          <span className="text-sm text-gray-600">
            {animal.especie === 'CANINO' ? 'Cachorro' : 'Gato'}
          </span>
        </div>

        {/* Status */}
        <div className="w-36">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusConfig.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
            {statusConfig.label}
          </div>
        </div>

        {/* Age */}
        <div className="w-20 text-sm text-gray-600">
          {age || '-'}
        </div>

        {/* Municipality */}
        <div className="w-48 text-sm text-gray-600 truncate">
          {animal.municipios.nome}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3"
            onClick={() => window.location.href = `/admin/animals/${animal.id}`}
          >
            Ver
          </Button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <a href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Animais</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Animais</h1>
              <p className="text-gray-600">Gerencie todos os animais do município</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Importar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <PlusCircle className="w-5 h-5" />
                Novo Animal
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Activity}
              label="Total de Animais"
              value={stats.total}
              trend={12}
              trendLabel="vs mês anterior"
            />
            <StatCard 
              icon={Heart}
              label="Disponíveis"
              value={stats.disponivel}
            />
            <StatCard 
              icon={CheckCircle2}
              label="Adotados"
              value={stats.adotado}
              trend={8}
              trendLabel="este mês"
            />
            <StatCard 
              icon={Stethoscope}
              label="Em Tratamento"
              value={stats.tratamento}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          {/* Search & Filters */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, raça, ID... (Cmd+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
            
            <Button variant="outline" className="gap-2 h-10">
              <Filter className="w-4 h-4" />
              Filtros
              {(statusFilter !== 'all' || speciesFilter !== 'all') && (
                <Badge className="ml-1 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {[statusFilter !== 'all' ? 1 : 0, speciesFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAnimals.size > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedAnimals.size} {selectedAnimals.size === 1 ? 'animal selecionado' : 'animais selecionados'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Atualizar Status</Button>
              <Button variant="outline" size="sm">Exportar</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAnimals(new Set())}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Animals Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimals.map(animal => (
              <AnimalGridCard key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border-0 shadow-sm">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAnimals(new Set(filteredAnimals.map(a => a.id)));
                  } else {
                    setSelectedAnimals(new Set());
                  }
                }}
              />
              <div className="w-12"></div>
              <div className="flex-1">Nome</div>
              <div className="w-32">Espécie</div>
              <div className="w-36">Status</div>
              <div className="w-20">Idade</div>
              <div className="w-48">Município</div>
              <div className="w-32">Ações</div>
            </div>

            {/* Table Body */}
            {filteredAnimals.map(animal => (
              <AnimalListRow key={animal.id} animal={animal} />
            ))}
          </Card>
        )}

        {/* Empty State */}
        {filteredAnimals.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum animal encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || speciesFilter !== 'all'
                ? 'Tente ajustar os filtros ou busca'
                : 'Comece cadastrando o primeiro animal'}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <PlusCircle className="w-5 h-5" />
              Cadastrar Primeiro Animal
            </Button>
          </div>
        )}

        {/* Footer */}
        {filteredAnimals.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <p>
              Exibindo <span className="font-medium text-gray-900">{filteredAnimals.length}</span> de{' '}
              <span className="font-medium text-gray-900">{stats.total}</span> animais
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Anterior</Button>
              <Button variant="outline" size="sm">Próxima</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
