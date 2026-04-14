import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

export type ReportFilter = 'pending' | 'solved' | 'all';

export type ClinicalCaseReportReason = 'WRONG_ANSWER' | 'SPELLING_ERROR' | 'OUTDATED_TERM' | 'OTHER';

export interface ClinicalCaseReportData {
  id: string;
  caseId: string;
  userId: string;
  reason: ClinicalCaseReportReason;
  comment: string | null;
  solved: boolean;
  createdAt: string;
  updatedAt: string;
  case: {
    id: string;
    lessonId: string;
    translations: { questionText: string; caseText: string }[];
    lesson: {
      title: string;
      course: { title: string };
    } | null;
  } | null;
}

function useClinicalCaseReports(filter: ReportFilter) {
  const [reports, setReports] = useState<ClinicalCaseReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = '/clinical-case-reports';
        if (filter === 'pending') query += '?solved=false';
        else if (filter === 'solved') query += '?solved=true';

        const response = await neuremyFetch(query);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data: ClinicalCaseReportData[] = await response.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching clinical case reports:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filter]);

  return { reports, loading, error, setReports };
}

export default useClinicalCaseReports;
