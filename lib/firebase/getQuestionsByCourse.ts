import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { QuestionData } from '@/interfaces/topoquizz';

async function getQuestionsByCourse(courseId: string): Promise<QuestionData[]> {
  const lessonsRef = collection(db, 'lessons');
  const lessonsSnapshot = await getDocs(query(lessonsRef, where('courseId', '==', courseId)));
  const lessonIds = lessonsSnapshot.docs.map((doc) => doc.id);

  if (lessonIds.length === 0) return [];

  const allQuestions: QuestionData[] = [];

  for (let i = 0; i < lessonIds.length; i += 30) {
    const batch = lessonIds.slice(i, i + 30);
    const questionsRef = collection(db, 'questions');
    const questionsSnapshot = await getDocs(query(questionsRef, where('lessonId', 'in', batch)));

    const batchQuestions = questionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
      } as QuestionData;
    });

    allQuestions.push(...batchQuestions);
  }

  return allQuestions;
}

export default getQuestionsByCourse;
