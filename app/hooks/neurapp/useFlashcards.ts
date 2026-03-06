import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

export interface FlashcardData {
    id: string;
    title?: string | null;
    obverse_side_url: string;
    reverse_side_url: string;
    description?: string | null;
    size?: number | null;
    locale: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

function useFlashcards(type: 'lesson' | 'sublesson' | null, parentId: string | null) {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !parentId) {
            setLoading(false);
            setFlashcards([]);
            return;
        }

        const fetchFlashcards = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === 'lesson'
                    ? `/lessons/${parentId}/flashcards`
                    : `/sublessons/${parentId}/flashcards`;

                const response = await neuremyFetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: FlashcardData[] = await response.json();
                setFlashcards(data);
            } catch (err) {
                console.error('Error fetching flashcards from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcards();
    }, [type, parentId]);

    return { flashcards, loading, error, setFlashcards };
}

export default useFlashcards;
