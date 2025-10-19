"use client";

import { Card } from "@/components/ui/card";
import { PawPrint, UserPlus, Heart, Users } from "lucide-react";

interface LoadingSkeletonProps {
  type?: "stats" | "actions" | "quick-actions";
}

export function LoadingSkeleton({ type = "stats" }: LoadingSkeletonProps) {
  if (type === "quick-actions") {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "actions") {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border-2 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mt-1"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Default: stats loading
  const statCards = [
    { icon: PawPrint, label: "Total de Animais" },
    { icon: UserPlus, label: "Elevações Pendentes" },
    { icon: Heart, label: "Adoções Pendentes" },
    { icon: Users, label: "Usuários Ativos" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <div className="mt-1 h-8 flex items-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="text-3xl font-semibold text-gray-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Carregando...</p>
          </Card>
        );
      })}
    </div>
  );
}

// Animated number component
interface AnimatedNumberProps {
  value: number;
  isLoading?: boolean;
  className?: string;
}

export function AnimatedNumber({
  value,
  isLoading,
  className = "",
}: AnimatedNumberProps) {
  if (isLoading) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-3xl font-semibold text-gray-300 animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {i}
          </span>
        ))}
      </div>
    );
  }

  return (
    <p className={`text-3xl font-semibold text-gray-900 ${className}`}>
      {value}
    </p>
  );
}
