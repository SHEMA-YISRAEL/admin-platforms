'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePermissions } from '@/app/hooks/usePermissions';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const { canViewTopoquizz, canViewNeurapp } = usePermissions();

  useEffect(() => {
    if (!loading) {
      // Si no está autenticado, redirigir a login
      if (!user) {
        router.push('/login');
        return;
      }

      // Si está autenticado, redirigir según permisos
      if (canViewTopoquizz) {
        router.push('/topoquizz/content');
      } else if (canViewNeurapp) {
        router.push('/neurapp');
      } else {
        // Si no tiene ningún permiso, redirigir a login
        router.push('/login');
      }
    }
  }, [user, loading, canViewTopoquizz, canViewNeurapp, router]);

  // Mostrar loading mientras verifica autenticación
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
