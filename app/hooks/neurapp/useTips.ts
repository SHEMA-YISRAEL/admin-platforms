import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

export interface TipData {
    id: string;
    title: string;
    description: string;
    url: string[];
    createdAt: string;
    updatedAt: string;
}

function useTips() {
    const [tips, setTips] = useState<TipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTips = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await neuremyFetch('/tips');

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data: TipData[] = await response.json();
            setTips(data);
        } catch (err) {
            console.error('Error fetching tips:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setTips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTips();
    }, []);

    return { tips, loading, error, setTips, refetch: fetchTips };
}

export default useTips;
