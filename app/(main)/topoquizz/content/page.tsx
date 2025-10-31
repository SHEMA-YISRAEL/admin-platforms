'use client'

import { useState } from "react";
import QuestionsComponent from "@/components/topoquizz/questions/questionsComponent";

import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";
import { emptySubject, emptyLesson } from "@/utils/topoquizz";
import SubjectsList from "@/components/topoquizz/questions/subjectListComp";
import LessonsList from "@/components/topoquizz/questions/lessonListComponent";

import { Button } from "@heroui/react";
import NewQuestionModal from "@/components/topoquizz/modals/newQuestion";
interface ContentPageProps {

}

const ContentPage: React.FC<ContentPageProps> = () => {

  const [courseSelected, setCourseSelected] = useState<ICoursesData>(emptySubject);
  const [lessonSelected, setLessonSelected] = useState<ILessonData>(emptyLesson);

  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState<boolean>(false);

  return (
    <div className="h-screen w-full px-4 py-3">
      {/* Header compacto */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">Gestión de Preguntas</h1>

        {/* Selectores y acciones en una sola fila */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Selectores de Materia y Lección */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
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

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              color='success'
              size="sm"
              onPress={()=>{setIsNewQuestionModalOpen(true)}}
              className="font-semibold"
            >
              + Crear Pregunta
            </Button>
            <Button color="primary" size="sm" isDisabled>
              Subir en Lote
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de preguntas */}
      <div>
        <QuestionsComponent
          lessonSelected={lessonSelected}
        />
      </div>

      <NewQuestionModal
        isModalOpenState={isNewQuestionModalOpen}
        handleCloseModalMethod={()=>setIsNewQuestionModalOpen(false)}
        lessonId={lessonSelected.id}
      />
    </div>
  );
}

export default ContentPage;