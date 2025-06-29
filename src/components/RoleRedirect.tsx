'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleRedirectProps {
  children: React.ReactNode;
}

export default function RoleRedirect({ children }: RoleRedirectProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Si el usuario está autenticado, redirigir según su rol
      if (userRole === 'cliente') {
        router.push('/cliente');
      } else if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'user') {
        router.push('/user');
      }
      // Si no tiene rol específico, permanece en la página actual
    }
  }, [user, userRole, loading, router]);

  // Si está cargando, mostrar loading
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

  // Si el usuario no está autenticado o no tiene rol específico, mostrar el contenido normal
  if (!user || !userRole || (userRole !== 'user' && userRole !== 'admin' && userRole !== 'cliente')) {
    return <>{children}</>;
  }

  // Si tiene otro rol, mostrar loading mientras redirige
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
} 