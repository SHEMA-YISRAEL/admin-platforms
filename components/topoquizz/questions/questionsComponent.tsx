import { useEffect, useState} from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData, QuestionData } from "@/interfaces/topoquizz";
import { IDifficult } from "@/types/Topoqizz";

interface QuestionsComponentProps {
  lessonSelected: ILessonData
  filterValue: IDifficult
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonSelected, filterValue}) => {
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
    questions.length > 0?
      filterValue.identifier!==-1?
        setDataForTable(questions.filter((el)=> el.difficult === filterValue.identifier)):
        setDataForTable(questions) 
      : 
    setDataForTable([])
  }, [questions, filterValue])

  return (
    <div className="h-full">
      <QuestionsTable
        questionsData={dataForTable}
        isLoadingDataTable={questionsLoading}/>
    </div>
  );
}
 
export default QuestionsComponent;