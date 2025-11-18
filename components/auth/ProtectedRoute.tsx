'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: keyof import('@/interfaces/topoquizz').UserPermissions
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Mientras carga, mostrar un loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (el useEffect redirigirá)
  if (!user) {
    return null
  }

  // Si se requiere un permiso específico, verificarlo
  if (requiredPermission && userData) {
    const hasPermission = userData.permissions[requiredPermission] === true

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
            <p className="text-gray-700">No tienes permisos para acceder a esta sección.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
