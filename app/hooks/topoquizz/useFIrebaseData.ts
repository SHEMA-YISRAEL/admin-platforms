import { useState, useEffect } from "react";
import { getDocs, collection, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface CourseData {
    id: string;
    title: string;
    name?: string;
    slug:string;
    createdAt: Date;
    updatedAt: Date;
    lessonsNumber: number;
    // [key: string]: any;
}

interface IlessonsCounterByCourseType {
    [key: string]: number;
}

function useFirebaseData() {

    const [data, setData] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const querySnapshot = await getDocs(
                    collection(db, "courses") //llamada al FB
                );
                const items: CourseData[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
                        lessonsNumber: 0,
                    } as CourseData;
                });


                // items.sort((a, b) => {
                //     const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
                //     const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
                //     return dateB.getTime() - dateA.getTime();
                // });
                // console.log(sortedItems, 'sorted')

                const lessonsCounterByCourse : IlessonsCounterByCourseType = {}
                const allLessons = await getDocs(collection(db, "lessons")); //llamda a l FB
                allLessons.docs.map((el)=>{
                    const data = el.data();
                    // console.log(data.courseId)
                    if(data.courseId in lessonsCounterByCourse){
                        lessonsCounterByCourse[data.courseId]=lessonsCounterByCourse[data.courseId]+1
                    }else{
                        lessonsCounterByCourse[data.courseId]=1
                    }
                })
                
                items.map((element)=>{
                    element.lessonsNumber = lessonsCounterByCourse[element.id]
                })
                setData(items);
            } catch (err) {
                console.error('Error fetching Firebase data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, loading, error };
}

export default useFirebaseData;