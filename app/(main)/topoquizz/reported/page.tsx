'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ReportedQuestionsTable from '@/components/topoquizz/reportedQuestionsTable';
import useReportedQuestions, { ReportFilter } from '@/lib/firebase/getReportedQuestions';

const ReportedQuestionsPage: React.FC = () => {
  const [filter, setFilter] = useState<ReportFilter>('pending');
  const { reportedQuestions, loading } = useReportedQuestions(filter);

  return (
    <ProtectedRoute>
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
              Preguntas Reportadas
            </h1>

            <div className="flex items-center justify-center">
              <Tabs
                selectedKey={filter}
                onSelectionChange={(key) => setFilter(key as ReportFilter)}
                aria-label="Filtro de reportes"
                color="danger"
                variant="bordered"
              >
                <Tab key="pending" title="Pendientes" />
                <Tab key="solved" title="Resueltos" />
                <Tab key="all" title="Todos" />
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4 pb-3">
          <ReportedQuestionsTable
            reportedQuestions={reportedQuestions}
            isLoading={loading}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ReportedQuestionsPage;
