'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Share2,
  ArrowLeft,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  PawPrint,
  Stethoscope,
  Home,
  Users,
  FileText,
  Camera,
  MessageSquare
} from 'lucide-react';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { PageHeader } from '@/components/navigation/Breadcrumb';
import { StatusBadge } from '@/components/ui/design-system';
import { AnimalTimeline } from '@/components/timeline/AnimalTimeline';
import { timelineService } from '@/services/timelineService';
import { useDashboard } from '@/hooks/useDashboard';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  color: string;
  weight: string;
  description: string;
  personality: string;
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
    lastVetVisit: string;
    healthNotes: string;
  };
  createdAt: string;
  updatedAt: string;
  adoptionRequirements: string[];
  contactInfo: {
    responsible: string;
    phone: string;
    email: string;
    organization: string;
  };
  story: string;
  goodWith: {
    children: boolean;
    dogs: boolean;
    cats: boolean;
  };
  energyLevel: 'low' | 'medium' | 'high';
  trainingLevel: 'none' | 'basic' | 'advanced';
  specialNeeds: string[];
  isFavorite?: boolean;
  compatibilityScore?: number;
  adoptionFee: number;
}

export default function AnimalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const animalId = params?.id as string;
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO'>('CIDADAO');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const { startAdoption } = useDashboard();

  useEffect(() => {
    loadUserData();
    loadAnimalData();
    loadTimelineData();
  }, [animalId]);

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

  const loadAnimalData = async () => {
    try {
      // Simulate loading animal data
      const mockAnimal: Animal = {
        id: animalId,
        name: 'Luna',
        species: 'dog',
        breed: 'Labrador Mix',
        age: '2 anos',
        gender: 'female',
        size: 'large',
        color: 'Dourado',
        weight: '25 kg',
        description: 'Luna é uma cadela muito carinhosa e brincalhona. Adora crianças e se dá bem com outros animais.',
        personality: 'Luna é extremamente sociável e adora fazer novos amigos. Ela é muito inteligente e aprende comandos rapidamente. Gosta de brincar no quintal e fazer caminhadas.',
        location: 'São Paulo - SP',
        municipality: 'São Paulo',
        status: 'available',
        photos: [
          '/api/placeholder/600/400',
          '/api/placeholder/600/400',
          '/api/placeholder/600/400',
          '/api/placeholder/600/400'
        ],
        characteristics: ['Carinhosa', 'Brincalhona', 'Sociável', 'Obediente', 'Inteligente', 'Ativa'],
        medicalInfo: {
          vaccinated: true,
          neutered: true,
          dewormed: true,
          microchipped: true,
          lastVetVisit: '2024-01-10',
          healthNotes: 'Animal saudável, sem problemas de saúde conhecidos.'
        },
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
        adoptionRequirements: [
          'Casa com quintal',
          'Experiência com cães grandes',
          'Tempo para exercícios diários',
          'Família ativa'
        ],
        contactInfo: {
          responsible: 'João Silva',
          phone: '(11) 99999-9999',
          email: 'joao@dibea.com',
          organization: 'Centro de Adoção São Paulo'
        },
        story: 'Luna foi encontrada abandonada em um parque quando tinha apenas 6 meses. Desde então, tem vivido em um lar temporário onde recebeu todo o amor e cuidado necessários. Agora está pronta para encontrar sua família definitiva.',
        goodWith: {
          children: true,
          dogs: true,
          cats: true
        },
        energyLevel: 'high',
        trainingLevel: 'basic',
        specialNeeds: [],
        compatibilityScore: 95,
        adoptionFee: 150
      };

      setAnimal(mockAnimal);
    } catch (error) {
      console.error('Error loading animal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimelineData = async () => {
    if (!animalId) return;

    setTimelineLoading(true);
    try {
      const timelineData = await timelineService.getAnimalTimeline(animalId);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!animal) return;

    try {
      const result = await startAdoption(animal.id);
      if (result.success) {
        // Registrar evento na timeline
        await timelineService.addAdoptionEvent(animal.id, 'started');
        // Recarregar timeline
        await loadTimelineData();
        alert('Processo de adoção iniciado com sucesso!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erro ao iniciar adoção:', error);
      alert('Erro ao iniciar processo de adoção');
    }
  };

  const handleFavorite = () => {
    if (animal) {
      setAnimal(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleAdoptionInterest = () => {
    if (userRole === 'CIDADAO') {
      router.push(`/citizen/adoption/start/${animalId}`);
    } else {
      setShowContactInfo(true);
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
      case 'available': return 'Disponível para Adoção';
      case 'adopted': return 'Adotado';
      case 'reserved': return 'Reservado';
      case 'medical_care': return 'Em Cuidados Médicos';
      case 'quarantine': return 'Em Quarentena';
      default: return status;
    }
  };

  const getEnergyLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return level;
    }
  };

  const getTrainingLevelLabel = (level: string) => {
    switch (level) {
      case 'none': return 'Sem Treinamento';
      case 'basic': return 'Treinamento Básico';
      case 'advanced': return 'Treinamento Avançado';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal não encontrado</h2>
          <p className="text-gray-600 mb-4">O animal que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.push('/animals')}>
            Voltar à Lista
          </Button>
        </div>
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
            title={animal.name}
            subtitle={`${animal.breed} • ${animal.age} • ${animal.gender === 'male' ? 'Macho' : 'Fêmea'}`}
            actions={
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                {userRole === 'CIDADAO' && (
                  <Button
                    variant={animal.isFavorite ? 'default' : 'outline'}
                    onClick={handleFavorite}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${animal.isFavorite ? 'fill-current' : ''}`} />
                    {animal.isFavorite ? 'Favoritado' : 'Favoritar'}
                  </Button>
                )}
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={animal.photos[selectedPhoto]}
                      alt={animal.name}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <StatusBadge 
                        status={animal.status as any}
                        label={getStatusLabel(animal.status)}
                      />
                    </div>
                    {userRole === 'CIDADAO' && animal.compatibilityScore && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold text-green-600">
                            {animal.compatibilityScore}% compatível
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {animal.photos.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {animal.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhoto(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              selectedPhoto === index ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={photo}
                              alt={`${animal.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre {animal.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{animal.description}</p>
                  
                  {animal.personality && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Personalidade</h4>
                      <p className="text-gray-700">{animal.personality}</p>
                    </div>
                  )}

                  {animal.story && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">História</h4>
                      <p className="text-gray-700">{animal.story}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Características</h4>
                    <div className="flex flex-wrap gap-2">
                      {animal.characteristics.map((char, index) => (
                        <Badge key={index} variant="outline">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Espécie</span>
                    <span className="font-medium">{animal.species === 'dog' ? 'Cão' : 'Gato'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Raça</span>
                    <span className="font-medium">{animal.breed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Idade</span>
                    <span className="font-medium">{animal.age}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Peso</span>
                    <span className="font-medium">{animal.weight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tamanho</span>
                    <span className="font-medium">
                      {animal.size === 'small' ? 'Pequeno' : 
                       animal.size === 'medium' ? 'Médio' : 'Grande'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cor</span>
                    <span className="font-medium">{animal.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Energia</span>
                    <span className="font-medium">{getEnergyLevelLabel(animal.energyLevel)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Treinamento</span>
                    <span className="font-medium">{getTrainingLevelLabel(animal.trainingLevel)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {animal.status === 'available' && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAdopt}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Tenho Interesse em Adotar
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Fazer Pergunta
                </Button>

                {showContactInfo && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{animal.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{animal.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{animal.contactInfo.responsible}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-8">
            <AnimalTimeline
              animalId={animal.id}
              events={timeline}
              isLoading={timelineLoading}
              onRefresh={loadTimelineData}
              onAddEvent={() => {
                // Implementar modal para adicionar evento
                console.log('Adicionar evento para', animal.name);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
