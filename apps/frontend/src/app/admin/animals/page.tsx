'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { 
  Plus,

  Filter,
  Download,
  MoreHorizontal,
  MapPin,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight
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
  status: 'DISPONIVEL' | 'ADOTADO' | 'EM_TRATAMENTO' | 'OBITO' | 'PERDIDO';
  municipality_id: string;
  created_at: string;
  municipios: {
    nome: string;
  };
  fotos_animal: {
    id: string;
    url: string;
    principal: boolean;
  }[];
}

export default function AnimalsPageV2() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    disponivel: 0,
    adotado: 0,
    tratamento: 0
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

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

      setStats({
        total: total || 0,
        disponivel: disponivel || 0,
        adotado: adotado || 0,
        tratamento: tratamento || 0
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
          fotos_animal (id, url, principal, ordem)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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
      DISPONIVEL: { label: 'Disponível', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
      ADOTADO: { label: 'Adotado', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
      EM_TRATAMENTO: { label: 'Tratamento', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
      OBITO: { label: 'Óbito', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle },
      PERDIDO: { label: 'Perdido', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle }
    };
    return configs[status as keyof typeof configs] || configs.DISPONIVEL;
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${color} rounded-lg`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const AnimalCard = ({ animal }: { animal: Animal }) => {
    const statusConfig = getStatusConfig(animal.status);
    const StatusIcon = statusConfig.icon;
    const age = calculateAge(animal.data_nascimento);

    return (
      <Card className="group overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={getPrimaryPhoto(animal)}
            alt={animal.nome}
            className="w-full h-full object-cover"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </div>
          </div>

          {/* Species */}
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {animal.especie === 'CANINO' ? '🐕 Cão' : '🐈 Gato'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{animal.nome}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{animal.raca || 'SRD'}</span>
              <span>•</span>
              <span>{animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}</span>
              {age && (
                <>
                  <span>•</span>
                  <span>{age}</span>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>{animal.porte}</span>
            </div>
            {animal.peso && (
              <div className="flex items-center gap-1">
                <span>{animal.peso}kg</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{animal.municipios.nome}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = `/admin/animals/${animal.id}`}
            >
              Ver detalhes
            </Button>
            {animal.status === 'DISPONIVEL' && (
              <Button 
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Adotar
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-200 px-8 py-3 bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Animais</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Animais</h1>
            <p className="text-gray-600">Gerencie todos os animais do município</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 border-gray-300">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="w-4 h-4" />
              Novo Animal
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            icon={Activity}
            label="Total"
            value={stats.total}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard 
            icon={CheckCircle}
            label="Disponíveis"
            value={stats.disponivel}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard 
            icon={CheckCircle}
            label="Adotados"
            value={stats.adotado}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard 
            icon={Clock}
            label="Em Tratamento"
            value={stats.tratamento}
            color="bg-amber-100 text-amber-600"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          
          <Button variant="outline" className="gap-2 border-gray-300">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Animals Grid (Pinterest/Masonry style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map(animal => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>

        {/* Empty State */}
        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum animal encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Comece cadastrando o primeiro animal'}
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Animal
            </Button>
          </div>
        )}

        {/* Footer */}
        {filteredAnimals.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Mostrando {filteredAnimals.length} de {stats.total} animais
          </div>
        )}
      </div>
    </div>
  );
}
