import { useEffect, useState } from "react";
import useQuestionsByLesson from "@/lib/firebase/getQuestionsByLesson";
import { ILessonData, QuestionData } from "@/interfaces/topoquizz";
import { Spinner } from "@heroui/react";
import TranslationCard from "./translationCard";

interface TranslationsListComponentProps {
  lessonSelected: ILessonData
}

const TranslationsListComponent: React.FC<TranslationsListComponentProps> = ({ lessonSelected }) => {
  const {
    questionsData: questions,
    loading: questionsLoading
  } = useQuestionsByLesson(lessonSelected.id);

  const [dataForList, setDataForList] = useState<QuestionData[]>([]);

  // Limpiar datos cuando cambia la lección seleccionada
  useEffect(() => {
    setDataForList([]);
  }, [lessonSelected.id])

  // Actualizar datos cuando llegan las preguntas
  useEffect(() => {
    if (questions.length > 0) {
      setDataForList(questions);
      console.log(questions)
    } else {
      setDataForList([]);
    }
  }, [questions])

  if (questionsLoading) {
    return (
      <div className="h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200">
        <div className="flex justify-center items-center h-full">
          <Spinner size="lg" color="warning" />
        </div>
      </div>
    );
  }

  if (dataForList.length === 0) {
    return (
      <div className="h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200">
        <div className="flex justify-center items-center h-full text-center font-semibold text-2xl text-gray-400">
          No hay preguntas para traducir
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {dataForList.map((question, index) => (
            <TranslationCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TranslationsListComponent;
