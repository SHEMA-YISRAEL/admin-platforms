'use client';

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import useMaterias from "@/app/hooks/neurapp/useMaterias";
import useLessons from "@/app/hooks/neurapp/useLessons";
import LessonManager from "@/components/neurapp/LessonManager";
import ResourceManager from "@/components/neurapp/ResourceManager";

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
        {/* Layout de 2 columnas: Lecciones/Sublecciones | Recursos */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-2 gap-6">
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
                  setSelectedSublesson(null); // Reset sublesson when changing lesson
                }}
                onLessonsChange={setLessons}
                selectedLessonId={selectedLesson}
                onSublessonSelect={setSelectedSublesson}
                selectedSublessonId={selectedSublesson}
              />
            )}
          </div>

          {/* Columna Derecha: Recursos */}
          <div>
            <ResourceManager
              type={selectedSublesson ? "sublesson" : "lesson"}
              id={selectedSublesson ?? selectedLesson ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
