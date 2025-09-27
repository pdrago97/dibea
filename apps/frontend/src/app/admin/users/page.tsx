'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VETERINARIO' | 'FUNCIONARIO' | 'CIDADAO';
  phone?: string;
  active: boolean;
  createdAt: string;
  municipality: {
    id: string;
    name: string;
  };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CIDADAO' as const
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert backend data to frontend format
        const formattedUsers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          active: user.active,
          createdAt: user.createdAt,
          municipality: user.municipality?.name || 'N/A'
        }));
        setUsers(formattedUsers);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await fetchUsers();
        setShowCreateForm(false);
        setNewUser({ name: '', email: '', password: '', phone: '', role: 'CIDADAO' });
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao criar usuário');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        setError('Erro ao alterar status do usuário');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'VETERINARIO': return 'bg-blue-100 text-blue-800';
      case 'FUNCIONARIO': return 'bg-green-100 text-green-800';
      case 'CIDADAO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'VETERINARIO': return 'Veterinário';
      case 'FUNCIONARIO': return 'Funcionário';
      case 'CIDADAO': return 'Cidadão';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Criar, editar e gerenciar contas de usuários do sistema</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Novo Usuário
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="search">Buscar usuários</Label>
            <Input
              id="search"
              placeholder="Nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Filtrar por role</Label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="VETERINARIO">Veterinários</option>
              <option value="FUNCIONARIO">Funcionários</option>
              <option value="CIDADAO">Cidadãos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
              >
                <option value="CIDADAO">Cidadão</option>
                <option value="FUNCIONARIO">Funcionário</option>
                <option value="VETERINARIO">Veterinário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={createUser} className="bg-green-600 hover:bg-green-700">
              Criar Usuário
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <Card key={user.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge variant={user.active ? "default" : "destructive"}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-gray-600">{user.email}</p>
                {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
                <p className="text-gray-500 text-sm">
                  Município: {user.municipality.name} • 
                  Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUserStatus(user.id, user.active)}
                >
                  {user.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(user)}
                >
                  Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
        </Card>
      )}
    </div>
  );
}
