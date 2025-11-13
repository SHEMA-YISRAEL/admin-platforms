'use client'

import { useState } from "react";
import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";
import { emptySubject, emptyLesson } from "@/utils/topoquizz";
import SubjectsList from "@/components/topoquizz/questions/subjectListComp";
import LessonsList from "@/components/topoquizz/questions/lessonListComponent";
import TranslationsListComponent from "@/components/topoquizz/translations/translationsListComponent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface TranslationsComponentPageProps {

}

const TranslationsComponentPage: React.FC<TranslationsComponentPageProps> = () => {
  const [courseSelected, setCourseSelected] = useState<ICoursesData>(emptySubject);
  const [lessonSelected, setLessonSelected] = useState<ILessonData>(emptyLesson);

  return (
    <ProtectedRoute>
      <div className="h-screen w-full flex flex-col overflow-hidden">
        {/* Header compacto */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">Traducción de Preguntas</h1>

            {/* Selectores de Materia y Lecci\u00f3n */}
            <div className="flex flex-wrap items-center gap-3">
              <SubjectsList
                selectedSubject={courseSelected}
                methodSetSelectedSubject={setCourseSelected}
              />
              <LessonsList
                courseSelected={courseSelected}
                selectedLesson={lessonSelected}
                methodSetLessonSelected={setLessonSelected}
              />
            </div>
          </div>
        </div>

        {/* Lista de preguntas para traducci\u00f3n */}
        <div className="flex-1 overflow-hidden px-4 pb-3">
          <TranslationsListComponent
            lessonSelected={lessonSelected}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default TranslationsComponentPage;
