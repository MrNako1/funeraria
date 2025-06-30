'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

interface FilterOptions {
  role: string
  status: string
  dateRange: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  // Nuevos filtros avanzados
  customDateFrom?: string
  customDateTo?: string
  emailDomain?: string
  activity?: string
  searchTerm?: string
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  totalUsers: number
  filteredCount: number
  isLoading?: boolean
}

// Hook personalizado para debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Componente para indicador de filtro activo
function FilterBadge({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2 mb-2">
      {label}: {value}
      <button
        onClick={onRemove}
        className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
      >
        ×
      </button>
    </span>
  )
}

// Componente para input con debouncing
function DebouncedInput({ 
  value, 
  onChange, 
  placeholder, 
  delay = 300,
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  delay?: number
  className?: string
}) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, delay)

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${className}`}
    />
  )
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalUsers,
  filteredCount,
  isLoading = false
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)
  const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    
    // Animación de feedback
    setIsAnimating(true)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 300)
  }, [localFilters, onFiltersChange])

  const handleSortChange = useCallback((sortBy: string) => {
    const newSortOrder: 'asc' | 'desc' = localFilters.sortBy === sortBy && localFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    const newFilters = {
      ...localFilters,
      sortBy,
      sortOrder: newSortOrder
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const handleClearFilter = useCallback((key: keyof FilterOptions) => {
    const newFilters = {
      ...localFilters,
      [key]: key === 'sortBy' ? 'created_at' : 'all'
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const hasActiveFilters = useMemo(() => {
    return localFilters.role !== 'all' || 
           localFilters.status !== 'all' || 
           localFilters.dateRange !== 'all' ||
           localFilters.sortBy !== 'created_at' ||
           localFilters.customDateFrom ||
           localFilters.customDateTo ||
           localFilters.emailDomain ||
           localFilters.activity ||
           localFilters.searchTerm
  }, [localFilters])

  const getFilterCount = useMemo(() => {
    let count = 0
    if (localFilters.role !== 'all') count++
    if (localFilters.status !== 'all') count++
    if (localFilters.dateRange !== 'all') count++
    if (localFilters.customDateFrom || localFilters.customDateTo) count++
    if (localFilters.emailDomain) count++
    if (localFilters.activity && localFilters.activity !== 'all') count++
    if (localFilters.searchTerm) count++
    return count
  }, [localFilters])

  const getActiveFilters = useMemo(() => {
    const active: Array<{ key: keyof FilterOptions; label: string; value: string }> = []
    
    if (localFilters.role !== 'all') {
      active.push({ key: 'role', label: 'Rol', value: localFilters.role === 'admin' ? 'Administradores' : 'Usuarios' })
    }
    if (localFilters.status !== 'all') {
      active.push({ key: 'status', label: 'Estado', value: localFilters.status === 'verified' ? 'Verificados' : 'Pendientes' })
    }
    if (localFilters.dateRange !== 'all') {
      const dateLabels: Record<string, string> = {
        today: 'Hoy',
        week: 'Esta semana',
        month: 'Este mes',
        year: 'Este año'
      }
      active.push({ key: 'dateRange', label: 'Fecha', value: dateLabels[localFilters.dateRange] || localFilters.dateRange })
    }
    if (localFilters.emailDomain) {
      active.push({ key: 'emailDomain', label: 'Dominio', value: localFilters.emailDomain })
    }
    if (localFilters.activity && localFilters.activity !== 'all') {
      const activityLabels: Record<string, string> = {
        active: 'Activos',
        inactive: 'Inactivos',
        new: 'Nuevos'
      }
      active.push({ key: 'activity', label: 'Actividad', value: activityLabels[localFilters.activity] || localFilters.activity })
    }
    if (localFilters.searchTerm) {
      active.push({ key: 'searchTerm', label: 'Búsqueda', value: localFilters.searchTerm })
    }
    
    return active
  }, [localFilters])

  const handleClearAllFilters = useCallback(() => {
    const defaultFilters: FilterOptions = {
      role: 'all',
      status: 'all',
      dateRange: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
    setLocalFilters(defaultFilters)
    onClearFilters()
  }, [onClearFilters])

  const getSortIcon = useCallback((field: string) => {
    if (localFilters.sortBy !== field) return '↕️'
    return localFilters.sortOrder === 'asc' ? '↑' : '↓'
  }, [localFilters.sortBy, localFilters.sortOrder])

  const getFilterPercentage = useMemo(() => {
    return totalUsers > 0 ? Math.round((filteredCount / totalUsers) * 100) : 0
  }, [filteredCount, totalUsers])

  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 transition-all duration-300 ${
      isAnimating ? 'ring-2 ring-blue-200 shadow-lg' : ''
    }`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                {getFilterCount} activo{getFilterCount !== 1 ? 's' : ''}
              </span>
            )}
            {isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              {filteredCount.toLocaleString()} de {totalUsers.toLocaleString()} usuarios
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors transform hover:scale-110"
            >
              {isExpanded ? '📉' : '📈'}
            </button>
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center">
              <span className="text-xs text-gray-500 mr-2">Filtros activos:</span>
              {getActiveFilters.map((filter) => (
                <FilterBadge
                  key={filter.key}
                  label={filter.label}
                  value={filter.value}
                  onRemove={() => handleClearFilter(filter.key)}
                />
              ))}
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filtros básicos siempre visibles */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={localFilters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            >
              <option value="all">Todos los estados</option>
              <option value="verified">Verificados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de registro
            </label>
            <select
              value={localFilters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            >
              <option value="created_at">Fecha de registro {getSortIcon('created_at')}</option>
              <option value="email">Email {getSortIcon('email')}</option>
              <option value="role">Rol {getSortIcon('role')}</option>
              <option value="name">Nombre {getSortIcon('name')}</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Orden: {localFilters.sortOrder === 'asc' ? 'Ascendente ↑' : 'Descendente ↓'}
            </span>
            {localFilters.sortBy !== 'created_at' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded animate-pulse">
                Ordenado por {localFilters.sortBy}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-100 px-2 py-1 rounded"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-50 px-2 py-1 rounded"
            >
              {isExpanded ? 'Menos opciones' : 'Más opciones'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros avanzados (expandibles) */}
      {isExpanded && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por rango de fechas personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango personalizado
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={localFilters.customDateFrom || ''}
                  onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={localFilters.customDateTo || ''}
                  onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  placeholder="Hasta"
                />
              </div>
            </div>

            {/* Filtro por dominio de email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dominio de email
              </label>
              <DebouncedInput
                value={localFilters.emailDomain || ''}
                onChange={(value) => handleFilterChange('emailDomain', value)}
                placeholder="ej: gmail.com"
                delay={500}
              />
            </div>

            {/* Filtro por actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actividad
              </label>
              <select 
                value={localFilters.activity || 'all'}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="all">Toda la actividad</option>
                <option value="active">Activos (últimos 30 días)</option>
                <option value="inactive">Inactivos (más de 30 días)</option>
                <option value="new">Nuevos (últimos 7 días)</option>
              </select>
            </div>
          </div>

          {/* Búsqueda general */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Búsqueda general
            </label>
            <DebouncedInput
              value={localFilters.searchTerm || ''}
              onChange={(value) => handleFilterChange('searchTerm', value)}
              placeholder="Buscar por nombre, email, etc..."
              delay={400}
              className="w-full"
            />
          </div>

          {/* Estadísticas de filtros */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{filteredCount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Filtrados</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{getFilterPercentage}%</div>
                <div className="text-xs text-gray-500">Porcentaje</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{getFilterCount}</div>
                <div className="text-xs text-gray-500">Filtros activos</div>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progreso de filtrado</span>
                <span>{getFilterPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getFilterPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 