"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  PawPrint,
  Users,
  Building,
  FileText,
  Heart,
  Calendar,
  Stethoscope,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Database,
  Settings,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  EntityCard,
  StatusBadge,
  ENTITY_COLORS,
} from "@/components/ui/design-system";

interface Entity {
  id: string;
  type:
    | "animal"
    | "user"
    | "procedure"
    | "adoption"
    | "municipality"
    | "document"
    | "notification"
    | "report";
  name: string;
  description: string;
  status:
    | "active"
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "urgent";
  metadata: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  priority?: "high" | "medium" | "low";
}

interface EntityCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  count: number;
  color: string;
  entities: Entity[];
  subcategories?: EntityCategory[];
}

interface EntityExplorerProps {
  userRole: "ADMIN" | "FUNCIONARIO" | "VETERINARIO" | "CIDADAO";
  onEntitySelect?: (entity: Entity) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function EntityExplorer({
  userRole,
  onEntitySelect,
  showActions = true,
  compact = false,
}: EntityExplorerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<EntityCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntityData();
  }, [userRole]);

  const loadEntityData = async () => {
    try {
      // Simulate loading entity data based on user role
      const mockCategories: EntityCategory[] = [
        {
          id: "animals",
          name: "Animais",
          icon: PawPrint,
          description: "Todos os animais cadastrados no sistema",
          count: 892,
          color: "blue",
          entities: [
            {
              id: "1",
              type: "animal",
              name: "Luna",
              description: "Labrador Mix, 2 anos, carinhosa",
              status: "active",
              metadata: {
                breed: "Labrador Mix",
                age: "2 anos",
                location: "São Paulo",
              },
              createdAt: "2024-01-10",
              updatedAt: "2024-01-15",
              tags: ["adoção", "vacinado", "castrado"],
            },
            {
              id: "2",
              type: "animal",
              name: "Rex",
              description: "Pastor Alemão, 3 anos, protetor",
              status: "pending",
              metadata: {
                breed: "Pastor Alemão",
                age: "3 anos",
                location: "Rio de Janeiro",
              },
              createdAt: "2024-01-12",
              updatedAt: "2024-01-15",
              tags: ["resgate", "tratamento"],
              priority: "high",
            },
          ],
        },
        {
          id: "users",
          name: "Usuários",
          icon: Users,
          description: "Veterinários, funcionários e cidadãos",
          count: 1247,
          color: "green",
          entities: [
            {
              id: "1",
              type: "user",
              name: "Dr. Ana Silva",
              description: "Veterinária especialista em felinos",
              status: "active",
              metadata: {
                role: "VETERINARIO",
                specialty: "Felinos",
                municipality: "São Paulo",
              },
              createdAt: "2024-01-05",
              updatedAt: "2024-01-15",
              tags: ["veterinário", "especialista"],
            },
          ],
          subcategories: [
            {
              id: "veterinarians",
              name: "Veterinários",
              icon: Stethoscope,
              description: "Profissionais veterinários",
              count: 45,
              color: "green",
              entities: [],
            },
            {
              id: "staff",
              name: "Funcionários",
              icon: Users,
              description: "Funcionários municipais",
              count: 123,
              color: "blue",
              entities: [],
            },
            {
              id: "citizens",
              name: "Cidadãos",
              icon: Heart,
              description: "Cidadãos interessados em adoção",
              count: 1079,
              color: "purple",
              entities: [],
            },
          ],
        },
        {
          id: "procedures",
          name: "Procedimentos",
          icon: FileText,
          description: "Procedimentos veterinários e administrativos",
          count: 2341,
          color: "purple",
          entities: [
            {
              id: "1",
              type: "procedure",
              name: "Castração - Luna",
              description: "Procedimento de castração realizado",
              status: "completed",
              metadata: {
                type: "Castração",
                animal: "Luna",
                veterinarian: "Dr. Carlos",
              },
              createdAt: "2024-01-08",
              updatedAt: "2024-01-10",
              tags: ["castração", "cirurgia"],
            },
          ],
        },
        {
          id: "adoptions",
          name: "Adoções",
          icon: Heart,
          description: "Processos de adoção em andamento e finalizados",
          count: 156,
          color: "pink",
          entities: [
            {
              id: "1",
              type: "adoption",
              name: "Adoção Luna - Maria Santos",
              description: "Processo de adoção em análise",
              status: "pending",
              metadata: {
                animal: "Luna",
                adopter: "Maria Santos",
                stage: "Documentação",
              },
              createdAt: "2024-01-12",
              updatedAt: "2024-01-15",
              tags: ["documentação", "análise"],
              priority: "medium",
            },
          ],
        },
        {
          id: "municipalities",
          name: "Municípios",
          icon: Building,
          description: "Municípios participantes do programa",
          count: 15,
          color: "indigo",
          entities: [
            {
              id: "1",
              type: "municipality",
              name: "São Paulo",
              description: "Município de São Paulo - SP",
              status: "active",
              metadata: { state: "SP", population: "12.3M", animals: 234 },
              createdAt: "2024-01-01",
              updatedAt: "2024-01-15",
              tags: ["ativo", "grande-porte"],
            },
          ],
        },
      ];

      // Filter categories based on user role
      let filteredCategories = mockCategories;

      if (userRole === "CIDADAO") {
        filteredCategories = mockCategories.filter((cat) =>
          ["animals", "adoptions"].includes(cat.id),
        );
      } else if (userRole === "VETERINARIO") {
        filteredCategories = mockCategories.filter((cat) =>
          ["animals", "procedures", "users"].includes(cat.id),
        );
      } else if (userRole === "FUNCIONARIO") {
        filteredCategories = mockCategories.filter((cat) =>
          ["animals", "adoptions", "procedures", "users"].includes(cat.id),
        );
      }

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error loading entity data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredEntities = () => {
    if (!selectedCategory) return [];

    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    let entities = category.entities;

    // Apply search filter
    if (searchTerm) {
      entities = entities.filter(
        (entity) =>
          entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entity.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      entities = entities.filter((entity) => entity.status === filterStatus);
    }

    return entities;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "animal":
        return PawPrint;
      case "user":
        return Users;
      case "procedure":
        return FileText;
      case "adoption":
        return Heart;
      case "municipality":
        return Building;
      case "document":
        return FileText;
      case "notification":
        return Bell;
      case "report":
        return BarChart3;
      default:
        return FileText;
    }
  };

  const handleEntityAction = (
    entity: Entity,
    action: "view" | "edit" | "delete",
  ) => {
    switch (action) {
      case "view":
        router.push(`/${userRole.toLowerCase()}/${entity.type}s/${entity.id}`);
        break;
      case "edit":
        router.push(
          `/${userRole.toLowerCase()}/${entity.type}s/${entity.id}/edit`,
        );
        break;
      case "delete":
        // Handle delete action
        console.log("Delete entity:", entity.id);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Explorador de Entidades
          </h2>
          <p className="text-gray-600">
            Navegue e gerencie todas as entidades do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <category.icon
                      className={`w-6 h-6 text-${category.color}-600`}
                    />
                  </div>
                  <Badge variant="outline">
                    {category.count.toLocaleString()}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>

                {category.subcategories && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Subcategorias:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.map((sub) => (
                        <Badge
                          key={sub.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {sub.name} ({sub.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full mt-4" variant="outline">
                  Explorar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Entity List View */}
      {selectedCategory && (
        <div className="space-y-6">
          {/* Back Button and Filters */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedCategory(null)}>
              ← Voltar às Categorias
            </Button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Entities Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {getFilteredEntities().map((entity) => {
              const EntityIcon = getEntityIcon(entity.type);
              return (
                <EntityCard
                  key={entity.id}
                  entity={entity.type}
                  title={entity.name}
                  subtitle={entity.description}
                  status={entity.status as any}
                  icon={EntityIcon}
                  metadata={Object.entries(entity.metadata)
                    .slice(0, 3)
                    .map(([key, value]) => ({
                      label: key,
                      value: String(value),
                    }))}
                  actions={
                    showActions && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEntityAction(entity, "view")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(userRole === "ADMIN" ||
                          userRole === "FUNCIONARIO") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEntityAction(entity, "edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  }
                  onClick={() => onEntitySelect?.(entity)}
                />
              );
            })}
          </div>

          {getFilteredEntities().length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
