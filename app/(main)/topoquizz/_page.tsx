'use client';

// import getLessonsByCourse from "@/app/hooks/topoquizz/getLessonsByCourse";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { use, useEffect, useState } from "react";

import { Button, Spinner } from "@heroui/react";
import QuestionsTable from "@/components/topoquizz/questionsTable";

interface LessonComponentProps {
    // params: Promise<{ slug: string }>
}

export default function(){

    // const { slug } = use(params);
    const [selectedLessonId, setSelectedLessonId] = useState<string>("");

    const [selectedIndexLesson, setSelectedIndexLesson] = useState<number>(0);
    const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState<boolean>(false);

    // const {
    //   data,
    //   loading,
    //   error
    // } = getLessonsByCourse(slug);

    // useEffect(() => {
    //   if (data && data.length > 0 && !selectedLessonId) {
    //     setSelectedLessonId(data[0].id);
    //     setSelectedIndexLesson(0);
    //   }
    // }, [data, selectedLessonId]);

    const {
      questionsData: questions, 
      loading: questionsLoading, 
      error: questionsError 
    } = getQuestionsByLesson(selectedLessonId);

    // if(loading) return <div>Cargando...</div>
    // if(error) return <div>Error: {error}</div>

    const redirectByLesson = ( idLesson:string ) => { setSelectedLessonId(idLesson);}

    return (
        <>
          <div
            // className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 gap-5 p-5"
            className="grid grid-cols-5 gap-5 h-screen"
            >
              <div className="col-span-1 flex flex-col gap-5 m-5">
                {
                  // data.map((element, index) => {
                  //   return (
                  //     <div className={`grid justify-end content-end ${selectedIndexLesson===index? "bg-amber-300":""} rounded-2xl h-10 hover:shadow-xl cursor-pointer`}
                  //       key={index}
                  //       onClick={
                  //         () => {
                  //           setSelectedIndexLesson(index)
                  //           redirectByLesson(element.id)
                  //         }
                  //       }
                  //     >
                  //       <div className="font-bold pr-3 pb-3 hover:shadow-amber-300">
                  //         {element.name}
                  //       </div>
                  //     </div>
                  //   )
                  // })
                }
              </div>

              <div className="col-span-4 overflow-y-auto">
                <div className=" text-center">
                  <h1 className='font-bold text-5xl ml-6'>Preguntas</h1>
                </div>
                <div className="">
                  <Button
                    onPress={() => setIsNewQuestionModalOpen(true)}
                    isDisabled={!selectedLessonId}
                  >
                    Nueva Pregunta
                  </Button>
                </div>
                <div className="mx-30 my-10">
                  {selectedLessonId && questionsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Spinner size="lg" color="warning" />
                    </div>
                  ) : (
                    <QuestionsTable
                      questionsData={selectedLessonId ? questions : []}
                      isNewQuestionModalOpen={isNewQuestionModalOpen}
                      onCloseNewQuestion={() => setIsNewQuestionModalOpen(false)}
                      lessonId={selectedLessonId}
                    />
                  )}
                </div>
              </div>
          </div>
        </>
    );
}

// export default LessonComponent; 