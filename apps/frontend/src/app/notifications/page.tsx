"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  Check,
  Archive,
  Eye,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ADOPTION" | "TASK" | "SYSTEM" | "ALERT" | "INFO";
  category: "ADOCAO" | "DENUNCIA" | "CAMPANHA" | "SISTEMA" | "VETERINARIO";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "UNREAD" | "READ" | "ARCHIVED";
  actionType?: "APPROVE" | "REJECT" | "VIEW" | "REDIRECT" | "COMPLETE";
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  animal?: {
    id: string;
    name: string;
    species: string;
  };
  task?: {
    id: string;
    title: string;
    status: string;
  };
  adoption?: {
    id: string;
    status: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, [filter, categoryFilter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter.toUpperCase());
      }
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      const response = await fetch(`/api/v1/notifications?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/v1/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "READ" }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? {
                  ...notif,
                  status: "READ" as const,
                  readAt: new Date().toISOString(),
                }
              : notif,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/v1/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            status: "READ" as const,
            readAt: new Date().toISOString(),
          })),
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const executeAction = async (notification: Notification) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/v1/notifications/${notification.id}/action`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        // Mark as read
        await markAsRead(notification.id);

        // Handle redirect
        if (data.data?.redirectUrl || notification.actionUrl) {
          router.push(data.data?.redirectUrl || notification.actionUrl!);
        }
      }
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ADOPTION":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "TASK":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "ALERT":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "SYSTEM":
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Agora há pouco";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Notificações"
        subtitle="Acompanhe suas notificações e ações pendentes"
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={
                notifications.filter((n) => n.status === "UNREAD").length === 0
              }
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todas</option>
          <option value="unread">Não lidas</option>
          <option value="read">Lidas</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todas as categorias</option>
          <option value="ADOCAO">Adoção</option>
          <option value="SISTEMA">Sistema</option>
          <option value="VETERINARIO">Veterinário</option>
          <option value="DENUNCIA">Denúncia</option>
          <option value="CAMPANHA">Campanha</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-600">
                Você não tem notificações{" "}
                {filter !== "all"
                  ? filter === "unread"
                    ? "não lidas"
                    : "lidas"
                  : ""}{" "}
                no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                notification.status === "UNREAD"
                  ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                  : ""
              }`}
              onClick={() => executeAction(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        <Badge
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        {notification.status === "UNREAD" && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>

                        {notification.actionType && (
                          <div className="flex items-center text-xs text-blue-600">
                            <span>Clique para ação</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
