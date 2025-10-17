import { useEffect } from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";


interface QuestionsComponentProps {
  lessonIdSeelected: string
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonIdSeelected}) => {
  const {
    questionsData: questions, 
    loading: questionsLoading, 
    error: questionsError 
  } = getQuestionsByLesson(lessonIdSeelected);

  useEffect(()=>{

  }, [])

  return (<>
    <QuestionsTable questionsData={questions}/>
  </>);
}
 
export default QuestionsComponent;