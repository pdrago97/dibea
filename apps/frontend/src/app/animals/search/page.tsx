"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Calendar,
  Heart,
  Camera,
  Dog,
  Cat,
  RotateCcw,
} from "lucide-react";

interface SearchFilters {
  query: string;
  species: string;
  size: string;
  gender: string;
  age: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  description: string;
  location: string;
  status: string;
  photos: string[];
}

export default function AnimalSearchPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    species: "",
    size: "",
    gender: "",
    age: "",
  });

  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Available options for filters
  const speciesOptions = [
    { value: "", label: "Todos" },
    { value: "dog", label: "Cães", icon: Dog },
    { value: "cat", label: "Gatos", icon: Cat },
  ];

  const sizeOptions = [
    { value: "", label: "Todos" },
    { value: "small", label: "Pequeno" },
    { value: "medium", label: "Médio" },
    { value: "large", label: "Grande" },
  ];

  const genderOptions = [
    { value: "", label: "Todos" },
    { value: "male", label: "Macho" },
    { value: "female", label: "Fêmea" },
  ];

  const ageOptions = [
    { value: "", label: "Todas" },
    { value: "baby", label: "Filhote" },
    { value: "young", label: "Jovem" },
    { value: "adult", label: "Adulto" },
    { value: "senior", label: "Idoso" },
  ];

  // Load initial data
  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      const mockResults: Animal[] = [
        {
          id: "1",
          name: "Luna",
          species: "dog",
          breed: "Labrador Mix",
          age: 2,
          gender: "female",
          size: "large",
          description: "Luna é uma cadela muito carinhosa e brincalhona.",
          location: "São Paulo - SP",
          status: "available",
          photos: ["/api/placeholder/400/300"],
        },
        {
          id: "2",
          name: "Milo",
          species: "cat",
          breed: "Siamês",
          age: 1,
          gender: "male",
          size: "medium",
          description: "Milo é um gato independente mas carinhoso.",
          location: "São Paulo - SP",
          status: "available",
          photos: ["/api/placeholder/400/300"],
        },
      ];

      // Apply filters
      let filtered = mockResults;

      if (filters.query) {
        filtered = filtered.filter(
          (animal) =>
            animal.name.toLowerCase().includes(filters.query.toLowerCase()) ||
            animal.breed.toLowerCase().includes(filters.query.toLowerCase()) ||
            animal.description
              .toLowerCase()
              .includes(filters.query.toLowerCase()),
        );
      }

      if (filters.species) {
        filtered = filtered.filter(
          (animal) => animal.species === filters.species,
        );
      }

      if (filters.size) {
        filtered = filtered.filter((animal) => animal.size === filters.size);
      }

      if (filters.gender) {
        filtered = filtered.filter(
          (animal) => animal.gender === filters.gender,
        );
      }

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      species: "",
      size: "",
      gender: "",
      age: "",
    });
  };

  const handleAdoptAnimal = (animalId: string) => {
    router.push(`/citizen/adoption/start/${animalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Encontre seu novo amigo
          </h1>
          <p className="text-gray-600">
            Explore animais disponíveis para adoção na sua região
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Buscar por nome ou raça..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>

              <select
                value={filters.species}
                onChange={(e) => handleFilterChange("species", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.size}
                onChange={(e) => handleFilterChange("size", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Button onClick={performSearch} disabled={isLoading}>
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : searchResults.length > 0 ? (
            searchResults.map((animal) => (
              <Card
                key={animal.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={animal.photos[0] || "/api/placeholder/400/300"}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {animal.name}
                    </h3>
                    <Badge variant="outline">{animal.species}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {animal.breed} • {animal.age} anos
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {animal.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {animal.location}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAdoptAnimal(animal.id)}
                      disabled={animal.status !== "available"}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {animal.status === "available"
                        ? "Adotar"
                        : "Indisponível"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum animal encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar os filtros de busca ou volte mais tarde
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
