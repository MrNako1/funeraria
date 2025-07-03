'use client';

interface FuneralHomeImageProps {
  name: string;
  className?: string;
}

export default function FuneralHomeImage({ name, className = "" }: FuneralHomeImageProps) {
  // Generar un color de fondo basado en el nombre
  const colors = [
    'bg-blue-600',
    'bg-green-600', 
    'bg-purple-600',
    'bg-red-600',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-yellow-600',
    'bg-teal-600'
  ];
  
  const colorIndex = name.length % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`w-full h-full ${bgColor} ${className} flex items-center justify-center`}>
      <div className="text-center text-white">
        <div className="text-4xl font-bold mb-2">
          {name.split(' ').map(word => word[0]).join('')}
        </div>
        <div className="text-lg font-medium">
          {name}
        </div>
      </div>
    </div>
  );
} 