import { useEffect } from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData } from "@/interfaces/topoquizz";


interface QuestionsComponentProps {
  lessonSelected: ILessonData
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonSelected}) => {
  const {
    questionsData: questions, 
    loading: questionsLoading, 
    error: questionsError 
  } = getQuestionsByLesson(lessonSelected.id);

  useEffect(()=>{
    console.log(questions)
  }, [questions])

  return (
    <QuestionsTable 
      questionsData={questions}
      isLoadingDataTable={questionsLoading}/>
  );
}
 
export default QuestionsComponent;