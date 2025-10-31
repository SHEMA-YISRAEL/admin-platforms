import { useEffect, useState} from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData, QuestionData } from "@/interfaces/topoquizz";
import { emptyQuestion } from "@/utils/topoquizz";


interface QuestionsComponentProps {
  lessonSelected: ILessonData
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonSelected}) => {
  const {
    questionsData: questions, 
    loading: questionsLoading, 
    error: questionsError 
  } = getQuestionsByLesson(lessonSelected.id);
  
  const [dataForTable, setDataForTable] = useState<QuestionData[]>([emptyQuestion]);

  useEffect(()=>{
    if(questions.length > 0){
      console.log(questions) 
      setDataForTable(questions)
    }
  }, [questions])

  return (
    <QuestionsTable 
      questionsData={dataForTable}
      isLoadingDataTable={questionsLoading}/>
  );
}
 
export default QuestionsComponent;