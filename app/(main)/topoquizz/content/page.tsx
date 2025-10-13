'use client'
import QuestionsTable from "@/components/topoquizz/questionsTable";
import getCourses from "@/lib/firebase/getCourses";

import { Listbox, ListboxItem } from "@heroui/react";

interface ContentPageProps {

}

const SubjectsList = ()=>{

  const { 
    coursesData:coursesDataFromFirebase, 
    loading: loadingCourses, 
    error: errorGettingCoursesData 
  } = getCourses()
  
  return(
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-4xl">Materias</div>
        {
          loadingCourses? <div>Cargando...</div>:<></>
        }
        <Listbox
          // disabledKeys={["edit", "delete"]}
          onAction={(key) => alert(key)}
        >
        {
          coursesDataFromFirebase.map((element, index)=>{
            return(
              <ListboxItem key={element.name.toLowerCase()}>{element.name}</ListboxItem>
            )   
          })
        }
        </Listbox>


      </div>
    </>
  )
}


const LessonsList=()=>{

  return(
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-4xl">Lecciones</div>
        




      </div>
      
      
    </>
  )
}

const ContentPage: React.FC<ContentPageProps> = () => {

  

  return (
    <>
      <SubjectsList/>
      <LessonsList/>
      <QuestionsTable questionsData={[]}/>

    </>
  );
}

export default ContentPage;