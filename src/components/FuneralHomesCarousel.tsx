'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FuneralHomeImage from './FuneralHomeImage';

interface FuneralHome {
  id: number;
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  website?: string;
}

const funeralHomes: FuneralHome[] = [
  {
    id: 1,
    name: "Funeraria San José",
    description: "Servicios funerarios con más de 30 años de experiencia, brindando apoyo y respeto en momentos difíciles.",
    image: "/images/funeraria-san-jose.jpg",
    address: "Av. Principal 123, Ciudad",
    phone: "+1 234-567-8900",
    website: "https://funerariasanjose.com"
  },
  {
    id: 2,
    name: "Funeraria La Paz",
    description: "Cuidado compasivo y servicios personalizados para honrar la memoria de sus seres queridos.",
    image: "/images/funeraria-la-paz.jpg",
    address: "Calle Central 456, Ciudad",
    phone: "+1 234-567-8901",
    website: "https://funerarialapaz.com"
  },
  {
    id: 3,
    name: "Funeraria Santa María",
    description: "Servicios funerarios integrales con atención las 24 horas y apoyo emocional para las familias.",
    image: "/images/funeraria-santa-maria.jpg",
    address: "Plaza Mayor 789, Ciudad",
    phone: "+1 234-567-8902",
    website: "https://funerariasantamaria.com"
  },
  {
    id: 4,
    name: "Funeraria El Descanso",
    description: "Dedicados a proporcionar servicios funerarios dignos y respetuosos en momentos de duelo.",
    image: "/images/funeraria-el-descanso.jpg",
    address: "Boulevard Norte 321, Ciudad",
    phone: "+1 234-567-8903",
    website: "https://funerariaeldescanso.com"
  },
  {
    id: 5,
    name: "Funeraria Los Ángeles",
    description: "Servicios funerarios tradicionales y cremación con instalaciones modernas y personal capacitado.",
    image: "/images/funeraria-los-angeles.jpg",
    address: "Avenida Sur 654, Ciudad",
    phone: "+1 234-567-8904",
    website: "https://funerarialosangeles.com"
  }
];

export default function FuneralHomesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === funeralHomes.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === funeralHomes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? funeralHomes.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentFuneralHome = funeralHomes[currentIndex];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Nuestras Funerarias Asociadas
        </h2>
        
        <div className="relative">
          {/* Carrusel principal */}
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            {/* Imagen de fondo con overlay */}
            <div className="absolute inset-0">
              <FuneralHomeImage name={currentFuneralHome.name} className="w-full h-full" />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            
            {/* Contenido sobre la imagen */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">{currentFuneralHome.name}</h3>
              <p className="text-lg mb-4 max-w-2xl">{currentFuneralHome.description}</p>
              <div className="space-y-2">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {currentFuneralHome.address}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {currentFuneralHome.phone}
                </p>
                {currentFuneralHome.website && (
                  <a 
                    href={currentFuneralHome.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-200 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    Visitar sitio web
                  </a>
                )}
              </div>
            </div>

            {/* Botones de navegación */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center mt-4 space-x-2">
            {funeralHomes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Controles de reproducción */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAutoPlaying
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAutoPlaying ? 'Pausar' : 'Reproducir'}
            </button>
          </div>
        </div>

        {/* Lista de todas las funerarias */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Todas Nuestras Funerarias Asociadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funeralHomes.map((funeralHome) => (
              <div 
                key={funeralHome.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => goToSlide(funeralHome.id - 1)}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{funeralHome.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{funeralHome.address}</p>
                <p className="text-sm text-gray-500">{funeralHome.phone}</p>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
} 