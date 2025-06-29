'use client';

import { HeartIcon, ChatBubbleLeftRightIcon, PhotoIcon } from '@heroicons/react/24/outline';
import RoleRedirect from '@/components/RoleRedirect';

export default function Home() {
  return (
    <RoleRedirect>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Timeless Memories
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Un espacio digital para honrar y recordar a nuestros seres queridos,
                compartiendo momentos especiales y mensajes de consuelo.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#crear-memorial"
                  className="rounded-md bg-rose-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                >
                  Crear Memorial
                </a>
                <a href="#como-funciona" className="text-sm font-semibold leading-6 text-gray-900">
                  Conoce más <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-rose-600">Honrando Memorias</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Un espacio para recordar y compartir
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Crea un memorial digital único para honrar la vida y el legado de tu ser querido.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <HeartIcon className="h-8 w-8 text-rose-600" aria-hidden="true" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-gray-900">Memorias Compartidas</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-center">
                      Comparte fotos, historias y momentos especiales que celebran la vida de tu ser querido.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-rose-600" aria-hidden="true" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-gray-900">Mensajes de Consuelo</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-center">
                      Permite que amigos y familiares dejen mensajes de apoyo y recuerdos compartidos.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <PhotoIcon className="h-8 w-8 text-rose-600" aria-hidden="true" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-gray-900">Diseño Elegante</dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-center">
                      Presenta el memorial con un diseño respetuoso y elegante que honra su memoria.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-rose-50">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="relative isolate overflow-hidden bg-rose-600 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Crea un memorial que perdure
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-rose-100">
                Honra la memoria de tu ser querido con un espacio digital que capture su esencia y legado.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#crear-memorial"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Comenzar Ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleRedirect>
  );
}
