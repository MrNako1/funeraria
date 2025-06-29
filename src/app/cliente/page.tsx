'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ClienteDashboard() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (userRole !== 'cliente') {
        router.push('/');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'cliente') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenido, Cliente
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Gestiona tus memoriales y seres queridos
              </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Crear Plantilla */}
              <Link href="/crear-plantilla">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Crear Plantilla
                        </h3>
                        <p className="text-sm text-gray-500">
                          Diseña una nueva plantilla de memorial
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Seres Queridos */}
              <Link href="/seres-queridos">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Seres Queridos
                        </h3>
                        <p className="text-sm text-gray-500">
                          Gestiona tus seres queridos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Buscar Memoriales */}
              <Link href="/buscar">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Buscar Memoriales
                        </h3>
                        <p className="text-sm text-gray-500">
                          Encuentra memoriales existentes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Información adicional */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">
                Información para Clientes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Crear Plantilla</h4>
                  <p className="text-sm text-blue-700">
                    Diseña plantillas personalizadas para memoriales con diferentes estilos y opciones de personalización.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Seres Queridos</h4>
                  <p className="text-sm text-blue-700">
                    Mantén un registro de tus seres queridos y gestiona sus memoriales de manera organizada.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Buscar Memoriales</h4>
                  <p className="text-sm text-blue-700">
                    Encuentra memoriales existentes usando diferentes criterios de búsqueda.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Soporte</h4>
                  <p className="text-sm text-blue-700">
                    Si necesitas ayuda, contacta con nuestro equipo de soporte técnico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 