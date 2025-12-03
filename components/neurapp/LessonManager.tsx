'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Accordion, AccordionItem } from "@heroui/react";
import { LessonData } from "@/app/hooks/neurapp/useLessons";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";
import useSublessons from "@/app/hooks/neurapp/useSublessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
}

// Componente para manejar sublecciones
function SublessonSection({
  lessonId,
  onSublessonSelect,
  selectedSublessonId
}: {
  lessonId: number;
  onSublessonSelect?: (sublessonId: number | null) => void;
  selectedSublessonId?: number | null;
}) {
  const { sublessons, loading, setSublessons } = useSublessons(lessonId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSublesson, setEditingSublesson] = useState<SublessonData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1
  });

  const handleCreate = () => {
    setEditingSublesson(null);
    setFormData({
      title: '',
      description: '',
      order: sublessons.length + 1
    });
    onOpen();
  };

  const handleEdit = (sublesson: SublessonData) => {
    setEditingSublesson(sublesson);
    setFormData({
      title: sublesson.title,
      description: sublesson.description || '',
      order: sublesson.order
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      const url = editingSublesson
        ? `${API_BASE_URL}/lesson/${lessonId}/sublessons/${editingSublesson.id}`
        : `${API_BASE_URL}/lesson/${lessonId}/sublesson`;

      const method = editingSublesson ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const savedSublesson = await response.json();

      if (editingSublesson) {
        const updatedSublessons = sublessons.map(s =>
          s.id === editingSublesson.id ? savedSublesson : s
        );
        setSublessons(updatedSublessons.sort((a, b) => a.order - b.order));
      } else {
        setSublessons([...sublessons, savedSublesson].sort((a, b) => a.order - b.order));
      }

      onClose();
    } catch (error) {
      console.error('Error saving sublesson:', error);
      alert('Error al guardar la sublección');
    }
  };

  if (loading) {
    return <div className="text-center py-2 text-sm text-gray-500">Cargando sublecciones...</div>;
  }

  return (
    <div className="mt-3 pl-4 border-l-2 border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-700">Sublecciones</h4>
        <Button size="sm" className="bg-green-500 text-white text-xs" onPress={handleCreate}>
          + Sublección
        </Button>
      </div>

      {sublessons.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No hay sublecciones</p>
      ) : (
        <div className="space-y-2">
          {sublessons.map((sublesson) => (
            <Card
              key={sublesson.id}
              className={`bg-gray-50 ${selectedSublessonId === sublesson.id ? 'border-2 border-green-500' : ''}`}
              isPressable
              isHoverable
            >
              <CardBody className="p-3">
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSublessonSelect?.(selectedSublessonId === sublesson.id ? null : sublesson.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-300 px-2 py-0.5 rounded">
                        {sublesson.order}
                      </span>
                      <h5 className="font-semibold text-sm">{sublesson.title}</h5>
                    </div>
                    {sublesson.description && (
                      <p className="text-xs px-5 text-gray-600">{sublesson.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-xs mx-3"
                    onPress={() => handleEdit(sublesson)}
                  >
                    Editar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingSublesson ? 'Editar Sublección' : 'Nueva Sublección'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título de la sublección"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Textarea
                label="Descripción"
                placeholder="Descripción de la sublección (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="number"
                label="Orden"
                placeholder="Orden de la sublección"
                value={formData.order.toString()}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingSublesson ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
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
  selectedSublessonId
}: LessonManagerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: lessons.length + 1
  });

  const handleCreate = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      order: lessons.length + 1
    });
    onOpen();
  };

  const handleEdit = (lesson: LessonData) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      const url = editingLesson
        ? `${API_BASE_URL}/course/${courseId}/lessons/${editingLesson.id}`
        : `${API_BASE_URL}/course/${courseId}/lessons`;

      const method = editingLesson ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const savedLesson = await response.json();

      if (editingLesson) {
        // Update existing lesson
        const updatedLessons = lessons.map(l =>
          l.id === editingLesson.id ? savedLesson : l
        );
        onLessonsChange(updatedLessons.sort((a, b) => a.order - b.order));
      } else {
        // Add new lesson
        onLessonsChange([...lessons, savedLesson].sort((a, b) => a.order - b.order));
      }

      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error al guardar la lección');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando lecciones...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 2xl:mx-40">
        <h2 className="text-xl font-bold">Lecciones del Curso</h2>
        <Button className="bg-blue-500 text-white" onPress={handleCreate}>
          + Nueva Lección
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-yellow-500 border-2">
          <CardBody>
            <p className="text-yellow-600 text-sm">
              ⚠️ {error}
            </p>
          </CardBody>
        </Card>
      )}

      {lessons.length === 0 ? (
        <Card className="2xl:mx-40">
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay lecciones. Crea una nueva lección para comenzar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Accordion className="2xl:mx-40" selectionMode="multiple">
          {lessons.map((lesson) => (
            <AccordionItem
              key={lesson.id}
              aria-label={lesson.title}
              title={
                <div className="flex items-center justify-between w-full">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onLessonSelect(lesson.id)}
                  >
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {lesson.order}
                    </span>
                    <h3 className="font-bold text-base">{lesson.title}</h3>
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => handleEdit(lesson)}
                  >
                    Editar
                  </Button>
                </div>
              }
              className={selectedLessonId === lesson.id ? 'outline-offset-5 outline-2 rounded-2xl outline-blue-500' : ''}
            >
              <div className="pb-4">
                {lesson.description && (
                  <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                )}
                <SublessonSection
                  lessonId={lesson.id}
                  onSublessonSelect={onSublessonSelect}
                  selectedSublessonId={selectedSublessonId}
                />
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Modal for Create/Edit */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título de la lección"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Textarea
                label="Descripción"
                placeholder="Descripción de la lección (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="number"
                label="Orden"
                placeholder="Orden de la lección"
                value={formData.order.toString()}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingLesson ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}