import { useState, useEffect, useCallback } from "react";

export interface MateriaData {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    visibility: boolean;
    professorId: number | null;
    createdAt: string;
    updatedAt: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove duplicate hyphens
}

// Dispatch event to trigger refetch in all useMaterias instances
export function notifyMateriasUpdated() {
    window.dispatchEvent(new Event('materias-updated'));
}

function useMaterias() {
    const [materias, setMaterias] = useState<MateriaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMaterias = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/courses`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: MateriaData[] = await response.json();

            // Add slugs to all courses
            const courses = data.map(materia => ({
                ...materia,
                slug: generateSlug(materia.title)
            }));

            setMaterias(courses);
        } catch (err) {
            console.error('Error fetching materias from backend:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterias();
    }, [fetchMaterias]);

    // Listen for materias-updated event to auto-refetch
    useEffect(() => {
        const handler = () => { fetchMaterias(); };
        window.addEventListener('materias-updated', handler);
        return () => window.removeEventListener('materias-updated', handler);
    }, [fetchMaterias]);

    return { materias, setMaterias, loading, error, refetch: fetchMaterias };
}

export default useMaterias;
