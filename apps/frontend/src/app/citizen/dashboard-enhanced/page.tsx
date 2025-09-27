'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PawPrint,
  Heart,
  MessageSquare,
  User,
  Bell,
  Calendar,
  MapPin,
  Star,
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Gift,
  Trophy,
  Target,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  Camera,
  Share2,
  Zap,
  Play,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { EntityCard, SectionHeader, StatusBadge } from '@/components/ui/design-system';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  points: number;
  achievements: Achievement[];
  adoptionHistory: number;
  favoriteAnimals: string[];
  streak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
}

interface AnimalCard {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  description: string;
  images: string[];
  location: string;
  urgent: boolean;
  featured: boolean;
  compatibility: number;
  story?: string;
  specialNeeds?: string[];
}

interface Recommendation {
  id: string;
  type: 'animal' | 'content' | 'event' | 'tip';
  title: string;
  description: string;
  action: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
}

export default function EnhancedCitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [featuredAnimals, setFeaturedAnimals] = useState<AnimalCard[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dailyTip, setDailyTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setUser({
        id: '1',
        name: 'Pedro Reichow',
        email: 'pedro@example.com',
        level: 3,
        points: 1250,
        achievements: [
          {
            id: '1',
            title: 'Primeiro Amor',
            description: 'Favoritou seu primeiro animal',
            icon: '❤️',
            unlockedAt: '2024-01-15',
            points: 50
          },
          {
            id: '2',
            title: 'Explorador',
            description: 'Visitou 10 perfis de animais',
            icon: '🔍',
            unlockedAt: '2024-01-20',
            points: 100
          }
        ],
        adoptionHistory: 0,
        favoriteAnimals: ['1', '3'],
        streak: 7
      });

      setFeaturedAnimals([
        {
          id: '1',
          name: 'Luna',
          type: 'Cão',
          breed: 'Labrador Mix',
          age: '2 anos',
          description: 'Carinhosa e brincalhona, adora crianças',
          images: ['/api/placeholder/300/200'],
          location: 'São Paulo',
          urgent: false,
          featured: true,
          compatibility: 95,
          story: 'Luna foi encontrada abandonada, mas manteve sua alegria e amor pelas pessoas.',
          specialNeeds: []
        },
        {
          id: '2',
          name: 'Milo',
          type: 'Gato',
          breed: 'Siamês',
          age: '1 ano',
          description: 'Calmo e independente, ideal para apartamento',
          images: ['/api/placeholder/300/200'],
          location: 'São Paulo',
          urgent: true,
          featured: true,
          compatibility: 88,
          specialNeeds: ['Medicação diária']
        }
      ]);

      setRecommendations([
        {
          id: '1',
          type: 'animal',
          title: 'Rex precisa de um lar!',
          description: 'Baseado no seu perfil, Rex seria perfeito para você',
          action: 'Ver Perfil',
          href: '/citizen/animals/rex',
          priority: 'high'
        },
        {
          id: '2',
          type: 'content',
          title: 'Guia: Preparando sua casa',
          description: 'Aprenda como preparar sua casa para receber um pet',
          action: 'Ler Guia',
          href: '/citizen/guides/preparing-home',
          priority: 'medium'
        }
      ]);

      setDailyTip('💡 Dica do dia: Animais mais velhos são ótimos companheiros e já têm personalidade formada!');
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressToNextLevel = () => {
    const currentLevelPoints = (user?.level || 1) * 500;
    const nextLevelPoints = ((user?.level || 1) + 1) * 500;
    const progress = ((user?.points || 0) - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <MainNavigation 
        userRole="CIDADAO" 
        userName={user?.name}
        notifications={3}
        onLogout={() => router.push('/auth/login')}
      />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-6 space-y-8">
          {/* Welcome Header with Gamification */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Olá, {user?.name}! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Bem-vindo ao seu painel de adoção. Encontre seu novo melhor amigo!
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span className="font-semibold">Nível {user?.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span>{user?.points} pontos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-300" />
                    <span>{user?.streak} dias seguidos</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Award className="w-12 h-12 text-yellow-300" />
                </div>
                <p className="text-sm text-blue-100">Próximo nível</p>
                <div className="w-32 bg-white/20 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressToNextLevel()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Tip */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <p className="text-blue-800 font-medium">{dailyTip}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Buscar Animais</h3>
                <p className="text-gray-600 mb-4">
                  Explore todos os animais disponíveis para adoção
                </p>
                <Button className="w-full" onClick={() => router.push('/citizen/animals')}>
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Chat com IA</h3>
                <p className="text-gray-600 mb-4">
                  Converse com nossos agentes inteligentes
                </p>
                <Button className="w-full" onClick={() => router.push('/citizen/chat')}>
                  Iniciar Chat
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Meus Favoritos</h3>
                <p className="text-gray-600 mb-4">
                  Veja os animais que você favoritou
                </p>
                <Button className="w-full" onClick={() => router.push('/citizen/favorites')}>
                  Ver Favoritos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          <div>
            <SectionHeader 
              title="Recomendações Personalizadas"
              subtitle="Baseado no seu perfil e preferências"
              entity="animal"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'high' ? 'bg-red-100' :
                          rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {rec.type === 'animal' && <PawPrint className="w-5 h-5 text-blue-600" />}
                          {rec.type === 'content' && <BookOpen className="w-5 h-5 text-green-600" />}
                          {rec.type === 'event' && <Calendar className="w-5 h-5 text-purple-600" />}
                          {rec.type === 'tip' && <Sparkles className="w-5 h-5 text-yellow-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                      <StatusBadge 
                        status={rec.priority === 'high' ? 'urgent' : rec.priority === 'medium' ? 'pending' : 'active'}
                        size="sm"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push(rec.href)}
                    >
                      {rec.action}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Animals */}
          <div>
            <SectionHeader 
              title="Animais em Destaque"
              subtitle="Animais especiais que podem ser perfeitos para você"
              entity="animal"
              action={
                <Button variant="outline" onClick={() => router.push('/citizen/animals')}>
                  Ver Todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredAnimals.map((animal) => (
                <EntityCard
                  key={animal.id}
                  entity="animal"
                  title={animal.name}
                  subtitle={`${animal.breed} • ${animal.age}`}
                  description={animal.description}
                  status={animal.urgent ? 'urgent' : 'active'}
                  icon={PawPrint}
                  metadata={[
                    { label: 'Localização', value: animal.location },
                    { label: 'Compatibilidade', value: `${animal.compatibility}%` }
                  ]}
                  actions={
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        Ver Perfil
                      </Button>
                    </div>
                  }
                  onClick={() => router.push(`/citizen/animals/${animal.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <SectionHeader 
              title="Suas Conquistas"
              subtitle="Continue explorando para desbloquear mais conquistas"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      +{achievement.points} pontos
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              
              {/* Next Achievement Preview */}
              <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2 opacity-50">🏆</div>
                  <h3 className="font-semibold text-gray-500 mb-1">Próxima Conquista</h3>
                  <p className="text-sm text-gray-400 mb-2">Adote seu primeiro pet</p>
                  <Badge variant="outline" className="text-gray-500">
                    +500 pontos
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
