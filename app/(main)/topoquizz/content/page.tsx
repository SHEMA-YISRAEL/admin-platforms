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
    <div className="h-screen w-screen">
      <div className="text-center text-3xl font-bold mt-2">PREGUNTAS</div>
      <div className="grid grid-cols-2 ">
        <div>
          <SubjectsList
            selectedSubject={courseSelected}
            methodSetSelectedSubject={setCourseSelected}
          />
        </div>
        <div>
          <LessonsList
            courseSelected={courseSelected}
            selectedLesson={lessonSelected}
            methodSetLessonSelected={setLessonSelected}
          />
        </div>

        <NewQuestionModal
          isModalOpenState={isNewQuestionModalOpen}
          handleCloseModalMethod={()=>setIsNewQuestionModalOpen(false)}
          lessonId={lessonSelected.id}
        />
      </div>

      <div className="flex gap-2 my-5 justify-center">
        <Button color='primary' onPress={()=>{setIsNewQuestionModalOpen(true)}}>
          Crear Pregunta
        </Button>
        <Button color="primary" isDisabled>
          Subir preguntas en Volumen
        </Button>
      </div>
      <div className="col-span-4">
        <QuestionsComponent
          lessonSelected={lessonSelected}
        />
      </div>
    </div>
  );
}

export default ContentPage;