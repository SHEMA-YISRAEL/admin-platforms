
import { getDocs, collection, Timestamp} from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase";

interface LessonData{

}

function getLessonsByCourse(courseId:string){
    const [data, setData] = useState<LessonData[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{

        const fetchLessonsById = async () =>{
            try{
                setLoading(true)
                setError(null)

                const queryLessons = await getDocs(collection(db, "lessons"))
                const items = queryLessons.docs.map((doc, item)=>{

                    const data= doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    }
                })

            }catch(error){

            }finally{
                setLoading(false)
            }
        }
        fetchLessonsById()

    }, [])


}
export default getLessonsByCourse