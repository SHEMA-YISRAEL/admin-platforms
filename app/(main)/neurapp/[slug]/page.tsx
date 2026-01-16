'use client';

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
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

  // Normalize slug parameter
  const slugParam = useMemo(
    () => (Array.isArray(params.slug) ? params.slug[0] : params.slug),
    [params.slug]
  );
  const courseSlug = useMemo(() => String(slugParam ?? ""), [slugParam]);

  const { materias, loading: materiasLoading, error: materiasError } = useMaterias();

  // Find course by slug and get its ID
  const currentCourse = materias.find(m => m.slug === courseSlug);
  const courseId = currentCourse?.id ?? 0;

  // Avoid calling useLessons with invalid ID
  const lessonsEnabled = courseId > 0;
  const { lessons, loading: lessonsLoading, setLessons, error: lessonsError } =
    useLessons(lessonsEnabled ? courseId : 0);

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [selectedSublesson, setSelectedSublesson] = useState<number | null>(null);
  const [lessonModalState, setLessonModalState] = useState<EditingLessonState | null>(null);
  const [sublessonModalState, setSublessonModalState] = useState<EditingSublessonState | null>(null);

  // Reference to detect course change and control auto-selection
  const previousCourseIdRef = useRef<number | null>(null);
  const shouldAutoSelectRef = useRef<boolean>(true);

  // Hook for sublessons of the expanded lesson
  const { sublessons, loading: sublessonsLoading, error: sublessonsError, setSublessons } =
    useSublessons(expandedLesson);

  // Reset selection when course changes
  useEffect(() => {
    if (courseId > 0 && previousCourseIdRef.current !== courseId) {
      setSelectedLesson(null);
      setExpandedLesson(null);
      setSelectedSublesson(null);
      previousCourseIdRef.current = courseId;
      shouldAutoSelectRef.current = true; // Enable auto-selection when changing course
    }
  }, [courseId]);

  // Auto-select first lesson only when course changes
  useEffect(() => {
    if (lessons.length > 0 && selectedLesson === null && shouldAutoSelectRef.current) {
      setSelectedLesson(lessons[0].id);
      setExpandedLesson(lessons[0].id);
      shouldAutoSelectRef.current = false; // Disable auto-selection after first time
    }
  }, [lessons, selectedLesson]);

  if (materiasLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (materiasError) return <div className="p-8 text-center text-red-500">Error: {materiasError}</div>;

  if (!currentCourse) {
    return <div className="p-8 text-center text-red-500">Curso no encontrado</div>;
  }

  const handleLessonSelect = (lessonId: number | null) => {
    if (!lessonId) return;

    // If clicking on the same expanded lesson, only collapse the list
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      setSelectedSublesson(null); // Reset sublesson when collapsing
      // Keep selectedLesson so the right panel remains visible
    } else {
      // If clicking on a different lesson, select it and expand it
      setSelectedLesson(lessonId);
      setExpandedLesson(lessonId);
      setSelectedSublesson(null);
    }
  };

  const handleSublessonSelect = (sublessonId: number | null) => {
    setSelectedSublesson(sublessonId);
    // Ensure selectedLesson is synced with expandedLesson
    if (expandedLesson && selectedLesson !== expandedLesson) {
      setSelectedLesson(expandedLesson);
    }
  };

  const handleLessonEdit = () => {
    setLessonModalState({
      type: 'edit',
      data: lessons.find(l => l.id === selectedLesson) || null
    });
  };

  const handleSublessonEdit = () => {
    setSublessonModalState({
      type: 'edit',
      data: sublessons.find(s => s.id === selectedSublesson) || null,
      lessonId: expandedLesson!
    });
  };

  const handleLessonSave = (savedLesson: LessonData) => {
    if (lessonModalState?.type === 'edit') {
      const updatedLessons = lessons.map(l =>
        l.id === savedLesson.id ? savedLesson : l
      );
      setLessons(updatedLessons.sort((a, b) => a.order - b.order));
    } else {
      setLessons([...lessons, savedLesson].sort((a, b) => a.order - b.order));
    }
  };

  return (
    <div className="flex w-full flex-col px-4">
      {/* Course Dashboard */}
      <div className="mt-4">
        {/* Course Title */}
        <div className="mb-6 2xl:ml-40">
          <h1 className="text-3xl font-bold text-gray-800">{currentCourse.title}</h1>
        </div>

        {/* 2-Column Layout: Lessons/Sublessons | Info Panel + Resources */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Left Column: Lessons and Sublessons */}
          <div>
            <LessonManager
              courseId={courseId}
              lessons={lessons}
              loading={lessonsLoading}
              error={lessonsError}
              onLessonSelect={handleLessonSelect}
              onLessonsChange={setLessons}
              selectedLessonId={expandedLesson}
              onSublessonSelect={handleSublessonSelect}
              selectedSublessonId={selectedSublesson}
              sublessons={sublessons}
              sublessonsLoading={sublessonsLoading}
              sublessonsError={sublessonsError}
              onSublessonsChange={setSublessons}
            />
          </div>

          {/* Right Column: Info Panel + Resources */}
          <div className="flex flex-col gap-6 2xl:mr-40 2xl:-ml-70">
            {/* Lesson Info Panel */}
            {selectedLesson && !selectedSublesson && (
              <Card className="shadow-lg">
                <CardBody>
                  <LessonInfoPanel
                    lesson={lessons.find(l => l.id === selectedLesson)!}
                    onEdit={handleLessonEdit}
                  />
                </CardBody>
              </Card>
            )}

            {/* Sublesson Info Panel */}
            {selectedSublesson && (
              <Card className="shadow-lg">
                <CardBody>
                  <SublessonInfoPanel
                    sublesson={sublessons.find(s => s.id === selectedSublesson)!}
                    onEdit={handleSublessonEdit}
                  />
                </CardBody>
              </Card>
            )}

            {/* Resources */}
            <ResourceManager
              type={selectedSublesson ? "sublesson" : "lesson"}
              id={selectedSublesson ?? selectedLesson ?? null}
            />
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {lessonModalState && (
        <LessonModal
          isOpen={true}
          onClose={() => setLessonModalState(null)}
          courseId={courseId}
          lesson={lessonModalState}
          lessons={lessons}
          onSave={handleLessonSave}
        />
      )}

      {/* Sublesson Modal */}
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
