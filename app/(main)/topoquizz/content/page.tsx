'use client'
// import QuestionsTable from "@/components/topoquizz/questionsTable";
import getCourses from "@/lib/firebase/getCourses";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Listbox, ListboxItem } from "@heroui/react";
import getLessonsByCourse from "@/lib/firebase/getLessonsByCourse";
import QuestionsComponent from "@/components/topoquizz/questions/questionsComponent";

interface ContentPageProps {

}

interface ISubjectListProps{
  selectedSubject :Set<string>,
  methodSetSelectedSubject: Dispatch<SetStateAction<Set<string>>>;
}

const SubjectsList: React.FC<ISubjectListProps> = ({selectedSubject, methodSetSelectedSubject})=>{

  const { 
    coursesData:coursesDataFromFirebase, 
    loading: loadingCourses, 
    error: errorGettingCoursesData 
  } = getCourses()

  // const [selectedSubject, setSelectedSubject] = useState(new Set([""]));

  useEffect(()=>{
    console.log(coursesDataFromFirebase)
    if (coursesDataFromFirebase.length > 0) {
      methodSetSelectedSubject(new Set([coursesDataFromFirebase[0].slug]));
    }
  }, [coursesDataFromFirebase])

  useEffect(()=>{
    console.log(selectedSubject, 'counter')
  }, [selectedSubject])
  
  return(
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-4xl">Materias</div>
        {
          loadingCourses? <div>Cargando...</div>:<></>
        }
        <Listbox
          // disabledKeys={["edit", "delete"]}
          disallowEmptySelection
          // aria-label="Single selection example"
          selectedKeys={selectedSubject}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => methodSetSelectedSubject(keys as Set<string>)}
          // onAction={(key) => console.log(key)}
        >
        {
          coursesDataFromFirebase.map((element)=>{
            return(
              <ListboxItem key={element.id}>{element.name}</ListboxItem>
            )   
          })
        }
        </Listbox>
      </div>
    </>
  )
}

interface ILessonsListType {
  courseSelected:string
  selectedLesson: Set<string>
  methodSetLessonSelected:Dispatch<SetStateAction<Set<string>>>;
}

const LessonsList: React.FC<ILessonsListType>= ({courseSelected, selectedLesson, methodSetLessonSelected})=>{
  const {
    data:lessonsData,
    loading:loadingLessonsData,
    error} = getLessonsByCourse(courseSelected) //courseSelected:string

  useEffect(()=>{
    if (lessonsData.length > 0) {
      methodSetLessonSelected(new Set([lessonsData[0].slug || String(0)]));
    }
  }, [lessonsData])

  return(
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-4xl">Lecciones</div>

        {loadingLessonsData?"Cargando...":<></>}
        {error? error:<></>}

        <Listbox
          selectedKeys={selectedLesson}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => methodSetLessonSelected(keys as Set<string>)}
          // onAction={(key) => console.log(key)}
        >
          {
            lessonsData.map((element, index)=>{
              return(
                <ListboxItem key={element.slug || index}>
                  {element.name}
                </ListboxItem>
              )
            })
          }
        </Listbox>
      </div>


    </>
  )
}

const ContentPage: React.FC<ContentPageProps> = () => {

  const [courseIdSelected, setCourseIdSelected] = useState(new Set([""]))
  const [lessonIdSelected, setLessonIdSelected] = useState(new Set([""]));
  
  return (
    <>
      <SubjectsList
        selectedSubject={courseIdSelected}
        methodSetSelectedSubject={setCourseIdSelected}
      />
      <LessonsList
        courseSelected={Array.from(courseIdSelected)[0] || ''} //first element
        selectedLesson={lessonIdSelected}
        methodSetLessonSelected={setLessonIdSelected}
      />

      <QuestionsComponent
        lessonIdSeelected={Array.from(lessonIdSelected)[0] || ''}
        // questionsData={[]}
      />

      {/* <QuestionsTable
        questionsData={selectedLessonId ? questions : []}
        isNewQuestionModalOpen={isNewQuestionModalOpen}
        onCloseNewQuestion={() => setIsNewQuestionModalOpen(false)}
      /> */}

    </>
  );
}

export default ContentPage;