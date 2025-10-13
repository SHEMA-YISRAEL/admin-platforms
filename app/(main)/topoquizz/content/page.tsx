'use client'
import getCourses from "@/lib/firebase/getCourses";

interface ContentPageProps {

}

const ContentPage: React.FC<ContentPageProps> = () => {

  const { 
    coursesData:coursesDataFromFirebase, 
    loading: loadingCourses, 
    error: errorGettingCoursesData 
  } = getCourses()

  return (
    <>
      
      <div className="text-6xl font-bold">Contenido</div>
      {
        loadingCourses? <div>Cargando...</div>:<></>
      }
      {
        coursesDataFromFirebase.map((element, index)=>{
          return(
            <div>{element.name}</div>
          )   
        })
      }

    </>
  );
}

export default ContentPage;