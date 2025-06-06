'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0">
            <span className="text-xl font-semibold">Funeraria</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 