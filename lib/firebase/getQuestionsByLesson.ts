import { collection, Timestamp, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "@/utils/firebase";

import { QuestionData } from "@/interfaces/topoquizz";

function useQuestionsByLesson(lessonId: string) {

  const [questionsData, setQuestionsData] = useState<QuestionData[]>([])

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true)
    setError(null)

    const colQuestionsRef = collection(db, "questions")
    const q = query(
      colQuestionsRef, where('lessonId', '==', lessonId)
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
          } as QuestionData
        })

        items.sort((a, b) => {
          const dateA = a.updatedAt instanceof Date
            ? a.updatedAt
            : (a.updatedAt == null ? new Date(0) : new Date(a.updatedAt));
          const dateB = b.updatedAt instanceof Date
            ? b.updatedAt
            : (b.updatedAt == null ? new Date(0) : new Date(b.updatedAt));
          return dateB.getTime() - dateA.getTime();
        });

        setQuestionsData(items)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false)
      }
    )

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie lessonId
    return () => unsubscribe()
  }, [lessonId])

  return { questionsData, loading, error }

}
export default useQuestionsByLesson
