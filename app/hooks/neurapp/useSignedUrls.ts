import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UseSignedUrlsResult {
  signedUrls: Record<string, string>;
  loading: boolean;
  error: string | null;
  getSignedUrl: (url: string) => Promise<string>;
}

/**
 * Hook to obtain signed URLs for S3 resources.
 */
export function useSignedUrls(): UseSignedUrlsResult {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = async (url: string): Promise<string> => {
    // If URL is already cached, return it
    if (signedUrls[url]) {
      return signedUrls[url];
    }

    // If URL does not appear to be an S3 URL, return it as is
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

      // Save signed URL in state
      setSignedUrls(prev => ({ ...prev, [url]: signedUrl }));

      return signedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error getting signed URL:', err);
      // In case of error, return the original URL
      return url;
    } finally {
      setLoading(false);
    }
  };

  return { signedUrls, loading, error, getSignedUrl };
}
