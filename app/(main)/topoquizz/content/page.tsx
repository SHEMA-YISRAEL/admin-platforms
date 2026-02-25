'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionsComponent from '@/components/topoquizz/questions/questionsComponent';

import { ICoursesData, ILessonData } from '@/interfaces/topoquizz';
import { emptySubject, emptyLesson } from '@/utils/topoquizz';
import SubjectsList from '@/components/topoquizz/questions/subjectListComp';
import LessonsList from '@/components/topoquizz/questions/lessonListComponent';

import { Button } from '@heroui/react';
import NewQuestionModal from '@/components/topoquizz/modals/newQuestion';
import DifficultFilter from '@/components/topoquizz/questions/difficultFilter';
import SearchFilter from '@/components/topoquizz/questions/searchFilter';
import LanguageSelector from '@/components/topoquizz/questions/languageSelector';
import { IDifficult, DIFFICULTY_LEVELS } from '@/types/Topoqizz';
import { LanguageCode, DEFAULT_LANGUAGE } from '@/types/languages';
import { DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

// import { useAuthContext } from "@/contexts/AuthContext";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useQuestionsByLesson from '@/lib/firebase/getQuestionsByLesson';
import getQuestionsByCourse from '@/lib/firebase/getQuestionsByCourse';

const ContentPage: React.FC = () => {
  const router = useRouter();
  const [courseSelected, setCourseSelected] =
    useState<ICoursesData>(emptySubject);
  const [lessonSelected, setLessonSelected] =
    useState<ILessonData>(emptyLesson);

  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] =
    useState<boolean>(false);

  const [levelSelected, setLevelSelected] = useState<IDifficult>(
    DIFFICULTY_LEVELS[0],
  );
  const [searchText, setSearchText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>(DEFAULT_LANGUAGE);

  const { questionsData, loading: questionsLoading } = useQuestionsByLesson(lessonSelected.id);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadQuestions = async () => {
    if (!courseSelected.id) return;
    setIsDownloading(true);

    try {
      const allQuestions = await getQuestionsByCourse(courseSelected.id);
      if (allQuestions.length === 0) return;

      const lastUpdatedAt = allQuestions.reduce((latest, q) => {
        const d = q.updatedAt instanceof Date ? q.updatedAt : new Date(q.updatedAt ?? 0);
        return d > latest ? d : latest;
      }, new Date(0));

      const exportData = {
        downloadedAt: new Date().toISOString(),
        lastUpdatedAt: lastUpdatedAt.toISOString(),
        courseId: courseSelected.id,
        courseSlug: courseSelected.slug,
        questions: allQuestions.map((q) => ({
          id: q.id,
          lessonId: q.lessonId,
          answer: q.answer,
          difficulty: q.difficulty,
          enable: q.enable,
          createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : q.createdAt,
          updatedAt: q.updatedAt instanceof Date ? q.updatedAt.toISOString() : q.updatedAt,
          translations: q.translations,
        })),
      };

      const courseSlug = courseSelected.slug || courseSelected.id;
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions_${courseSlug}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className='h-screen w-full flex flex-col overflow-hidden'>
        {/* Header compacto */}
        <div className='flex-shrink-0 px-4 pt-3 pb-2'>
          <div className='bg-white rounded-lg shadow-md border border-gray-200 p-4'>
            <h1 className='text-2xl font-bold text-gray-800 text-center mb-3'>
              Gestión de Preguntas
            </h1>

            {/* Selectores y acciones en una sola fila */}
            <div className='flex flex-wrap items-center justify-between gap-3'>
              {/* Selectores de Materia y Lección */}
              <div className='flex flex-wrap items-center gap-3 flex-1'>
                <SubjectsList
                  selectedSubject={courseSelected}
                  methodSetSelectedSubject={setCourseSelected}
                />
                <LessonsList
                  courseSelected={courseSelected}
                  selectedLesson={lessonSelected}
                  methodSetLessonSelected={setLessonSelected}
                />

                <DifficultFilter
                  difficultLevels={DIFFICULTY_LEVELS}
                  levelSelected={levelSelected}
                  methodSetLevelSelected={setLevelSelected}
                />

                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />

                <SearchFilter
                  searchValue={searchText}
                  onSearchChange={setSearchText}
                />
              </div>

              {/* Botones de acción */}
              <div className='flex gap-2'>
                <Button
                  color='success'
                  size='sm'
                  onPress={() => {
                    setIsNewQuestionModalOpen(true);
                  }}
                  className='font-semibold'
                >
                  + Crear Pregunta
                </Button>

                <Button
                  color='primary'
                  size='sm'
                  onPress={handleDownloadQuestions}
                  isDisabled={!courseSelected.id || isDownloading}
                  isLoading={isDownloading}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  {isDownloading ? 'Descargando...' : 'Descargar materia'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-hidden px-4 pb-3'>
          <QuestionsComponent
            lessonSelected={lessonSelected}
            filterValue={levelSelected}
            searchText={searchText}
            selectedLanguage={selectedLanguage}
            questionsData={questionsData}
            isLoading={questionsLoading}
          />
        </div>

        <NewQuestionModal
          isModalOpenState={isNewQuestionModalOpen}
          handleCloseModalMethod={() => setIsNewQuestionModalOpen(false)}
          lessonId={lessonSelected.id}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ContentPage;
