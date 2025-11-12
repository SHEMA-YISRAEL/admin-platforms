'use client'

import { useState } from "react";
import QuestionsComponent from "@/components/topoquizz/questions/questionsComponent";

import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";
import { emptySubject, emptyLesson } from "@/utils/topoquizz";
import SubjectsList from "@/components/topoquizz/questions/subjectListComp";
import LessonsList from "@/components/topoquizz/questions/lessonListComponent";

import { Button } from "@heroui/react";
import NewQuestionModal from "@/components/topoquizz/modals/newQuestion";
import DifficultFilter from "@/components/topoquizz/questions/difficultFilter";
import SearchFilter from "@/components/topoquizz/questions/searchFilter";
import LanguageSelector from "@/components/topoquizz/questions/languageSelector";
import { IDifficult } from "@/types/Topoqizz";
import { LanguageCode, DEFAULT_LANGUAGE } from "@/types/languages";

interface ContentPageProps { }

const ContentPage: React.FC<ContentPageProps> = () => {

  const [courseSelected, setCourseSelected] = useState<ICoursesData>(emptySubject);
  const [lessonSelected, setLessonSelected] = useState<ILessonData>(emptyLesson);

  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState<boolean>(false);

  const difficultLevels = [
    {
      id:'all',
      label:'Todos',
      identifier:-1
    },
    {
      id:'easy',
      label:'Fácil',
      identifier:1
    },
    {
      id:'medium',
      label:'Medio',
      identifier:2
    },
    {
      id:'hard',
      label:'Difícil',
      identifier:3
    },
  ]

  const[levelSelected, setLevelSelected] = useState<IDifficult>(difficultLevels[0])
  const[searchText, setSearchText] = useState<string>("")
  const[selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header compacto */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">Gestión de Preguntas</h1>

          {/* Selectores y acciones en una sola fila */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Selectores de Materia y Lección */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <SubjectsList
                selectedSubject={courseSelected}
                methodSetSelectedSubject={setCourseSelected}
              />
              <LessonsList
                courseSelected={courseSelected}
                selectedLesson={lessonSelected}
                methodSetLessonSelected={setLessonSelected}
              />

              <DifficultFilter difficultLevels={difficultLevels} levelSelected={levelSelected} methodSetLevelSelected={setLevelSelected}/>

              <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />

              <SearchFilter searchValue={searchText} onSearchChange={setSearchText} />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                color='success'
                size="sm"
                onPress={()=>{setIsNewQuestionModalOpen(true)}}
                className="font-semibold"
              >
                + Crear Pregunta
              </Button>
              <Button color="primary" size="sm" isDisabled>
                Subir en Lote
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de preguntas - ocupa el resto del espacio */}
      <div className="flex-1 overflow-hidden px-4 pb-3">
        <QuestionsComponent
          lessonSelected={lessonSelected}
          filterValue={levelSelected}
          searchText={searchText}
          selectedLanguage={selectedLanguage}
        />
      </div>

      <NewQuestionModal
        isModalOpenState={isNewQuestionModalOpen}
        handleCloseModalMethod={()=>setIsNewQuestionModalOpen(false)}
        lessonId={lessonSelected.id}
      />
    </div>
  );
}

export default ContentPage;