'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DebugAuthPage() {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  const localStorageUser = typeof window !== 'undefined' 
    ? localStorage.getItem('user') 
    : null;
  const localStorageToken = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  const testHasRole = (role: string) => {
    try {
      const result = hasRole([role as any]);
      console.log(`Testing hasRole(['${role}']):`, result);
      return result;
    } catch (err) {
      console.error('Error testing hasRole:', err);
      return false;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug: Autenticação</h1>

      <div className="space-y-4">
        {/* AuthContext State */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">AuthContext State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-600">isLoading:</span>
              <span className="font-semibold">{String(isLoading)}</span>
              
              <span className="text-gray-600">isAuthenticated:</span>
              <span className="font-semibold">{String(isAuthenticated)}</span>
              
              <span className="text-gray-600">user exists:</span>
              <span className="font-semibold">{String(!!user)}</span>
            </div>
          </div>
        </Card>

        {/* User Object */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">User Object (from Context)</h2>
          {user ? (
            <div className="space-y-2 font-mono text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">id:</span>
                <span>{user.id}</span>
                
                <span className="text-gray-600">name:</span>
                <span>{user.name}</span>
                
                <span className="text-gray-600">email:</span>
                <span>{user.email}</span>
                
                <span className="text-gray-600">role:</span>
                <span className="font-bold text-lg text-blue-600">{user.role}</span>
                
                <span className="text-gray-600">role typeof:</span>
                <span>{typeof user.role}</span>

                <span className="text-gray-600">role === 'ADMIN':</span>
                <span className="font-semibold">{String(user.role === 'ADMIN')}</span>
              </div>

              <div className="mt-4 p-3 bg-gray-100 rounded">
                <div className="text-xs text-gray-600 mb-1">Full JSON:</div>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No user object</p>
          )}
        </Card>

        {/* LocalStorage */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">user (raw):</div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {localStorageUser || 'null'}
              </pre>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">token (raw):</div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {localStorageToken || 'null'}
              </pre>
            </div>
          </div>
        </Card>

        {/* hasRole Tests */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">hasRole() Tests</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>hasRole(['ADMIN']):</span>
              <span className="font-semibold">
                {user ? String(testHasRole('ADMIN')) : 'No user'}
              </span>

              <span>hasRole(['CIDADAO']):</span>
              <span className="font-semibold">
                {user ? String(testHasRole('CIDADAO')) : 'No user'}
              </span>

              <span>hasRole(['FUNCIONARIO']):</span>
              <span className="font-semibold">
                {user ? String(testHasRole('FUNCIONARIO')) : 'No user'}
              </span>

              <span>hasRole(['VETERINARIO']):</span>
              <span className="font-semibold">
                {user ? String(testHasRole('VETERINARIO')) : 'No user'}
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/admin/dashboard')}>
              Ir para /admin/dashboard
            </Button>
            <Button onClick={() => router.push('/unauthorized')} variant="outline">
              Ir para /unauthorized
            </Button>
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }} 
              variant="destructive"
            >
              Clear Storage & Reload
            </Button>
          </div>
        </Card>

        {/* Console Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="font-semibold mb-2">📋 Console Instructions</h2>
          <p className="text-sm mb-3">
            Abra o Console (F12) e você verá logs detalhados do hasRole()
          </p>
          <div className="text-xs font-mono bg-white p-3 rounded">
            <div>[hasRole] Called with: {'{'} roles, userRole, user {'}'}</div>
            <div>[hasRole] Result: {'{'} roleArray, userRole, includes {'}'}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
