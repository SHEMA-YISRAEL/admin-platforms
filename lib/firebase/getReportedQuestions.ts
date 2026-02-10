import { collection, Timestamp, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { ReportedQuestionData } from "@/interfaces/topoquizz";

export type ReportFilter = "pending" | "solved" | "all";

function useReportedQuestions(filter: ReportFilter = "pending") {
  const [reportedQuestions, setReportedQuestions] = useState<ReportedQuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const colRef = collection(db, "reportQuestion");

    let q;
    if (filter === "all") {
      q = query(colRef, orderBy("createdAt", "desc"));
    } else {
      q = query(colRef, where("solved", "==", filter === "solved"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            reason: data.reason || [],
            suggestion: data.suggestion || "",
            solved: data.solved ?? false,
            questionId: data.questionId || "",
            question: data.question || "",
            userId: data.userId,
            displayName: data.displayName,
            email: data.email,
            lessonId: data.lessonId,
            lessonName: data.lessonName,
            subjectName: data.subjectName,
            createdAt: data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : data.createdAt
                ? new Date(data.createdAt)
                : null,
          } as ReportedQuestionData;
        });

        setReportedQuestions(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reported questions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter]);

  return { reportedQuestions, loading, error };
}

export default useReportedQuestions;
