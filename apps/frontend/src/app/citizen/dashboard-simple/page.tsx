"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  User,
  Clock,
  CheckCircle,
  Camera,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { AnimalService, Animal } from "@/services/animalService";
import { AdoptionService, Adoption } from "@/services/adoptionService";

export default function SimpleCitizenDashboard() {
  const { user } = useAuth();
  const [featuredAnimals, setFeaturedAnimals] = useState<Animal[]>([]);
  const [myAdoptions, setMyAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user?.id) return;

      // Carregar animais em destaque (disponíveis para adoção)
      const animals = await AnimalService.getAnimals({
        status: "DISPONIVEL",
        limit: 6,
      });
      setFeaturedAnimals(animals);

      // Carregar minhas adoções
      const adoptions = await AdoptionService.getUserAdoptions(user.id);
      setMyAdoptions(adoptions);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Em Análise";
      case "APPROVED":
        return "Aprovada";
      case "REJECTED":
        return "Rejeitada";
      case "COMPLETED":
        return "Concluída";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["CIDADAO"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["CIDADAO"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Olá, {user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Encontre seu novo melhor amigo em {user?.municipality?.name}
                </p>
              </div>
              <Link href="/animals/search">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar Animais
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Animais Disponíveis</p>
                    <p className="text-3xl font-bold mt-2">
                      {featuredAnimals.length}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Minhas Adoções</p>
                    <p className="text-3xl font-bold mt-2">
                      {myAdoptions.length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Em Análise</p>
                    <p className="text-3xl font-bold mt-2">
                      {
                        myAdoptions.filter((a) => a.status === "PENDENTE")
                          .length
                      }
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Animals */}
          {featuredAnimals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Animais Disponíveis
                </h2>
                <Link href="/animals/search">
                  <Button variant="outline">Ver Todos</Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAnimals.map((animal) => (
                  <Card
                    key={animal.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="p-0">
                      <div className="relative h-48 bg-gray-200 rounded-t-lg">
                        {animal.photos && animal.photos.length > 0 ? (
                          <img
                            src={animal.photos[0]}
                            alt={animal.name}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-800">
                            Disponível
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {animal.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {animal.breed} • {animal.age} anos
                          </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {animal.location || "SP"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{animal.species}</Badge>
                          <Badge variant="outline">{animal.size}</Badge>
                        </div>
                        <Link href={`/animals/${animal.id}`}>
                          <Button size="sm">Ver Detalhes</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* My Adoptions */}
          {myAdoptions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Minhas Adoções
              </h2>

              <div className="space-y-4">
                {myAdoptions.map((adoption) => (
                  <Card key={adoption.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            {adoption.animal?.photos &&
                            adoption.animal.photos.length > 0 ? (
                              <img
                                src={adoption.animal.photos[0]}
                                alt={adoption.animal?.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Camera className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {adoption.animal?.name}
                            </h3>
                            <p className="text-gray-600">
                              {adoption.animal?.species} •{" "}
                              {adoption.animal?.breed}
                            </p>
                            <p className="text-sm text-gray-500">
                              Solicitado em{" "}
                              {new Date(adoption.created_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge className={getStatusColor(adoption.status)}>
                            {getStatusText(adoption.status)}
                          </Badge>
                          {adoption.status === "PENDENTE" && (
                            <p className="text-sm text-gray-500 mt-2">
                              Aguardando análise
                            </p>
                          )}
                          {adoption.status === "APROVADA" && (
                            <div className="flex items-center text-green-600 mt-2">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Aprovado!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {featuredAnimals.length === 0 && myAdoptions.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comece sua jornada de adoção!
              </h3>
              <p className="text-gray-600 mb-6">
                Nenhum animal disponível no momento. Volte em breve!
              </p>
              <Link href="/animals/search">
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Explorar Animais
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
