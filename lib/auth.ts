import { cookies } from 'next/headers';

export type UserRole = 'translator' | 'admin';
// Roles futuros: 'admin' | 'editor' | 'viewer' | etc.

interface AuthCookies {
  userRole: UserRole;
  isAuthenticated: boolean;
  userName?: string;
}

// Configuración de cookies (30 días de expiración)
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos

export async function setAuthCookies(data: AuthCookies) {
  const cookieStore = await cookies();

  cookieStore.set('userRole', data.userRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  cookieStore.set('isAuthenticated', String(data.isAuthenticated), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  if (data.userName) {
    cookieStore.set('userName', data.userName, {
      httpOnly: false, // Permitir acceso desde el cliente para mostrar el nombre
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }
}

export async function getAuthCookies(): Promise<AuthCookies | null> {
  const cookieStore = await cookies();

  const userRole = cookieStore.get('userRole')?.value as UserRole | undefined;
  const isAuthenticated = cookieStore.get('isAuthenticated')?.value === 'true';
  const userName = cookieStore.get('userName')?.value;

  if (!userRole || !isAuthenticated) {
    return null;
  }

  return {
    userRole,
    isAuthenticated,
    userName,
  };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('userRole');
  cookieStore.delete('isAuthenticated');
  cookieStore.delete('userName');
}

// Verificar si el usuario tiene acceso a una ruta específica
export async function hasAccessToRoute(route: string): Promise<boolean> {
  const auth = await getAuthCookies();

  if (!auth) {
    return false;
  }

  const rolePermissions: Record<UserRole, string[]> = {
    'translator': ['/topoquizz/translate'],
    // Agregar más roles aquí en el futuro:
    'admin': ['/topoquizz/content', '/topoquizz/dashboard', '/topoquizz/translate', '/neurapp'],
    // 'editor': ['/topoquizz/content', '/topoquizz/translate'],
    // 'viewer': ['/topoquizz/content']
  };

  const allowedPaths = rolePermissions[auth.userRole] || [];
  return allowedPaths.some(path => route.startsWith(path));
}
