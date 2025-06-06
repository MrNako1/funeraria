'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navigation = [
  { name: 'Inicio', href: '/', current: true },
  { name: 'Crear Memorial', href: '/crear', current: false },
  { name: 'Memoriales', href: '/memoriales', current: false },
  { name: 'Contacto', href: '/contacto', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

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
                    <Link
                      href="/"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        isActive('/')
                          ? 'border-b-2 border-blue-500'
                          : ''
                      }`}
                    >
                      Inicio
                    </Link>
                    {user && (
                      <>
                        <Link
                          href="/plantillas"
                          className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                            isActive('/plantillas')
                              ? 'border-b-2 border-blue-500'
                              : ''
                          }`}
                        >
                          Plantillas
                        </Link>
                        <Link
                          href="/crear-plantilla"
                          className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                            isActive('/crear-plantilla')
                              ? 'border-b-2 border-blue-500'
                              : ''
                          }`}
                        >
                          Crear Plantilla
                        </Link>
                      </>
                    )}
                    <Link
                      href="/buscar"
                      className={`text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ${
                        isActive('/buscar')
                          ? 'border-b-2 border-blue-500'
                          : ''
                      }`}
                    >
                      Buscar Memoriales
                    </Link>
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
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleSignOut}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full px-4 py-2 text-left text-sm text-gray-700'
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
              <Link
                href="/"
                className={`text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium ${
                  isActive('/')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : ''
                }`}
              >
                Inicio
              </Link>
              {user && (
                <>
                  <Link
                    href="/plantillas"
                    className={`text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium ${
                      isActive('/plantillas')
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : ''
                    }`}
                  >
                    Plantillas
                  </Link>
                  <Link
                    href="/crear-plantilla"
                    className={`text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium ${
                      isActive('/crear-plantilla')
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : ''
                    }`}
                  >
                    Crear Plantilla
                  </Link>
                </>
              )}
              <Link
                href="/buscar"
                className={`text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium ${
                  isActive('/buscar')
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : ''
                }`}
              >
                Buscar Memoriales
              </Link>
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
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 