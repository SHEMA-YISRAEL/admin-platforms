import { useState, useEffect } from "react";

export interface LessonData {
    id: number;
    courseId: number;
    title: string;
    description: string | null;
    order: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useLessons(courseId: number | null) {
    const [lessons, setLessons] = useState<LessonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) {
            setLoading(false);
            return;
        }

        const fetchLessons = async () => {
            try {
                setLoading(true);
                setError(null);

                const url = `${API_BASE_URL}/courses/${courseId}/lessons`;
                // console.log('Fetching lessons from:', url);

                const response = await fetch(url);

                if (!response.ok) {
                    if (response.status === 404) {
                        // Si no existe el endpoint o no hay datos, retornar array vacío
                        console.warn(`Endpoint not found: ${url}`);
                        setLessons([]);
                        setError('El endpoint de lecciones no está disponible. Verifica que el backend esté corriendo.');
                        return;
                    }
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: LessonData[] = await response.json();

                // Ordenar por campo order
                data.sort((a, b) => a.order - b.order);

                setLessons(data);
            } catch (err) {
                console.error('Error fetching lessons from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLessons([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [courseId]);

    return { lessons, loading, error, setLessons };
}

export default useLessons;
