import { auth } from '@/utils/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function waitForAuthInit() {
  return new Promise<import('firebase/auth').User | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function neuremyFetch(path: string, options?: RequestInit): Promise<Response> {
  const currentUser = auth.currentUser ?? await waitForAuthInit();

  if (!currentUser) {
    throw new Error('Please log in first');
  }

  const token = await currentUser.getIdToken();

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}
