'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  Heart,
  Eye,
  Star,
  PawPrint,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Fish,
  Sliders,
  RotateCcw,
  Save,
  Share2
} from 'lucide-react';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { PageHeader } from '@/components/navigation/Breadcrumb';
import { StatusBadge } from '@/components/ui/design-system';

interface SearchFilters {
  query: string;
  species: string[];
  breeds: string[];
  ageRange: { min: number; max: number };
  size: string[];
  gender: string[];
  status: string[];
  location: string;
  municipality: string[];
  characteristics: string[];
  medicalRequirements: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
    microchipped: boolean;
  };
  adoptionRequirements: string[];
  compatibilityScore: number;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  ageInMonths: number;
  gender: string;
  size: string;
  color: string;
  description: string;
  location: string;
  municipality: string;
  status: string;
  photos: string[];
  characteristics: string[];
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
    microchipped: boolean;
  };
  adoptionRequirements: string[];
  compatibilityScore?: number;
}

export default function AnimalSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO'>('CIDADAO');
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get('q') || '',
    species: [],
    breeds: [],
    ageRange: { min: 0, max: 20 },
    size: [],
    gender: [],
    status: ['available'],
    location: '',
    municipality: [],
    characteristics: [],
    medicalRequirements: {
      vaccinated: false,
      neutered: false,
      dewormed: false,
      microchipped: false
    },
    adoptionRequirements: [],
    compatibilityScore: 0
  });

  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  // Available options for filters
  const speciesOptions = [
    { value: 'dog', label: 'Cães', icon: Dog },
    { value: 'cat', label: 'Gatos', icon: Cat },
    { value: 'rabbit', label: 'Coelhos', icon: Rabbit },
    { value: 'bird', label: 'Aves', icon: Bird },
    { value: 'fish', label: 'Peixes', icon: Fish }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Macho' },
    { value: 'female', label: 'Fêmea' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Disponível' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'adopted', label: 'Adotado' },
    { value: 'medical_care', label: 'Cuidados Médicos' }
  ];

  const characteristicsOptions = [
    'Carinhoso', 'Brincalhão', 'Calmo', 'Ativo', 'Sociável', 'Independente',
    'Protetor', 'Obediente', 'Inteligente', 'Dócil', 'Energético', 'Tranquilo'
  ];

  const municipalityOptions = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
    'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus'
  ];

  useEffect(() => {
    loadUserData();
    performSearch();
  }, []);

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

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Simulate API search with filters
      const mockResults: Animal[] = [
        {
          id: '1',
          name: 'Luna',
          species: 'dog',
          breed: 'Labrador Mix',
          age: '2 anos',
          ageInMonths: 24,
          gender: 'female',
          size: 'large',
          color: 'Dourado',
          description: 'Luna é uma cadela muito carinhosa e brincalhona.',
          location: 'São Paulo - SP',
          municipality: 'São Paulo',
          status: 'available',
          photos: ['/api/placeholder/400/300'],
          characteristics: ['Carinhosa', 'Brincalhona', 'Sociável'],
          medicalInfo: {
            vaccinated: true,
            neutered: true,
            dewormed: true,
            microchipped: true
          },
          adoptionRequirements: ['Casa com quintal'],
          compatibilityScore: 95
        },
        {
          id: '2',
          name: 'Milo',
          species: 'cat',
          breed: 'Siamês',
          age: '1 ano',
          ageInMonths: 12,
          gender: 'male',
          size: 'medium',
          color: 'Cinza e branco',
          description: 'Milo é um gato independente mas carinhoso.',
          location: 'Rio de Janeiro - RJ',
          municipality: 'Rio de Janeiro',
          status: 'available',
          photos: ['/api/placeholder/400/300'],
          characteristics: ['Independente', 'Carinhoso'],
          medicalInfo: {
            vaccinated: true,
            neutered: false,
            dewormed: true,
            microchipped: false
          },
          adoptionRequirements: ['Apartamento adequado'],
          compatibilityScore: 88
        }
      ];

      // Apply filters
      let filtered = mockResults;

      if (filters.query) {
        filtered = filtered.filter(animal =>
          animal.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          animal.breed.toLowerCase().includes(filters.query.toLowerCase()) ||
          animal.description.toLowerCase().includes(filters.query.toLowerCase())
        );
      }

      if (filters.species.length > 0) {
        filtered = filtered.filter(animal => filters.species.includes(animal.species));
      }

      if (filters.size.length > 0) {
        filtered = filtered.filter(animal => filters.size.includes(animal.size));
      }

      if (filters.gender.length > 0) {
        filtered = filtered.filter(animal => filters.gender.includes(animal.gender));
      }

      if (filters.status.length > 0) {
        filtered = filtered.filter(animal => filters.status.includes(animal.status));
      }

      if (filters.municipality.length > 0) {
        filtered = filtered.filter(animal => filters.municipality.includes(animal.municipality));
      }

      if (filters.characteristics.length > 0) {
        filtered = filtered.filter(animal =>
          filters.characteristics.some(char => animal.characteristics.includes(char))
        );
      }

      // Age range filter
      filtered = filtered.filter(animal =>
        animal.ageInMonths >= filters.ageRange.min * 12 &&
        animal.ageInMonths <= filters.ageRange.max * 12
      );

      // Medical requirements filter
      if (filters.medicalRequirements.vaccinated) {
        filtered = filtered.filter(animal => animal.medicalInfo.vaccinated);
      }
      if (filters.medicalRequirements.neutered) {
        filtered = filtered.filter(animal => animal.medicalInfo.neutered);
      }

      // Compatibility score filter
      if (filters.compatibilityScore > 0) {
        filtered = filtered.filter(animal => 
          (animal.compatibilityScore || 0) >= filters.compatibilityScore
        );
      }

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterToggle = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key as keyof SearchFilters].includes(value)
        ? (prev[key as keyof SearchFilters] as string[]).filter(item => item !== value)
        : [...(prev[key as keyof SearchFilters] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      species: [],
      breeds: [],
      ageRange: { min: 0, max: 20 },
      size: [],
      gender: [],
      status: ['available'],
      location: '',
      municipality: [],
      characteristics: [],
      medicalRequirements: {
        vaccinated: false,
        neutered: false,
        dewormed: false,
        microchipped: false
      },
      adoptionRequirements: [],
      compatibilityScore: 0
    });
  };

  const saveSearch = () => {
    const searchName = prompt('Nome para esta busca:');
    if (searchName) {
      const newSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: { ...filters },
        createdAt: new Date().toISOString()
      };
      setSavedSearches(prev => [...prev, newSearch]);
      localStorage.setItem('savedAnimalSearches', JSON.stringify([...savedSearches, newSearch]));
    }
  };

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
            title="Busca Avançada de Animais"
            subtitle="Use filtros detalhados para encontrar o animal ideal"
            actions={
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={saveSearch}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Busca
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Filtros</span>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Query */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Buscar por nome ou descrição
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Digite aqui..."
                        value={filters.query}
                        onChange={(e) => handleFilterChange('query', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Species */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Espécie
                    </label>
                    <div className="space-y-2">
                      {speciesOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`species-${option.value}`}
                            checked={filters.species.includes(option.value)}
                            onCheckedChange={() => handleArrayFilterToggle('species', option.value)}
                          />
                          <label htmlFor={`species-${option.value}`} className="text-sm flex items-center">
                            <option.icon className="w-4 h-4 mr-2" />
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tamanho
                    </label>
                    <div className="space-y-2">
                      {sizeOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${option.value}`}
                            checked={filters.size.includes(option.value)}
                            onCheckedChange={() => handleArrayFilterToggle('size', option.value)}
                          />
                          <label htmlFor={`size-${option.value}`} className="text-sm">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Gênero
                    </label>
                    <div className="space-y-2">
                      {genderOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`gender-${option.value}`}
                            checked={filters.gender.includes(option.value)}
                            onCheckedChange={() => handleArrayFilterToggle('gender', option.value)}
                          />
                          <label htmlFor={`gender-${option.value}`} className="text-sm">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Idade (anos)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.ageRange.min}
                          onChange={(e) => handleFilterChange('ageRange', {
                            ...filters.ageRange,
                            min: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-gray-500">até</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.ageRange.max}
                          onChange={(e) => handleFilterChange('ageRange', {
                            ...filters.ageRange,
                            max: parseInt(e.target.value) || 20
                          })}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical Requirements */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cuidados Médicos
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vaccinated"
                          checked={filters.medicalRequirements.vaccinated}
                          onCheckedChange={(checked) => handleFilterChange('medicalRequirements', {
                            ...filters.medicalRequirements,
                            vaccinated: checked
                          })}
                        />
                        <label htmlFor="vaccinated" className="text-sm">Vacinado</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="neutered"
                          checked={filters.medicalRequirements.neutered}
                          onCheckedChange={(checked) => handleFilterChange('medicalRequirements', {
                            ...filters.medicalRequirements,
                            neutered: checked
                          })}
                        />
                        <label htmlFor="neutered" className="text-sm">Castrado</label>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score (for citizens) */}
                  {userRole === 'CIDADAO' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Compatibilidade Mínima (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.compatibilityScore}
                        onChange={(e) => handleFilterChange('compatibilityScore', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <Button onClick={performSearch} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Buscando...' : `${searchResults.length} resultados encontrados`}
                </h3>
                <Button variant="outline" onClick={() => router.push('/animals')}>
                  Voltar à Lista
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {searchResults.map((animal) => (
                    <Card key={animal.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                              label={animal.status}
                            />
                          </div>
                        </div>

                        <div className="p-6" onClick={() => router.push(`/animals/${animal.id}`)}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">{animal.name}</h3>
                            <span className="text-sm text-gray-600">{animal.breed}</span>
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

                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum animal encontrado</h3>
                  <p className="text-gray-600 mb-4">Tente ajustar os filtros de busca</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
