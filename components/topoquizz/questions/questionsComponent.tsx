import { useEffect, useState} from "react";
import QuestionsTable from "../questionsTable";
import getQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData, QuestionData } from "@/interfaces/topoquizz";
import { IDifficult } from "@/types/Topoqizz";

interface QuestionsComponentProps {
  lessonSelected: ILessonData
  filterValue: IDifficult
  searchText: string
}
 
const QuestionsComponent: React.FC<QuestionsComponentProps> = ({lessonSelected, filterValue, searchText}) => {
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
    if (questions.length > 0) {
      let filteredData = questions;

      // Filtrar por dificultad
      if (filterValue.identifier !== -1) {
        filteredData = filteredData.filter((el) => el.difficult === filterValue.identifier);
      }

      // Filtrar por texto de búsqueda
      if (searchText.trim() !== "") {
        filteredData = filteredData.filter((el) =>
          el.question.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setDataForTable(filteredData);
    } else {
      setDataForTable([]);
    }
  }, [questions, filterValue, searchText])

  return (
    <div className="h-full">
      <QuestionsTable
        questionsData={dataForTable}
        isLoadingDataTable={questionsLoading}/>
    </div>
  );
}
 
export default QuestionsComponent;