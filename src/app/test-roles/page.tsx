'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: unknown;
}

interface UserRoleData {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function TestRolesPage() {
  const { user, userRole } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState<UserRoleData | null>(null);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: unknown) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    try {
      // Test 1: Verificar autenticación
      addResult('Autenticación', 'success', `Usuario: ${user?.email}, Rol: ${userRole}`);

      // Test 2: Verificar tabla user_roles
      const { data: tableData, error: tableError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      if (tableError) {
        addResult('Tabla user_roles', 'error', `Error: ${tableError.message}`, tableError);
      } else {
        addResult('Tabla user_roles', 'success', 'Tabla accesible', tableData);
      }

      // Test 3: Verificar función RPC
      const { error: rpcError } = await supabase
        .rpc('assign_user_role', {
          user_uuid: '00000000-0000-0000-0000-000000000000',
          user_role: 'test'
        });

      if (rpcError) {
        addResult('Función RPC', 'warning', `Función disponible pero con error: ${rpcError.message}`, rpcError);
      } else {
        addResult('Función RPC', 'success', 'Función disponible y funcionando');
      }

      // Test 4: Obtener usuarios
      const { data: users, error: usersError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);

      if (usersError) {
        addResult('Obtener usuarios', 'error', `Error: ${usersError.message}`, usersError);
      } else {
        addResult('Obtener usuarios', 'success', `${users.length} usuarios encontrados`, users);
        if (users.length > 0) {
          setTestUser(users[0]);
        }
      }

      // Test 5: Verificar políticas (intentando actualizar un rol)
      if (testUser) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: testUser.user_id,
            role: testUser.role // Mantener el mismo rol
          }, {
            onConflict: 'user_id'
          });

        if (updateError) {
          addResult('Políticas de actualización', 'error', `Error: ${updateError.message}`, updateError);
        } else {
          addResult('Políticas de actualización', 'success', 'Políticas permiten actualización');
        }
      }

    } catch (error: unknown) {
      addResult('Error general', 'error', `Error inesperado: ${error}`, error);
    } finally {
      setLoading(false);
    }
  };

  const testRoleChange = async () => {
    if (!testUser) return;

    setLoading(true);
    try {
      const newRole = testUser.role === 'user' ? 'cliente' : 'user';
      
      addResult('Cambio de rol', 'success', `Intentando cambiar ${testUser.user_id} de ${testUser.role} a ${newRole}`);

      const { error } = await supabase
        .rpc('assign_user_role', {
          user_uuid: testUser.user_id,
          user_role: newRole
        });

      if (error) {
        addResult('Cambio de rol RPC', 'error', `Error RPC: ${error.message}`, error);
        
        // Intentar con upsert directo
        const { error: upsertError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: testUser.user_id,
            role: newRole
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          addResult('Cambio de rol Upsert', 'error', `Error Upsert: ${upsertError.message}`, upsertError);
        } else {
          addResult('Cambio de rol Upsert', 'success', 'Rol cambiado exitosamente con upsert');
        }
      } else {
        addResult('Cambio de rol RPC', 'success', 'Rol cambiado exitosamente con RPC');
      }

    } catch (error: unknown) {
      addResult('Error cambio de rol', 'error', `Error: ${error}`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Diagnóstico del Sistema de Roles</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <p className="text-sm text-gray-900">{user?.email || 'No autenticado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol:</label>
              <p className="text-sm text-gray-900">{userRole || 'No asignado'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="flex gap-4">
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
            </button>
            
            {testUser && (
              <button
                onClick={testRoleChange}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Probando...' : 'Probar Cambio de Rol'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados del Diagnóstico</h2>
          
          {results.length === 0 ? (
            <p className="text-gray-500">Ejecuta el diagnóstico para ver los resultados</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.status === 'success' ? 'bg-green-50 border-green-200' :
                  result.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.details !== undefined && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-500 cursor-pointer">Ver detalles</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 