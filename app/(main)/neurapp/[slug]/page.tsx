'use client';

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/react";
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

export default function CoursePage() {
  const params = useParams();

  // 1) Normalizar slug
  const slugParam = useMemo(
    () => (Array.isArray(params.slug) ? params.slug[0] : params.slug),
    [params.slug]
  );
  const courseSlug = useMemo(() => String(slugParam ?? ""), [slugParam]);

  const { materias, loading: materiasLoading, error: materiasError } = useMaterias();

  // 2) Buscar materia por slug y obtener su ID
  const currentCourse = materias.find(m => m.slug === courseSlug);
  const courseId = currentCourse?.id ?? 0;

  // 3) Evitar llamar useLessons con ID inválido
  const lessonsEnabled = courseId > 0;
  const { lessons, loading: lessonsLoading, setLessons, error: lessonsError } =
    useLessons(lessonsEnabled ? courseId : 0);

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedSublesson, setSelectedSublesson] = useState<number | null>(null);
  const [lessonModalState, setLessonModalState] = useState<EditingLessonState | null>(null);
  const [sublessonModalState, setSublessonModalState] = useState<EditingSublessonState | null>(null);

  // Hook para las sublecciones de la lección seleccionada
  const { sublessons, loading: sublessonsLoading, error: sublessonsError, setSublessons } =
    useSublessons(selectedLesson);

  if (materiasLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (materiasError) return <div className="p-8 text-center text-red-500">Error: {materiasError}</div>;

  if (!currentCourse) {
    return <div className="p-8 text-center text-red-500">Curso no encontrado</div>;
  }

  return (
    <div className="flex w-full flex-col px-4">

      {/* Dashboard del Curso */}
      <div className="mt-4">
        {/* Título de la Materia */}
        <div className="mb-6 2xl:ml-40">
          <h1 className="text-3xl font-bold text-gray-800">{currentCourse.title}</h1>
        </div>

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
