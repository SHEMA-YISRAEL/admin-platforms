'use client'

import { useState } from "react";
import QuestionsComponent from "@/components/topoquizz/questions/questionsComponent";

import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";
import { emptySubject, emptyLesson } from "@/utils/topoquizz";
import SubjectsList from "@/components/topoquizz/questions/subjectListComp";
import LessonsList from "@/components/topoquizz/questions/lessonListComponent";
interface ContentPageProps {

}

const ContentPage: React.FC<ContentPageProps> = () => {

  const [courseSelected, setCourseSelected] = useState<ICoursesData>(emptySubject);
  const [lessonSelected, setLessonSelected] = useState<ILessonData>(emptyLesson);

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