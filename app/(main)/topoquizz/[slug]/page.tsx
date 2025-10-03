'use client';

import getLessonsByCourse from "@/app/hooks/topoquizz/getLessonsByCourse";
import getQuestionsByLesson from "@/app/hooks/topoquizz/getQuestionsByLesson";
import { use, useState } from "react";

import { Button } from "@heroui/react";
import QuestionsTable from "@/components/topoquizz/questionsTable";

interface LessonComponentProps {
    params: Promise<{ slug: string }>
}

const LessonComponent: React.FC<LessonComponentProps> = ({ params }) => {

    const { slug } = use(params);
    const [selectedLessonId, setSelectedLessonId] = useState<string>("");

    const [selectedIndexLesson, setSelectedIndexLesson] = useState<number>(0);
    const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState<boolean>(false);

    const { 
      data, 
      loading, 
      error 
    } = getLessonsByCourse(slug);

    const {
      questionsData: questions, 
      loading: questionsLoading, 
      error: questionsError 
    } = getQuestionsByLesson(selectedLessonId);

    if(loading) return <div>Cargando...</div>
    if(error) return <div>Error: {error}</div>

    const redirectByLesson = ( idLesson:string ) => { setSelectedLessonId(idLesson);}

    return (
        <>
          <div 
            // className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 gap-5 p-5"
            className="grid grid-cols-5 gap-5"
            >
              <div className="col-span-1 flex flex-col gap-5 m-5">
                {
                  data.map((element, index) => {
                    return (
                      <div className={`grid justify-end content-end ${selectedIndexLesson===index? "bg-amber-300":""} rounded-2xl h-10 hover:shadow-xl cursor-pointer`} 
                        key={index}
                        onClick={
                          () => {
                            setSelectedIndexLesson(index)
                            redirectByLesson(element.id)
                          }
                        }
                      >
                        <div className="font-bold pr-3 pb-3 hover:shadow-amber-300">
                          {element.name}
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div className="col-span-4">
                <div className=" text-center">
                  <h1 className='font-bold text-5xl ml-6'>Preguntas</h1>
                </div>
                <div className="">
                  <Button
                    onClick={() => setIsNewQuestionModalOpen(true)}
                    isDisabled={!selectedLessonId}
                  >
                    Nueva Pregunta
                  </Button>
                </div>
                {selectedLessonId && (
                  <div className="mx-30 my-10">
                      {/* {questionsLoading && <div>Cargando preguntas...</div>}
                      {questionsError && <div>Error: {questionsError}</div>}
                      {!questionsLoading && !questionsError && questions.length === 0 && (
                          <div>No hay preguntas para esta lección</div>
                      )} */}
                    <QuestionsTable
                      questionsData={questions}
                      isNewQuestionModalOpen={isNewQuestionModalOpen}
                      onCloseNewQuestion={() => setIsNewQuestionModalOpen(false)}
                      lessonId={selectedLessonId}
                    />
                  </div>
                  )}
              </div>
          </div>
        </>
    );
}

export default LessonComponent; 