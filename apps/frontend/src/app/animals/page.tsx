'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Grid,
  List,
  Heart,
  MapPin,
  Calendar,
  Eye,
  Star,
  PawPrint,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Fish,
  Plus,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { PageHeader } from '@/components/navigation/Breadcrumb';
import { EntityCard, StatusBadge } from '@/components/ui/design-system';

interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'fish' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  color: string;
  description: string;
  location: string;
  municipality: string;
  status: 'available' | 'adopted' | 'reserved' | 'medical_care' | 'quarantine';
  photos: string[];
  characteristics: string[];
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
    microchipped: boolean;
  };
  createdAt: string;
  updatedAt: string;
  adoptionRequirements: string[];
  contactInfo: {
    responsible: string;
    phone: string;
    email: string;
  };
  isFavorite?: boolean;
  compatibilityScore?: number;
}

export default function AnimalsPage() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('available');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO'>('CIDADAO');

  useEffect(() => {
    loadUserData();
    loadAnimals();
  }, []);

  useEffect(() => {
    filterAnimals();
  }, [animals, searchTerm, selectedSpecies, selectedSize, selectedStatus]);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'CIDADAO');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAnimals = async () => {
    try {
      // Simulate loading animals data
      const mockAnimals: Animal[] = [
        {
          id: '1',
          name: 'Luna',
          species: 'dog',
          breed: 'Labrador Mix',
          age: '2 anos',
          gender: 'female',
          size: 'large',
          color: 'Dourado',
          description: 'Luna é uma cadela muito carinhosa e brincalhona. Adora crianças e se dá bem com outros animais.',
          location: 'São Paulo - SP',
          municipality: 'São Paulo',
          status: 'available',
          photos: ['/api/placeholder/400/300'],
          characteristics: ['Carinhosa', 'Brincalhona', 'Sociável', 'Obediente'],
          medicalInfo: {
            vaccinated: true,
            neutered: true,
            dewormed: true,
            microchipped: true
          },
          createdAt: '2024-01-10',
          updatedAt: '2024-01-15',
          adoptionRequirements: ['Casa com quintal', 'Experiência com cães grandes'],
          contactInfo: {
            responsible: 'João Silva',
            phone: '(11) 99999-9999',
            email: 'joao@email.com'
          },
          compatibilityScore: 95
        },
        {
          id: '2',
          name: 'Milo',
          species: 'cat',
          breed: 'Siamês',
          age: '1 ano',
          gender: 'male',
          size: 'medium',
          color: 'Cinza e branco',
          description: 'Milo é um gato independente mas carinhoso. Gosta de brincar e é muito limpo.',
          location: 'Rio de Janeiro - RJ',
          municipality: 'Rio de Janeiro',
          status: 'available',
          photos: ['/api/placeholder/400/300'],
          characteristics: ['Independente', 'Carinhoso', 'Limpo', 'Brincalhão'],
          medicalInfo: {
            vaccinated: true,
            neutered: false,
            dewormed: true,
            microchipped: false
          },
          createdAt: '2024-01-12',
          updatedAt: '2024-01-15',
          adoptionRequirements: ['Apartamento adequado', 'Tela de proteção'],
          contactInfo: {
            responsible: 'Maria Santos',
            phone: '(21) 88888-8888',
            email: 'maria@email.com'
          },
          compatibilityScore: 88
        },
        {
          id: '3',
          name: 'Rex',
          species: 'dog',
          breed: 'Pastor Alemão',
          age: '3 anos',
          gender: 'male',
          size: 'large',
          color: 'Preto e marrom',
          description: 'Rex é um cão protetor e leal. Precisa de um tutor experiente.',
          location: 'Belo Horizonte - MG',
          municipality: 'Belo Horizonte',
          status: 'reserved',
          photos: ['/api/placeholder/400/300'],
          characteristics: ['Protetor', 'Leal', 'Inteligente', 'Ativo'],
          medicalInfo: {
            vaccinated: true,
            neutered: true,
            dewormed: true,
            microchipped: true
          },
          createdAt: '2024-01-08',
          updatedAt: '2024-01-15',
          adoptionRequirements: ['Experiência com cães grandes', 'Casa com quintal grande'],
          contactInfo: {
            responsible: 'Carlos Oliveira',
            phone: '(31) 77777-7777',
            email: 'carlos@email.com'
          },
          compatibilityScore: 75
        }
      ];

      setAnimals(mockAnimals);
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnimals = () => {
    let filtered = animals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(animal =>
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.characteristics.some(char => 
          char.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by species
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(animal => animal.species === selectedSpecies);
    }

    // Filter by size
    if (selectedSize !== 'all') {
      filtered = filtered.filter(animal => animal.size === selectedSize);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(animal => animal.status === selectedStatus);
    }

    setFilteredAnimals(filtered);
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      case 'rabbit': return Rabbit;
      case 'bird': return Bird;
      case 'fish': return Fish;
      default: return PawPrint;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'adopted': return 'blue';
      case 'reserved': return 'yellow';
      case 'medical_care': return 'orange';
      case 'quarantine': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'adopted': return 'Adotado';
      case 'reserved': return 'Reservado';
      case 'medical_care': return 'Cuidados Médicos';
      case 'quarantine': return 'Quarentena';
      default: return status;
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    router.push(`/animals/${animal.id}`);
  };

  const handleFavorite = (animalId: string) => {
    setAnimals(prev => prev.map(animal => 
      animal.id === animalId 
        ? { ...animal, isFavorite: !animal.isFavorite }
        : animal
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MainNavigation 
        userRole={userRole} 
        userName="Usuário"
        onLogout={() => router.push('/auth/login')}
      />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-6 space-y-8">
          <PageHeader
            title="Animais para Adoção"
            subtitle="Encontre seu novo companheiro"
            actions={
              <div className="flex items-center space-x-3">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                {(userRole === 'ADMIN' || userRole === 'FUNCIONARIO') && (
                  <Button onClick={() => router.push('/animals/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Animal
                  </Button>
                )}
              </div>
            }
          />

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar animais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todas as Espécies</option>
                  <option value="dog">Cães</option>
                  <option value="cat">Gatos</option>
                  <option value="rabbit">Coelhos</option>
                  <option value="bird">Aves</option>
                  <option value="fish">Peixes</option>
                </select>

                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os Tamanhos</option>
                  <option value="small">Pequeno</option>
                  <option value="medium">Médio</option>
                  <option value="large">Grande</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="available">Disponível</option>
                  <option value="reserved">Reservado</option>
                  <option value="adopted">Adotado</option>
                  <option value="medical_care">Cuidados Médicos</option>
                </select>

                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros Avançados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal encontrado' : 'animais encontrados'}
            </p>
            <Button variant="outline" size="sm" onClick={() => router.push('/animals/search')}>
              Busca Avançada
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Animals Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAnimals.map((animal) => {
              const SpeciesIcon = getSpeciesIcon(animal.species);
              return (
                <Card key={animal.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={animal.photos[0] || '/api/placeholder/400/300'}
                        alt={animal.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge 
                          status={animal.status as any}
                          label={getStatusLabel(animal.status)}
                        />
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {userRole === 'CIDADAO' && (
                          <Button
                            size="sm"
                            variant={animal.isFavorite ? 'default' : 'outline'}
                            className="w-8 h-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(animal.id);
                            }}
                          >
                            <Heart className={`w-4 h-4 ${animal.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-6" onClick={() => handleAnimalClick(animal)}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{animal.name}</h3>
                        <div className="flex items-center space-x-1">
                          <SpeciesIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">{animal.breed}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {animal.age} • {animal.gender === 'male' ? 'Macho' : 'Fêmea'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {animal.location}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {animal.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {animal.characteristics.slice(0, 3).map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>

                      {userRole === 'CIDADAO' && animal.compatibilityScore && (
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">Compatibilidade</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${animal.compatibilityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {animal.compatibilityScore}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          {animal.medicalInfo.vaccinated && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Vacinado
                            </Badge>
                          )}
                          {animal.medicalInfo.neutered && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Castrado
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum animal encontrado</h3>
              <p className="text-gray-600 mb-4">Tente ajustar os filtros ou termo de busca</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedSpecies('all');
                setSelectedSize('all');
                setSelectedStatus('available');
              }}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
