import PlantillasList from './components/PlantillasList'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Homenajes y Recuerdos
          </h1>
          <p className="text-lg text-gray-600">
            Un espacio para recordar y honrar a nuestros seres queridos
          </p>
        </div>
        <PlantillasList />
      </div>
    </main>
  )
} 