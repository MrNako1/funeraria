'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

type AuthMode = 'login' | 'register' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Iniciar Sesión'
      case 'register':
        return 'Registrarse'
      case 'reset':
        return 'Recuperar Contraseña'
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return '¿No tienes una cuenta?'
      case 'register':
        return '¿Ya tienes una cuenta?'
      case 'reset':
        return 'Ingresa tu correo para recibir un enlace de recuperación'
    }
  }

  const getActionText = () => {
    switch (mode) {
      case 'login':
        return 'Regístrate aquí'
      case 'register':
        return 'Inicia sesión aquí'
      case 'reset':
        return 'Volver al login'
    }
  }

  const getActionMode = (): AuthMode => {
    switch (mode) {
      case 'login':
        return 'register'
      case 'register':
        return 'login'
      case 'reset':
        return 'login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {getSubtitle()}{' '}
            <button
              onClick={() => setMode(getActionMode())}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {getActionText()}
            </button>
          </p>
        </div>

        {mode === 'login' && (
          <div>
            <LoginForm />
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('reset')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        )}
        {mode === 'register' && <RegisterForm />}
        {mode === 'reset' && <ResetPasswordForm />}
      </div>
    </div>
  )
} 