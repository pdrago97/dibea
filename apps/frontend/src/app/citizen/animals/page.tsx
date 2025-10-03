"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, MapPin, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimalService } from "@/services/animalService";
import { useAuth } from "@/contexts/AuthContext";

interface Animal {
  id: string;
  name: string;
  species: "CANINO" | "FELINO" | "OUTRO";
  breed: string;
  age: number;
  gender: "MACHO" | "FEMEA";
  size: "PEQUENO" | "MEDIO" | "GRANDE";
  description: string;
  location: string;
  status: "DISPONIVEL" | "ADOTADO" | "RESERVADO" | "CUIDADOS_MEDICOS";
  photos: string[];
  medicalInfo: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
  };
  created_at: string;
  updated_at: string;
  municipality_id: string;
}

interface FilterState {
  species: string;
  size: string;
  age: string;
  status: string;
  search: string;
}

export default function CitizenAnimalsPage() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    species: "",
    size: "",
    age: "",
    status: "DISPONIVEL",
    search: "",
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [animals, filters]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const animalsData = await AnimalService.getAnimals({
        status: "DISPONIVEL",
      });
      setAnimals(animalsData);
    } catch (error) {
      console.error("Error loading animals:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = animals.filter((animal) => {
      // Only show available animals by default
      if (filters.status && animal.status !== filters.status) {
        return false;
      }

      // Species filter
      if (filters.species && animal.species !== filters.species) {
        return false;
      }

      // Size filter
      if (filters.size && animal.size !== filters.size) {
        return false;
      }

      // Age filter
      if (filters.age) {
        const animalAge = animal.age || 0;
        switch (filters.age) {
          case "filhote":
            if (animalAge > 1) return false;
            break;
          case "jovem":
            if (animalAge <= 1 || animalAge > 5) return false;
            break;
          case "adulto":
            if (animalAge <= 5 || animalAge > 10) return false;
            break;
          case "idoso":
            if (animalAge <= 10) return false;
            break;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          animal.name.toLowerCase().includes(searchLower) ||
          animal.breed?.toLowerCase().includes(searchLower) ||
          animal.description?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });

    setFilteredAnimals(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      species: "",
      size: "",
      age: "",
      status: "DISPONIVEL",
      search: "",
    });
  };

  const handleAdoptClick = (animalId: string) => {
    window.location.href = `/citizen/adoption/start/${animalId}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Carregando animais disponíveis...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Encontre Seu Melhor Amigo
        </h1>
        <p className="text-gray-600">
          Descubra animais incríveis esperando por um lar amoroso
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Buscar e Filtrar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, raça..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Species Filter */}
            <Select
              value={filters.species}
              onValueChange={(value) => handleFilterChange("species", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="CANINO">Cães</SelectItem>
                <SelectItem value="FELINO">Gatos</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>

            {/* Size Filter */}
            <Select
              value={filters.size}
              onValueChange={(value) => handleFilterChange("size", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="PEQUENO">Pequeno</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="GRANDE">Grande</SelectItem>
              </SelectContent>
            </Select>

            {/* Age Filter */}
            <Select
              value={filters.age}
              onValueChange={(value) => handleFilterChange("age", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Idade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="filhote">Filhote (até 1 ano)</SelectItem>
                <SelectItem value="jovem">Jovem (1-5 anos)</SelectItem>
                <SelectItem value="adulto">Adulto (5-10 anos)</SelectItem>
                <SelectItem value="idoso">Idoso (10+ anos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredAnimals.length} animais encontrados
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAnimals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum animal encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou volte mais tarde para novos animais.
              </p>
              <Button onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => (
            <Card
              key={animal.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Photo */}
              <div className="aspect-square bg-gray-100 relative">
                {animal.photos && animal.photos.length > 0 ? (
                  <img
                    src={animal.photos[0]}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="h-16 w-16 text-gray-300" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      animal.status === "DISPONIVEL" ? "default" : "secondary"
                    }
                    className="bg-green-500 text-white"
                  >
                    {animal.status === "DISPONIVEL"
                      ? "Disponível"
                      : animal.status}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {animal.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {animal.breed || `${animal.species} - ${animal.gender}`}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Idade:</span>
                    <span>
                      {animal.age ? `${animal.age} anos` : "Não informado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Porte:</span>
                    <span>{animal.size || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Sexo:</span>
                    <span>{animal.gender === "MACHO" ? "Macho" : "Fêmea"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Porte:</span>
                    <span>{animal.size || "Não informado"}</span>
                  </div>
                </div>

                {/* Location */}
                {animal.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{animal.location}</span>
                  </div>
                )}

                {/* Adopt Button */}
                <Button
                  className="w-full"
                  onClick={() => handleAdoptClick(animal.id)}
                  disabled={animal.status !== "DISPONIVEL"}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {animal.status === "DISPONIVEL" ? "Adotar" : "Indisponível"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
