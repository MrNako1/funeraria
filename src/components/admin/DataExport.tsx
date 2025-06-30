'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'

interface UserWithRole extends User {
  role: string
}

interface DataExportProps {
  users: UserWithRole[]
  filteredUsers: UserWithRole[]
  onExport: (data: UserWithRole[], format: string) => void
  isLoading?: boolean
}

interface ExportField {
  key: string
  label: string
  description: string
  included: boolean
}

export default function DataExport({ 
  users, 
  filteredUsers, 
  onExport, 
  isLoading = false 
}: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('filtered')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Campos de exportación con metadatos
  const [exportFields, setExportFields] = useState<ExportField[]>([
    { key: 'id', label: 'ID', description: 'Identificador único del usuario', included: true },
    { key: 'email', label: 'Email', description: 'Dirección de correo electrónico', included: true },
    { key: 'name', label: 'Nombre', description: 'Nombre completo del usuario', included: true },
    { key: 'role', label: 'Rol', description: 'Rol asignado al usuario', included: true },
    { key: 'status', label: 'Estado', description: 'Estado de verificación del email', included: true },
    { key: 'createdAt', label: 'Fecha de creación', description: 'Fecha de registro del usuario', included: true }
  ])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = undefined
      }
    }
  }, [])

  // Calcular datos de exportación
  const exportData = useMemo(() => {
    const dataToExport = exportScope === 'all' ? users : filteredUsers
    const includedFields = exportFields.filter(field => field.included)
    
    return dataToExport.map(user => {
      const exportUser: any = {}
      
      includedFields.forEach(field => {
        switch (field.key) {
          case 'id':
            exportUser.id = user.id
            break
          case 'email':
            exportUser.email = user.email
            break
          case 'name':
            exportUser.name = user.user_metadata?.full_name || 'Sin nombre'
            break
          case 'role':
            exportUser.role = user.role
            break
          case 'status':
            exportUser.status = user.email_confirmed_at ? 'Verificado' : 'Pendiente'
            break
          case 'createdAt':
            exportUser.created_at = user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : 'N/A'
            break
        }
      })
      
      return exportUser
    })
  }, [exportScope, users, filteredUsers, exportFields])

  // Estadísticas de exportación
  const exportStats = useMemo(() => {
    const totalRecords = exportData.length
    const includedFields = exportFields.filter(field => field.included).length
    const estimatedSize = totalRecords * includedFields * 50 // Estimación aproximada en bytes
    
    return {
      totalRecords,
      includedFields,
      estimatedSize: estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} KB` : `${estimatedSize} bytes`
    }
  }, [exportData, exportFields])

  // Preview de datos
  const previewData = useMemo(() => {
    return exportData.slice(0, 3) // Solo los primeros 3 registros para preview
  }, [exportData])

  const handleExport = useCallback(async () => {
    if (exportData.length === 0) {
      setError('No hay datos para exportar')
      return
    }

    try {
      setIsExporting(true)
      setError(null)
      setExportProgress(0)

      // Simular progreso de exportación
      progressIntervalRef.current = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressIntervalRef.current)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Animación de feedback
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)

      // Generar y descargar archivo
      if (exportFormat === 'csv') {
        await downloadCSV()
      } else if (exportFormat === 'json') {
        await downloadJSON()
      }

      setExportProgress(100)
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        setIsOpen(false)
      }, 500)

    } catch (error) {
      console.error('Error en exportación:', error)
      setError('Error al exportar los datos')
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [exportData, exportFormat])

  const downloadCSV = useCallback(async () => {
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [exportData])

  const downloadJSON = useCallback(async () => {
    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [exportData])

  const toggleField = useCallback((fieldKey: string) => {
    setExportFields(prev => prev.map(field => 
      field.key === fieldKey 
        ? { ...field, included: !field.included }
        : field
    ))
  }, [])

  const toggleAllFields = useCallback((include: boolean) => {
    setExportFields(prev => prev.map(field => ({ ...field, included: include })))
  }, [])

  const getFormatIcon = useCallback((format: string) => {
    switch (format) {
      case 'csv':
        return '📊'
      case 'json':
        return '📄'
      default:
        return '📁'
    }
  }, [])

  const getScopeIcon = useCallback((scope: string) => {
    switch (scope) {
      case 'filtered':
        return '🔍'
      case 'all':
        return '📋'
      default:
        return '📁'
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 active:scale-95 ${
          isAnimating ? 'ring-2 ring-green-300 shadow-lg' : ''
        }`}
      >
        <span className={isExporting ? 'animate-spin' : ''}>
          {isExporting ? '⏳' : '📊'}
        </span>
        <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exportar Datos</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {isExporting && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso de exportación</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Scope */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exportar
              </label>
              <div className="space-y-2">
                {[
                  { value: 'filtered', label: 'Usuarios filtrados', count: filteredUsers.length, icon: '🔍' },
                  { value: 'all', label: 'Todos los usuarios', count: users.length, icon: '📋' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      checked={exportScope === option.value}
                      onChange={(e) => setExportScope(e.target.value as 'all' | 'filtered')}
                      className="mr-3"
                    />
                    <span className="mr-2">{option.icon}</span>
                    <span className="text-sm flex-1">{option.label}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              >
                <option value="csv">📊 CSV</option>
                <option value="json">📄 JSON</option>
              </select>
            </div>

            {/* Fields */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Campos a incluir
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAllFields(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => toggleAllFields(false)}
                    className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Ninguno
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {exportFields.map((field) => (
                  <label key={field.key} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.included}
                      onChange={() => toggleField(field.key)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{field.label}</span>
                      <p className="text-xs text-gray-500">{field.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
              >
                <span>{showPreview ? '👁️' : '👁️‍🗨️'}</span>
                <span>{showPreview ? 'Ocultar preview' : 'Mostrar preview'}</span>
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview de datos:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {previewData.map((row, index) => (
                    <div key={index} className="font-mono">
                      {JSON.stringify(row, null, 2)}
                    </div>
                  ))}
                  {exportData.length > 3 && (
                    <div className="text-gray-500 italic">
                      ... y {exportData.length - 3} registros más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="font-bold text-blue-600">{exportStats.totalRecords}</div>
                  <div className="text-blue-700">Registros</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">{exportStats.includedFields}</div>
                  <div className="text-green-700">Campos</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">{exportStats.estimatedSize}</div>
                  <div className="text-purple-700">Tamaño est.</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                disabled={isExporting || exportData.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95 disabled:transform-none"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <span>{getFormatIcon(exportFormat)}</span>
                    <span>Descargar</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isExporting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 