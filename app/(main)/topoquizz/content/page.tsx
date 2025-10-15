'use client'
import QuestionsTable from "@/components/topoquizz/questionsTable";
import getCourses from "@/lib/firebase/getCourses";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Listbox, ListboxItem } from "@heroui/react";
import getLessonsByCourse from "@/lib/firebase/getLessonsByCourse";

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
}

const LessonsList: React.FC<ILessonsListType>= ({courseSelected})=>{
  const {
    data:lessonsData,
    loading:loadingLessonsData,
    error} = getLessonsByCourse(courseSelected) //courseSelected:string

  const [selectedLesson, setSelectedLesson] = useState<"all" | Set<string>>(new Set([""]));

  useEffect(()=>{
    if (lessonsData.length > 0) {
      setSelectedLesson(new Set([lessonsData[0].slug || String(0)]));
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
          onSelectionChange={(keys) => setSelectedLesson(keys as Set<string>)}
          onAction={(key) => console.log(key)}
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

  const [courseSelected, setCourselected] = useState(new Set([""]));//useState<string>('')
  // const [lessonSelected, setLessonSelected] = useState<number>(0)
  // const [selectedSubject, setSelectedSubject] = useState(new Set([""]));
  

  return (
    <>
      <SubjectsList 
        selectedSubject={courseSelected}
        methodSetSelectedSubject={setCourselected}
      />
      <LessonsList 
        courseSelected={[...courseSelected][0]} //first element
      /> 
      {/* <QuestionsTable questionsData={[]}/> */}

    </>
  );
}

export default ContentPage;