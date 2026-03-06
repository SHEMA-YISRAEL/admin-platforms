import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

export interface SummaryData {
    id: string;
    title: string;
    urlFile: string;
    description?: string | null;
    size?: number | null;
    locale: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

function useSummaries(type: 'lesson' | 'sublesson' | null, parentId: string | null) {
    const [summaries, setSummaries] = useState<SummaryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !parentId) {
            setLoading(false);
            setSummaries([]);
            return;
        }

        const fetchSummaries = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === 'lesson'
                    ? `/lessons/${parentId}/summaries`
                    : `/sublessons/${parentId}/summaries`;

                const response = await neuremyFetch(endpoint);

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
    }, [type, parentId]);

    return { summaries, loading, error, setSummaries };
}

export default useSummaries;
