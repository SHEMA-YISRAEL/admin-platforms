import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseSignedUrlsResult {
  signedUrls: Record<string, string>;
  loading: boolean;
  error: string | null;
  getSignedUrl: (url: string) => Promise<string>;
}

/**
 * Hook para obtener URLs firmadas de S3
 * Cachea las URLs firmadas para evitar múltiples llamadas
 */
export function useSignedUrls(): UseSignedUrlsResult {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = async (url: string): Promise<string> => {
    // Si ya tenemos la URL firmada en cache, devolverla
    if (signedUrls[url]) {
      return signedUrls[url];
    }

    // Si no es una URL de S3, devolverla tal cual
    if (!url.includes('s3.amazonaws.com')) {
      return url;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/s3/signed-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: url }),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener URL firmada: ${response.statusText}`);
      }

      const data = await response.json();
      const signedUrl = data.signedUrl || url;

      // Guardar en cache
      setSignedUrls(prev => ({ ...prev, [url]: signedUrl }));

      return signedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error getting signed URL:', err);
      // En caso de error, devolver la URL original
      return url;
    } finally {
      setLoading(false);
    }
  };

  return { signedUrls, loading, error, getSignedUrl };
}
