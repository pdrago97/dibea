'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlusCircle, 
  Search, 
  Filter,
  Heart,
  MapPin,
  Calendar,
  Weight,
  Palette,
  Info,
  Edit,
  Eye
} from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  birthDate?: string;
  weight?: number;
  color: string;
  status: string;
  description: string;
  rescueDate: string;
  createdAt: string;
  municipality: {
    name: string;
  };
  microchip?: {
    number: string;
  };
  adoptions: any[];
}

export default function AnimalsManagement() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  useEffect(() => {
    fetchAnimals();
  }, [statusFilter, speciesFilter]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (speciesFilter && speciesFilter !== 'all') params.append('species', speciesFilter);
      
      const response = await fetch(`http://localhost:3000/api/v1/animals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnimals(data.data || []);
      } else {
        setError('Erro ao carregar animais');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'bg-green-100 text-green-800';
      case 'ADOTADO':
        return 'bg-blue-100 text-blue-800';
      case 'TRATAMENTO':
        return 'bg-yellow-100 text-yellow-800';
      case 'OBITO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'Disponível';
      case 'ADOTADO':
        return 'Adotado';
      case 'TRATAMENTO':
        return 'Em Tratamento';
      case 'OBITO':
        return 'Óbito';
      case 'PERDIDO':
        return 'Perdido';
      default:
        return status;
    }
  };

  const filteredAnimals = animals.filter(animal => {
    // Search filter
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !statusFilter || statusFilter === 'all' || animal.status === statusFilter;

    // Species filter
    const matchesSpecies = !speciesFilter || speciesFilter === 'all' || animal.species === speciesFilter;

    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'Idade não informada';
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} meses`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} ano${years > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando animais...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Animais</h1>
          <p className="text-gray-600">Gerencie os animais cadastrados no sistema</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Cadastrar Animal
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou raça..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="DISPONIVEL">Disponível</SelectItem>
              <SelectItem value="ADOTADO">Adotado</SelectItem>
              <SelectItem value="TRATAMENTO">Em Tratamento</SelectItem>
              <SelectItem value="OBITO">Óbito</SelectItem>
              <SelectItem value="PERDIDO">Perdido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={speciesFilter || "all"} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por espécie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as espécies</SelectItem>
              <SelectItem value="CANINO">Canino</SelectItem>
              <SelectItem value="FELINO">Felino</SelectItem>
              <SelectItem value="OUTROS">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{animal.name}</h3>
                  <p className="text-sm text-gray-600">{animal.breed} • {animal.species}</p>
                </div>
                <Badge className={getStatusColor(animal.status)}>
                  {getStatusText(animal.status)}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {calculateAge(animal.birthDate)}
                </div>
                
                {animal.weight && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Weight className="w-4 h-4 mr-2" />
                    {animal.weight} kg
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <Palette className="w-4 h-4 mr-2" />
                  {animal.color}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {animal.municipality.name}
                </div>

                {animal.microchip && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="w-4 h-4 mr-2" />
                    Chip: {animal.microchip.number}
                  </div>
                )}
              </div>

              {/* Description */}
              {animal.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {animal.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {animal.status === 'DISPONIVEL' && (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Heart className="w-4 h-4 mr-1" />
                    Adotar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnimals.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum animal encontrado</h3>
            <p className="text-sm">
              {searchTerm || statusFilter || speciesFilter
                ? 'Tente ajustar os filtros de busca'
                : 'Cadastre o primeiro animal no sistema'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
