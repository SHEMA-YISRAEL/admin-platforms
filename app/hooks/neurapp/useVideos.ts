import { useState, useEffect } from "react";

export interface VideoData {
    id: number;
    title: string;
    url: string;
    description: string | null;
    duration: number | null;
    locale: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useVideos(type: 'lesson' | 'sublesson' | null, id: number | null) {
    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !id) {
            setLoading(false);
            setVideos([]);
            return;
        }

        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === 'lesson'
                    ? `${API_BASE_URL}/lessons/${id}/videos`
                    : `${API_BASE_URL}/sublessons/${id}/videos`;

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: VideoData[] = await response.json();
                setVideos(data);
            } catch (err) {
                console.error('Error fetching videos from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [type, id]);

    return { videos, loading, error, setVideos };
}

export default useVideos;
