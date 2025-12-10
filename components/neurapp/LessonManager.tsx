'use client';

import { Fragment, useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { LessonData } from "@/app/hooks/neurapp/useLessons";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";
import SublessonManager from "./SublessonManager";
import LessonModal from "./LessonModal";

type EditingLessonState = { type: 'create' | 'edit', data: LessonData | null };

interface LessonManagerProps {
  courseId: number;
  lessons: LessonData[];
  loading: boolean;
  error?: string | null;
  onLessonSelect: (lessonId: number | null) => void;
  onLessonsChange: (lessons: LessonData[]) => void;
  selectedLessonId: number | null;
  onSublessonSelect?: (sublessonId: number | null) => void;
  selectedSublessonId?: number | null;
  sublessons: SublessonData[];
  sublessonsLoading: boolean;
  sublessonsError?: string | null;
  onSublessonsChange: (sublessons: SublessonData[]) => void;
}

function SublessonRow({
  lessonId,
  onSublessonSelect,
  selectedSublessonId,
  sublessons,
  loading,
  error,
  onSublessonsChange
}: {
  lessonId: number;
  onSublessonSelect?: (sublessonId: number | null) => void;
  selectedSublessonId?: number | null;
  sublessons: SublessonData[];
  loading: boolean;
  error?: string | null;
  onSublessonsChange: (sublessons: SublessonData[]) => void;
}) {
  return (
    <tr>
      <td colSpan={3} className="px-0 py-0 bg-gray-50">
        <div className="px-6 py-4">
          <SublessonManager
            lessonId={lessonId}
            sublessons={sublessons}
            loading={loading}
            error={error}
            onSublessonsChange={onSublessonsChange}
            onSublessonSelect={onSublessonSelect}
            selectedSublessonId={selectedSublessonId}
          />
        </div>
      </td>
    </tr>
  );
}

export default function LessonManager({
  courseId,
  lessons,
  loading,
  error,
  onLessonSelect,
  onLessonsChange,
  selectedLessonId,
  onSublessonSelect,
  selectedSublessonId,
  sublessons,
  sublessonsLoading,
  sublessonsError,
  onSublessonsChange
}: LessonManagerProps) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; lesson: EditingLessonState } | null>(null);

  const handleCreate = () => {
    setModalState({ isOpen: true, lesson: { type: 'create', data: null } });
  };

  const handleModalClose = () => {
    setModalState(null);
  };

  const handleSave = (savedLesson: LessonData) => {
    if (modalState?.lesson.type === 'edit') {
      const updatedLessons = lessons.map(l =>
        l.id === savedLesson.id ? savedLesson : l
      );
      onLessonsChange(updatedLessons.sort((a, b) => a.order - b.order));
    } else {
      onLessonsChange([...lessons, savedLesson].sort((a, b) => a.order - b.order));
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando lecciones...</div>;
  }

  return (
    <div className="h-full flex flex-col 2xl:ml-40 2xl:mr-80">
      {/* Header */}
        <div className="flex items-end justify-end p-3 mb-2">
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
            onPress={handleCreate}
            size="sm"
          >
            + Nueva Lección
          </Button>
        </div>
      {error && (
        <div className="flex-shrink-0 mb-3">
          <Card className="border-yellow-500 border-2">
            <CardBody>
              <p className="text-yellow-600 text-sm">
                ⚠️ {error}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tabla de lecciones */}
      {lessons.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay lecciones. Crea una nueva lección para comenzar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg bg-white shadow-md border border-gray-200">
          <table className="min-w-full bg-white 2xl:text-base text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">LECCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <Fragment key={lesson.id}>
                  <tr
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                      selectedLessonId === lesson.id ? 'bg-blue-100/70' : ''
                    }`}
                    onClick={() => {
                      if (selectedLessonId === lesson.id) {
                        onLessonSelect(null);
                      } else {
                        onLessonSelect(lesson.id);
                      }
                    }}
                  >
                    <td className="px-3 py-2 text-gray-700">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {lesson.order}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">
                          {selectedLessonId === lesson.id ? '▼' : '▶'}
                        </span>
                        {lesson.title}
                      </div>
                      </td>
                    </tr>
                    {selectedLessonId === lesson.id && (
                      <SublessonRow
                        lessonId={selectedLessonId}
                        onSublessonSelect={onSublessonSelect}
                        selectedSublessonId={selectedSublessonId}
                        sublessons={sublessons}
                        loading={sublessonsLoading}
                        error={sublessonsError}
                        onSublessonsChange={onSublessonsChange}
                      />
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Modal para crear/editar lección */}
      {modalState && (
        <LessonModal
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          courseId={courseId}
          lesson={modalState.lesson}
          lessons={lessons}
          onSave={handleSave}
        />
      )}
    </div>
  );
}