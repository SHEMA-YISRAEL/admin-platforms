import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmailAndPassword, logout as firebaseLogout } from '@/lib/firebase/auth';
import { useAuthContext } from '@/contexts/AuthContext';

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { userData } = useAuthContext();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await loginWithEmailAndPassword(email, password);

      // Esperar un poco para que el contexto se actualice
      setTimeout(() => {
        router.push('/topoquizz');
      }, 500);
    } catch (err) {
      console.error('Error en login:', err);

      // Manejo de errores específicos de Firebase
      let errorMessage = 'Error al iniciar sesión';

      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential')) {
          errorMessage = 'Credenciales inválidas';
        } else if (err.message.includes('auth/user-not-found')) {
          errorMessage = 'Usuario no encontrado';
        } else if (err.message.includes('auth/wrong-password')) {
          errorMessage = 'Contraseña incorrecta';
        } else if (err.message.includes('auth/too-many-requests')) {
          errorMessage = 'Demasiados intentos. Intenta más tarde';
        } else if (err.message.includes('auth/network-request-failed')) {
          errorMessage = 'Error de conexión. Verifica tu internet';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await firebaseLogout();
      router.push('/login');
    } catch (err) {
      console.error('Error en logout:', err);
      setError('Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    loading,
    error,
  };
};
