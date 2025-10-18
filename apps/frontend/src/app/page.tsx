'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseHelpers } from '@/lib/supabase';
import {
  Heart,
  Users,
  MapPin,
  Shield,
  Zap,
  PawPrint,
  ArrowRight,
  CheckCircle,
  Brain,
  Bot,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/navigation/Header';

interface LandingStats {
  totalAnimals: number;
  adoptedAnimals: number;
  activeMunicipalities: number;
  registeredUsers: number;
  proceduresCompleted: number;
  documentsProcessed: number;
}

interface FeaturedAnimal {
  id: string;
  name: string;
  species: string;
  age: string;
  description: string;
  image: string;
  municipality: string;
  urgent: boolean;
}

export default function LandingPage() {
  const [stats, setStats] = useState<LandingStats>({
    totalAnimals: 0,
    adoptedAnimals: 0,
    activeMunicipalities: 0,
    registeredUsers: 0,
    proceduresCompleted: 0,
    documentsProcessed: 0
  });

  const [featuredAnimals, setFeaturedAnimals] = useState<FeaturedAnimal[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    const loadLandingData = async () => {
      try {
        console.log('🔍 Loading landing data from backend + Supabase...');

        // Try backend first, fallback to direct Supabase
        try {
          const [statsResponse, animalsResponse] = await Promise.all([
            fetch('http://localhost:3000/api/v1/landing/stats'),
            fetch('http://localhost:3000/api/v1/landing/animals')
          ]);

          if (statsResponse.ok && animalsResponse.ok) {
            const statsData = await statsResponse.json();
            const animalsData = await animalsResponse.json();

            setStats({
              totalAnimals: statsData.totalAnimals || 0,
              adoptedAnimals: statsData.adoptedAnimals || 0,
              activeMunicipalities: statsData.totalMunicipalities || 0,
              registeredUsers: statsData.totalUsers || 0,
              proceduresCompleted: 0,
              documentsProcessed: 0
            });

            setFeaturedAnimals(animalsData);
            return;
          }
        } catch (backendError) {
          console.log('⚠️ Backend not available, using direct Supabase...');
        }

        // Fallback to direct Supabase
        const [statsData, animalsData] = await Promise.all([
          supabaseHelpers.getDashboardStats(),
          supabaseHelpers.getFeaturedAnimals()
        ]);

        console.log('✅ Stats loaded:', statsData);
        console.log('✅ Animals loaded:', animalsData.length, 'animals');

        setStats(statsData);
        setFeaturedAnimals(animalsData);

      } catch (error) {
        console.error('❌ Error loading landing data:', error);
        // Set empty stats on error - no more hardcoded values
        setStats({
          totalAnimals: 0,
          adoptedAnimals: 0,
          activeMunicipalities: 0,
          registeredUsers: 0,
          proceduresCompleted: 0,
          documentsProcessed: 0
        });

        // Set empty animals on error - no more hardcoded values
        setFeaturedAnimals([]);
      }
    };

    loadLandingData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDashboardUrl = () => {
    if (!user) return '/auth/login';

    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'VETERINARIO':
        return '/vet/dashboard';
      case 'FUNCIONARIO':
        return '/staff/dashboard';
      case 'CIDADAO':
      default:
        return '/citizen/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <Header transparent={true} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Powered by AI
            </Badge>
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              Agentes Inteligentes
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            O Futuro da
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              {" "}Gestão Veterinária
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Plataforma municipal inteligente que conecta animais, tutores e veterinários 
            através de <strong>IA conversacional</strong> e <strong>grafos de conhecimento</strong>. 
            Transformando o cuidado animal com tecnologia de ponta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Heart className="w-5 h-5 mr-2" />
                Quero Adotar um Animal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo/knowledge-graph">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Zap className="w-5 h-5 mr-2" />
                Ver Demo Interativa
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalAnimals.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Animais Cadastrados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.adoptedAnimals.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Adoções Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.activeMunicipalities}</div>
              <div className="text-sm text-gray-600">Municípios Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.registeredUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Usuários Registrados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logged User Quick Access */}
      {user && (
        <section className="bg-gradient-to-r from-blue-600 to-green-600 py-12">
          <div className="container mx-auto px-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-white mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Bem-vindo de volta, {user.name}!
                </h2>
              </div>
              <p className="text-blue-100 mb-6">
                Acesse seu dashboard personalizado para gerenciar seus animais,
                acompanhar adoções e muito mais.
              </p>
              <Link href={getDashboardUrl()}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Ir para Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Animals */}
      <section id="animals" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Animais Esperando por Você
            </h2>
            <p className="text-xl text-gray-600">
              Conheça alguns dos nossos amigos que estão prontos para uma nova família
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAnimals.map((animal) => (
              <Card key={animal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={animal.image} 
                    alt={animal.name}
                    className="w-full h-48 object-cover"
                  />
                  {animal.urgent && (
                    <Badge className="absolute top-4 right-4 bg-red-100 text-red-800">
                      Urgente
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{animal.name}</h3>
                    <Badge variant="outline">{animal.species}</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{animal.age}</p>
                  <p className="text-gray-700 mb-4">{animal.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {animal.municipality}
                    </div>
                    <Link href="/auth/register">
                      <Button size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Adotar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register">
              <Button size="lg" variant="outline">
                Ver Todos os Animais
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tecnologia de Ponta para o Bem-Estar Animal
            </h2>
            <p className="text-xl text-gray-600">
              Recursos inovadores que revolucionam a gestão veterinária municipal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Agentes IA Conversacionais</h3>
              <p className="text-gray-600">
                Interaja naturalmente com o sistema através de agentes inteligentes que 
                entendem suas necessidades e guiam você pelo processo.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grafo de Conhecimento</h3>
              <p className="text-gray-600">
                Conecta informações de animais, tutores, procedimentos e documentos 
                em uma rede inteligente de relacionamentos.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Segurança e Compliance</h3>
              <p className="text-gray-600">
                Sistema seguro com controle de acesso por níveis, auditoria completa 
                e conformidade com regulamentações municipais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Faça Parte da Revolução do Cuidado Animal
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a todos os recursos da plataforma. 
            Encontre seu novo melhor amigo ou contribua para o bem-estar animal em sua cidade.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Users className="w-5 h-5 mr-2" />
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
