import { useState, useEffect } from "react";

export interface FlashcardData {
    id: number;
    obverse_side_url: string;
    reverse_side_url: string;
    locale: string;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useFlashcards(type: 'lesson' | 'sublesson' | null, id: number | null) {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !id) {
            setLoading(false);
            setFlashcards([]);
            return;
        }

        const fetchFlashcards = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === 'lesson'
                    ? `${API_BASE_URL}/lessons/${id}/flashcards`
                    : `${API_BASE_URL}/sublessons/${id}/flashcards`;

                const response = await fetch(endpoint);

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
    }, [type, id]);

    return { flashcards, loading, error, setFlashcards };
}

export default useFlashcards;
