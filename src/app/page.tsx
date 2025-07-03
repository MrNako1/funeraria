'use client';

import FuneralHomesCarousel from '@/components/FuneralHomesCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            {/* Carrusel de Funerarias Asociadas */}
            <div className="mt-8">
              <FuneralHomesCarousel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
