import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

export interface QuestionTranslation {
  id: string;
  questionId: string;
  locale: string;
  questionText: string;
  options: string[];
  explanation: string | null;
}

export interface QuestionData {
  id: string;
  lessonId: string;
  answer: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  enable: boolean;
  translations: QuestionTranslation[];
  createdAt: string;
  updatedAt: string;
  _count?: { reports: number };
}

function useQuestions(lessonId: string | null) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await neuremyFetch(`/lessons/${lessonId}/questions`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data: QuestionData[] = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [lessonId]);

  return { questions, loading, error, setQuestions };
}

export default useQuestions;
