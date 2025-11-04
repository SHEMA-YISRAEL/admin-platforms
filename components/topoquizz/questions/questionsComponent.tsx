import { useEffect, useState} from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData, QuestionData } from "@/interfaces/topoquizz";


interface QuestionsComponentProps {
  lessonSelected: ILessonData
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonSelected}) => {
  const {
    questionsData: questions,
    loading: questionsLoading
  } = getQuestionsByLesson(lessonSelected.id);

  const [dataForTable, setDataForTable] = useState<QuestionData[]>([]);

  // Limpiar datos cuando cambia la lección seleccionada
  useEffect(()=>{
    setDataForTable([]);
  }, [lessonSelected.id])

  // Actualizar datos cuando llegan las preguntas
  useEffect(()=>{
    if(questions.length > 0){
      console.log(questions)
      setDataForTable(questions)
    } else {
      // Si no hay preguntas, limpiar el array
      setDataForTable([])
    }
  }, [questions])

  return (
    <div className="h-full">
      <QuestionsTable
        questionsData={dataForTable}
        isLoadingDataTable={questionsLoading}/>
    </div>
  );
}
 
export default QuestionsComponent;