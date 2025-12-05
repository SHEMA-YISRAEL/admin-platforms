'use client';

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import useMaterias from "@/app/hooks/neurapp/useMaterias";
import useLessons, { LessonData } from "@/app/hooks/neurapp/useLessons";
import useSublessons, { SublessonData } from "@/app/hooks/neurapp/useSublessons";
import LessonManager from "@/components/neurapp/LessonManager";
import ResourceManager from "@/components/neurapp/ResourceManager";
import LessonInfoPanel from "@/components/neurapp/LessonInfoPanel";
import SublessonInfoPanel from "@/components/neurapp/SublessonInfoPanel";
import LessonModal from "@/components/neurapp/LessonModal";
import SublessonModal from "@/components/neurapp/SublessonModal";

type EditingLessonState = { type: 'create' | 'edit', data: LessonData | null };
type EditingSublessonState = { type: 'create' | 'edit', data: SublessonData | null, lessonId: number };

const colors = [
  "bg-[#C65444]",
  "bg-[#7396C8]",
  "bg-[#939D5C]",
  "bg-[#D17B4C]",
  "bg-[#D0A44D]",
];

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();

  // 1) Normalizar slug y forzar string -> number de forma segura
  const slugParam = useMemo(
    () => (Array.isArray(params.slug) ? params.slug[0] : params.slug),
    [params.slug]
  );
  const courseId = useMemo(() => Number(slugParam), [slugParam]);
  const courseKey = useMemo(() => String(slugParam ?? ""), [slugParam]);

  const { materias, loading: materiasLoading, error: materiasError } = useMaterias();

  // 2) Evitar llamar useLessons con NaN
  const lessonsEnabled = Number.isFinite(courseId) && courseId > 0;
  const { lessons, loading: lessonsLoading, setLessons, error: lessonsError } =
    useLessons(lessonsEnabled ? courseId : 0);

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedSublesson, setSelectedSublesson] = useState<number | null>(null);
  const [lessonModalState, setLessonModalState] = useState<EditingLessonState | null>(null);
  const [sublessonModalState, setSublessonModalState] = useState<EditingSublessonState | null>(null);

  // Hook para las sublecciones de la lección seleccionada
  const { sublessons, loading: sublessonsLoading, error: sublessonsError, setSublessons } =
    useSublessons(selectedLesson);

  const currentCourse = materias.find(m => String(m.id) === courseKey);

  if (materiasLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (materiasError) return <div className="p-8 text-center text-red-500">Error: {materiasError}</div>;

  if (!currentCourse) {
    return <div className="p-8 text-center text-red-500">Curso no encontrado</div>;
  }

  const handleTabChange = (key: React.Key) => {
    router.push(`/neurapp/${String(key)}`);
  };

  return (
    <div className="flex w-full flex-col mt-4">
      {/* Tabs de Materias */}
      <Tabs
        aria-label="Materias"
        className="justify-center mb-0"
        variant="bordered"
        classNames={{ tabList: "justify-center bg-black" }}
        selectedKey={courseKey}
        onSelectionChange={handleTabChange}
      >
        {materias.map((materia, index) => (
          <Tab
            key={String(materia.id)}
            title={
              <span
                className={`px-2 py-2 text-gray-50 hover:bg-gray-400 hover:text-white font-bold rounded-lg ${colors[index % colors.length]}`}
              >
                {materia.title}
              </span>
            }
          />
        ))}
      </Tabs>

      {/* Dashboard del Curso */}
      <div className="mt-6 px-4">
        {/* Layout de 2 columnas: Lecciones/Sublecciones | Panel Información + Recursos */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Columna Izquierda: Lecciones y Sublecciones */}
          <div>
            {lessonsLoading ? (
              <p className="text-center text-gray-500 py-8">Cargando lecciones…</p>
            ) : lessonsError ? (
              <p className="text-center text-red-500 py-8">Error: {lessonsError}</p>
            ) : !lessons || lessons.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay lecciones en este curso.
              </p>
            ) : (
              <LessonManager
                courseId={courseId}
                lessons={lessons}
                loading={false}
                onLessonSelect={(lessonId) => {
                  setSelectedLesson(lessonId);
                  setSelectedSublesson(null);
                }}
                onLessonsChange={setLessons}
                selectedLessonId={selectedLesson}
                onSublessonSelect={setSelectedSublesson}
                selectedSublessonId={selectedSublesson}
                sublessons={sublessons}
                sublessonsLoading={sublessonsLoading}
                sublessonsError={sublessonsError}
                onSublessonsChange={setSublessons}
              />
            )}
          </div>

          {/* Columna Derecha: Panel de Información + Recursos */}
          <div className="flex flex-col gap-6 2xl:mr-40 2xl:-ml-70">
            {/* Panel de Información de Lección */}
            {selectedLesson && !selectedSublesson && (
              <Card className="shadow-lg">
                <CardBody>
                  <LessonInfoPanel
                    lesson={lessons.find(l => l.id === selectedLesson)!}
                    onEdit={() => {
                      setLessonModalState({
                        type: 'edit',
                        data: lessons.find(l => l.id === selectedLesson) || null
                      });
                    }}
                  />
                </CardBody>
              </Card>
            )}

            {/* Panel de Información de Sublección */}
            {selectedSublesson && (
              <Card className="shadow-lg">
                <CardBody>
                  <SublessonInfoPanel
                    sublesson={sublessons.find(s => s.id === selectedSublesson)!}
                    onEdit={() => {
                      setSublessonModalState({
                        type: 'edit',
                        data: sublessons.find(s => s.id === selectedSublesson) || null,
                        lessonId: selectedLesson!
                      });
                    }}
                  />
                </CardBody>
              </Card>
            )}

            {/* Recursos */}
            <ResourceManager
              type={selectedSublesson ? "sublesson" : "lesson"}
              id={selectedSublesson ?? selectedLesson ?? null}
            />
          </div>
        </div>
      </div>

      {/* Modal para lecciones */}
      {lessonModalState && (
        <LessonModal
          isOpen={true}
          onClose={() => setLessonModalState(null)}
          courseId={courseId}
          lesson={lessonModalState}
          lessons={lessons}
          onSave={(savedLesson: LessonData) => {
            if (lessonModalState.type === 'edit') {
              const updatedLessons = lessons.map(l =>
                l.id === savedLesson.id ? savedLesson : l
              );
              setLessons(updatedLessons.sort((a, b) => a.order - b.order));
            } else {
              setLessons([...lessons, savedLesson].sort((a, b) => a.order - b.order));
            }
          }}
        />
      )}

      {/* Modal para sublecciones */}
      {sublessonModalState && (
        <SublessonModal
          isOpen={true}
          onClose={() => setSublessonModalState(null)}
          lessonId={sublessonModalState.lessonId}
          sublesson={sublessonModalState}
          sublessons={sublessons}
          onSublessonsChange={setSublessons}
          onSave={() => {}}
        />
      )}
    </div>
  );
}
