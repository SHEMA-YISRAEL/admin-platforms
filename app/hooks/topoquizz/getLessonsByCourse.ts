import { getDocs, collection, Timestamp, query, where } from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase";
import { ILessonData } from "@/interfaces/topoquizz";

function getLessonsByCourse(courseId: string) {

  const [data, setData] = useState<ILessonData[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchLessonsById = async (courseId: string) => {
      try {
        setLoading(true)
        setError(null)
        const colLessonsRef = await collection(db, "lessons")
        const q = query(
          colLessonsRef, where('courseId', '==', courseId)
        )

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as ILessonData
        })
        setData(items)


      } catch (err) {
        console.error('Error fetching Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false)
      }
    }
    fetchLessonsById(courseId)
  }, [courseId])

  return { data, loading, error }

}
export default getLessonsByCourse