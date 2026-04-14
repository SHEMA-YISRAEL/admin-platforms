import { useState, useEffect } from 'react';
import { neuremyFetch } from '@/lib/neuremy-api';

export interface ClinicalCaseTranslation {
  locale: string;
  caseText: string;
  questionText: string;
  options: string[];
  explanation: string | null;
}

export interface ClinicalCaseData {
  id: string;
  lessonId: string;
  answer: number;
  enable: boolean;
  translations: ClinicalCaseTranslation[];
  createdAt: string;
  updatedAt: string;
  _count?: { reports: number };
}

function useClinicalCases(lessonId: string) {
  const [cases, setCases] = useState<ClinicalCaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await neuremyFetch(`/lessons/${lessonId}/clinical-cases`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data: ClinicalCaseData[] = await res.json();
        setCases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [lessonId]);

  return { cases, loading, error, setCases };
}

export default useClinicalCases;
