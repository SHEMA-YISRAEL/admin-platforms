'use server'

import { setAuthCookies, clearAuthCookies, UserRole } from '@/lib/auth';
import { adminAuth } from '@/lib/firebase-admin';

export async function setUserSession(userRole: UserRole, userName?: string, uid?: string) {
  if (uid) {
    await adminAuth.setCustomUserClaims(uid, { role: userRole });
  }

  await setAuthCookies({
    userRole,
    isAuthenticated: true,
    userName,
  });
}

export async function clearUserSession() {
  await clearAuthCookies();
}
