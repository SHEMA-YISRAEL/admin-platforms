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
              <div className="col-span-1 flex flex-col gap-5 border m-5">
                
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
                <div className="">
                  <h1 className='font-bold text-5xl ml-6'>Preguntas</h1>
                </div>
                <div className="h-20 bg-amber-700">
                  <Button>Nueva Pregunta</Button>
                </div>
                {selectedLessonId && (
                <div className="p-5">
                    {/* <h2 className='font-bold text-3xl mb-4'>Preguntas de la Lección</h2> */}
                    {questionsLoading && <div>Cargando preguntas...</div>}
                    {questionsError && <div>Error: {questionsError}</div>}
                    {!questionsLoading && !questionsError && questions.length === 0 && (
                        <div>No hay preguntas para esta lección</div>
                    )}
                    {/* {!questionsLoading && !questionsError && questions.length > 0 && (
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <div key={question.id} className="bg-white p-4 rounded-lg shadow">
                                    <p className="font-semibold mb-2">{index + 1}. {question.question}</p>
                                    <ul className="ml-4 space-y-1">
                                        {question.options.map((option, optIndex) => (
                                            <li
                                                key={optIndex}
                                                className={optIndex === question.correctAnswer ? 'text-green-600 font-medium' : ''}
                                            >
                                                {optIndex === question.correctAnswer && '✓ '}
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )} */}
                    <QuestionsTable questionsData={questions}/>

                </div>
                  )}
              </div>
              
              
              
              
              
              
          </div>
        </>
    );
}

export default LessonComponent; 