'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SimpleCitizenDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['CIDADAO']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard do Cidadão - Versão Simples
          </h1>
          
          {user && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Bem-vindo!</h2>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Município:</strong> {user.municipality?.name}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Adotar Animal</h3>
              <p className="text-gray-600">Encontre seu novo melhor amigo</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Meu Perfil</h3>
              <p className="text-gray-600">Gerencie suas informações</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Histórico</h3>
              <p className="text-gray-600">Veja suas adoções anteriores</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
