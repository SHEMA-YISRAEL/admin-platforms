import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmailAndPassword, logout as firebaseLogout, getUserData } from '@/lib/firebase/auth';
import { setUserSession, clearUserSession } from '@/app/actions/auth';
import type { UserRole } from '@/lib/auth';

interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Map Firebase roles to system roles
function mapFirebaseRoleToUserRole(firebaseRole: string): UserRole | null {
  switch (firebaseRole) {
    case 'translator':
      return 'translator';
    // Add more roles in the future:
    case 'admin':
      return 'admin';
    // case 'editor':
    //   return 'editor';
    // case 'viewer':
    //   return 'viewer';
    default:
      return null; // Unrecognized role
  }
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Sign in with Firebase Auth
      const user = await loginWithEmailAndPassword(email, password);

      // Fetch user data and permissions
      const userData = await getUserData(user.uid);

      // Ensure user data exists before proceeding
      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      // Map Firebase role to system role
      const userRole = mapFirebaseRoleToUserRole(userData.rol || '');

      // Ensure the role is valid and authorized
      if (!userRole) {
        throw new Error('Usuario sin rol válido o no autorizado');
      }

      // Set custom claim in Firebase and persist session cookies
      await setUserSession(userRole, userData.userName || user.email || undefined, user.uid);

      // Force token refresh so the new custom claim is included
      await user.getIdToken(true);

      // Determine redirect path based on role
      let redirectPath = '/'; // Root will automatically redirect based on role

      if(userData.rol === "translator"){
        redirectPath = '/topoquizz/translate';
      }

      if(userData.rol === "admin"){
        redirectPath = '/topoquizz/content';
      }

      // Redirect to the appropriate route
      router.push(redirectPath);

    } catch (err) {
      console.error('Login error:', err);

      // Handle specific Firebase error codes
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
        } else {
          errorMessage = err.message;
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

      // Sign out from Firebase
      await firebaseLogout();

      // Clear session cookies
      await clearUserSession();

      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
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
