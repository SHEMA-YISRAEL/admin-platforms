import { useState, useEffect } from "react";

export interface SummaryData {
    id: number;
    title: string;
    urlFile: string;
    locale: string;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useSummaries(type: 'lesson' | 'sublesson' | null, id: number | null) {
    const [summaries, setSummaries] = useState<SummaryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !id) {
            setLoading(false);
            setSummaries([]);
            return;
        }

        const fetchSummaries = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === 'lesson'
                    ? `${API_BASE_URL}/lessons/${id}/summaries`
                    : `${API_BASE_URL}/sublessons/${id}/summaries`;

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: SummaryData[] = await response.json();
                setSummaries(data);
            } catch (err) {
                console.error('Error fetching summaries from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchSummaries();
    }, [type, id]);

    return { summaries, loading, error, setSummaries };
}

export default useSummaries;
