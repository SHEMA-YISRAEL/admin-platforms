import { useState, useEffect } from "react";

export interface SublessonData {
    id: number;
    lessonId: number;
    title: string;
    description: string | null;
    order: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useSublessons(lessonId: number | null) {
    const [sublessons, setSublessons] = useState<SublessonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!lessonId) {
            setLoading(false);
            setSublessons([]);
            return;
        }

        const fetchSublessons = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/sublessons`);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: SublessonData[] = await response.json();

                // Ordenar por campo order
                data.sort((a, b) => a.order - b.order);

                setSublessons(data);
            } catch (err) {
                console.error('Error fetching sublessons from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchSublessons();
    }, [lessonId]);

    return { sublessons, loading, error, setSublessons };
}

export default useSublessons;
