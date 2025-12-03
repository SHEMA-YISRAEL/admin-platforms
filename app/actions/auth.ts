'use server'

import { setAuthCookies, clearAuthCookies, UserRole } from '@/lib/auth';

export async function setUserSession(userRole: UserRole, userName?: string) {
  await setAuthCookies({
    userRole,
    isAuthenticated: true,
    userName,
  });
}

export async function clearUserSession() {
  await clearAuthCookies();
}
