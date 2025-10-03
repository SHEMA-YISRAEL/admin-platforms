import { getDocs, collection, Timestamp, query, where} from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase";

import { QuestionData } from "@/interfaces/topoquizz";

function getQuestionsByLesson(lessonId:string){

    const [questionsData, setQuestionsData] = useState<QuestionData[]>([])

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{

        const fetchQuestionsByLesson = async (lessonId:string) =>{
            try{
                setLoading(true)
                setError(null)
                const colQuestionsRef =  await collection(db, "questions")
                const q = query(
                    colQuestionsRef, where('lessonId', '==', lessonId)
                )

                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc)=>{
                    const data= doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
                    } as QuestionData
                })
                setQuestionsData(items)


            }catch(err){
                console.error('Error fetching Firebase data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }finally{
                setLoading(false)
            }
        }
        fetchQuestionsByLesson(lessonId)
    }, [lessonId])

    return {questionsData, loading, error}

}
export default getQuestionsByLesson
