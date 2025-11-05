import { collection, Timestamp, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase";
import { ILessonData } from "@/interfaces/topoquizz";

function getLessonsByCourse(courseId: string) {

  const [data, setData] = useState<ILessonData[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay courseId, no hacer la query
    if (!courseId) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const colLessonsRef = collection(db, "lessons")
    const q = query(
      colLessonsRef, where('courseId', '==', courseId)
    )

    // Usar onSnapshot para escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as ILessonData
        })

        //sort
        items.sort((a, b) => {
          const dateA = a.updatedAt instanceof Date
            ? a.updatedAt
            : (a.updatedAt == null ? new Date(0) : new Date(a.updatedAt));
          const dateB = b.updatedAt instanceof Date
            ? b.updatedAt
            : (b.updatedAt == null ? new Date(0) : new Date(b.updatedAt));
          return dateA.getTime() - dateB.getTime();
        });

        setData(items)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false)
      }
    )

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie courseId
    return () => unsubscribe()
  }, [courseId])

  return { data, loading, error }

}
export default getLessonsByCourse