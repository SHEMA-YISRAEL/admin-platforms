import { useState, useEffect } from "react";

export interface MateriaData {
    id: number;
    title: string;
    description: string | null;
    visibility: boolean;
    professorId: number | null;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useMaterias() {
    const [materias, setMaterias] = useState<MateriaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/courses`);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: MateriaData[] = await response.json();

                // Filtrar solo los cursos visibles
                const visibleCourses = data.filter(materia => materia.visibility === true);

                setMaterias(visibleCourses);
            } catch (err) {
                console.error('Error fetching materias from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterias();
    }, []);

    return { materias, loading, error };
}

export default useMaterias;
