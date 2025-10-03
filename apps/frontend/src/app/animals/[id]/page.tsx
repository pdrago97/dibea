"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Calendar,
  Camera,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  Home,
  PawPrint,
  Share2,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import { AnimalPhotoUpload } from "@/components/ui/upload";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/design-system";

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  size: "small" | "medium" | "large";
  description: string;
  location: string;
  status: "available" | "adopted" | "reserved";
  photos: string[];
  isFavorite?: boolean;
  compatibilityScore?: number;
  personality?: string;
  story?: string;
  characteristics?: string[];
  weight?: number;
  color?: string;
  energyLevel?: string;
  trainingLevel?: string;
  contactInfo?: {
    phone: string;
    email: string;
    responsible: string;
  };
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
  };
}

export default function AnimalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const animalId = params?.id as string;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [userRole, setUserRole] = useState<
    "ADMIN" | "FUNCIONARIO" | "VETERINARIO" | "CIDADAO"
  >("CIDADAO");
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    loadAnimalData();
  }, [animalId]);

  const loadAnimalData = async () => {
    try {
      // Simulate API call
      const mockAnimal: Animal = {
        id: animalId,
        name: "Luna",
        species: "dog",
        breed: "Labrador Mix",
        age: 2,
        gender: "female",
        size: "large",
        description:
          "Luna é uma cadela muito carinhosa e brincalhona. Ela adora brincar com crianças e outros animais.",
        location: "São Paulo - SP",
        status: "available",
        photos: [],
        medicalInfo: {
          vaccinated: true,
          neutered: true,
          dewormed: true,
        },
      };

      setAnimal(mockAnimal);
    } catch (error) {
      console.error("Error loading animal data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdopt = async () => {
    router.push(`/citizen/adoption/start/${animalId}`);
  };

  const handleUploadComplete = (fileUrls: string[]) => {
    if (animal) {
      setAnimal({
        ...animal,
        photos: [...animal.photos, ...fileUrls],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Animal não encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            O animal que você está procurando não existe.
          </p>
          <Button onClick={() => router.push("/animals/search")}>
            Voltar à Busca
          </Button>
        </div>
      </div>
    );
  }

  const handleFavorite = () => {
    if (animal) {
      setAnimal((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null,
      );
    }
  };

  const handleAdoptionInterest = () => {
    if (userRole === "CIDADAO") {
      router.push(`/citizen/adoption/start/${animalId}`);
    } else {
      setShowContactInfo(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "green";
      case "adopted":
        return "blue";
      case "reserved":
        return "yellow";
      case "medical_care":
        return "orange";
      case "quarantine":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível para Adoção";
      case "adopted":
        return "Adotado";
      case "reserved":
        return "Reservado";
      case "medical_care":
        return "Em Cuidados Médicos";
      case "quarantine":
        return "Em Quarentena";
      default:
        return status;
    }
  };

  const getEnergyLevelLabel = (level: string) => {
    switch (level) {
      case "low":
        return "Baixa";
      case "medium":
        return "Média";
      case "high":
        return "Alta";
      default:
        return level;
    }
  };

  const getTrainingLevelLabel = (level: string) => {
    switch (level) {
      case "none":
        return "Sem Treinamento";
      case "basic":
        return "Treinamento Básico";
      case "advanced":
        return "Treinamento Avançado";
      default:
        return level;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Animal não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O animal que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => router.push("/animals")}>
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
        onLogout={() => router.push("/auth/login")}
      />

      <div className="flex-1 lg:ml-64">
        <div className="p-6 space-y-8">
          <PageHeader
            title={animal.name}
            subtitle={`${animal.breed} • ${animal.age} • ${animal.gender === "male" ? "Macho" : "Fêmea"}`}
            actions={
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                {userRole === "CIDADAO" && (
                  <Button
                    variant={animal.isFavorite ? "default" : "outline"}
                    onClick={handleFavorite}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${animal.isFavorite ? "fill-current" : ""}`}
                    />
                    {animal.isFavorite ? "Favoritado" : "Favoritar"}
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
                    {userRole === "CIDADAO" && animal.compatibilityScore && (
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
                              selectedPhoto === index
                                ? "border-blue-500"
                                : "border-gray-200"
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
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Personalidade
                      </h4>
                      <p className="text-gray-700">{animal.personality}</p>
                    </div>
                  )}

                  {animal.story && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        História
                      </h4>
                      <p className="text-gray-700">{animal.story}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Características
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {animal.characteristics?.map((char, index) => (
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
                    <span className="font-medium">
                      {animal.species === "dog" ? "Cão" : "Gato"}
                    </span>
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
                      {animal.size === "small"
                        ? "Pequeno"
                        : animal.size === "medium"
                          ? "Médio"
                          : "Grande"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cor</span>
                    <span className="font-medium">{animal.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Energia</span>
                    <span className="font-medium">
                      {getEnergyLevelLabel(animal.energyLevel || "medium")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Treinamento</span>
                    <span className="font-medium">
                      {getTrainingLevelLabel(animal.trainingLevel || "basic")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {animal.status === "available" && (
                  <Button className="w-full" size="lg" onClick={handleAdopt}>
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
                      <CardTitle className="text-sm">
                        Informações de Contato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {animal.contactInfo?.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {animal.contactInfo?.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {animal.contactInfo?.responsible}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
