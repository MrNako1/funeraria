'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navigationItems = [
  {
    name: 'Inicio',
    href: '/',
    requiresAuth: false
  },
  {
    name: 'Crear Plantilla',
    href: '/crear-plantilla',
    requiresAuth: true
  },
  {
    name: 'Seres Queridos',
    href: '/seres-queridos',
    requiresAuth: true
  },
  {
    name: 'Buscar Memoriales',
    href: '/buscar',
    requiresAuth: false
  }
];

// Navegación específica para usuarios normales
const userNavigationItems = [
  {
    name: 'Inicio',
    href: '/',
    requiresAuth: false
  },
  {
    name: 'Seres Queridos',
    href: '/seres-queridos',
    requiresAuth: true
  },
  {
    name: 'Buscar Memoriales',
    href: '/buscar',
    requiresAuth: false
  }
];

// Navegación específica para clientes
const clienteNavigationItems = [
  {
    name: 'Inicio',
    href: '/cliente',
    requiresAuth: true
  },
  {
    name: 'Crear Plantilla',
    href: '/crear-plantilla',
    requiresAuth: true
  },
  {
    name: 'Seres Queridos',
    href: '/seres-queridos',
    requiresAuth: true
  },
  {
    name: 'Buscar Memoriales',
    href: '/buscar',
    requiresAuth: false
  }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      console.log('🔄 Iniciando proceso de logout...');
      
      // Mostrar indicador de loading
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Cerrando sesión...';
      }
      
      await signOut();
      console.log('✅ Logout exitoso');
      
      // Limpiar cualquier estado local si es necesario
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Redirigir a la página de login
      router.push('/auth');
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      
      // Restaurar el botón si hay error
      const button = event?.target as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = 'Cerrar Sesión';
      }
      
      // Mostrar mensaje de error al usuario
      alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
  };

  const isActive = (path: string) => pathname === path;

  // Determinar qué navegación mostrar basado en el rol del usuario
  const getNavigationItems = () => {
    if (userRole === 'cliente') {
      return clienteNavigationItems;
    } else if (userRole === 'user') {
      return userNavigationItems;
    }
    return navigationItems;
  };

  const renderNavItems = (isMobile = false) => {
    const items = getNavigationItems();
    
    return items.map((item) => {
      if (item.requiresAuth && !user) return null;
      
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`text-gray-300 hover:bg-gray-700 hover:text-white ${
            isMobile ? 'block' : ''
          } rounded-md px-3 py-2 ${isMobile ? 'text-base' : 'text-sm'} font-medium ${
            isActive(item.href)
              ? isMobile
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-b-2 border-blue-500'
              : ''
          }`}
        >
          {item.name}
        </Link>
      );
    });
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-white font-bold text-xl">
                    Funeraria
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {renderNavItems()}
                    {/* Enlace de administración solo para admins */}
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                          isActive('/admin')
                            ? 'border-b-2 border-blue-500'
                            : ''
                        }`}
                      >
                        Administración
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {user ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="sr-only">Abrir menú de usuario</span>
                          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                            {user.email?.[0].toUpperCase()}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userRole === 'admin' && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/admin"
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  Panel de Administración
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/perfil"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Mi Perfil
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleSignOut}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700'
                                )}
                              >
                                Cerrar Sesión
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <Link
                      href="/auth"
                      className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Abrir menú principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {renderNavItems(true)}
              {/* Enlace de administración solo para admins en móvil */}
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Administración
                </Link>
              )}
            </div>
            <div className="border-t border-gray-700 pb-3 pt-4">
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.email}
                    </div>
                    {userRole === 'admin' && (
                      <div className="text-sm text-gray-400">
                        Administrador
                      </div>
                    )}
                    {userRole === 'cliente' && (
                      <div className="text-sm text-gray-400">
                        Cliente
                      </div>
                    )}
                    {userRole === 'user' && (
                      <div className="text-sm text-gray-400">
                        Usuario
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    href="/auth"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
            {/* Botón de logout en móvil */}
            {user && (
              <div className="border-t border-gray-700 px-2 py-3">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-red-700 hover:text-white rounded-md"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 