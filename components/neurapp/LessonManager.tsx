'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { LessonData } from "@/app/hooks/neurapp/useLessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LessonManagerProps {
  courseId: number;
  lessons: LessonData[];
  loading: boolean;
  error?: string | null;
  onLessonSelect: (lessonId: number | null) => void;
  onLessonsChange: (lessons: LessonData[]) => void;
  selectedLessonId: number | null;
}

export default function LessonManager({
  courseId,
  lessons,
  loading,
  error,
  onLessonSelect,
  onLessonsChange,
  selectedLessonId
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
      <div className="flex justify-between items-center mb-4 2xl:mx-50">
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
        <Card className="2xl:mx-50">
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay lecciones. Crea una nueva lección para comenzar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 2xl:mx-50">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              isPressable
              isHoverable
              className={selectedLessonId === lesson.id ? 'border-2 border-blue-500' : ''}
            >
              <CardBody>
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onLessonSelect(selectedLessonId === lesson.id ? null : lesson.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Orden: {lesson.order}
                      </span>
                      <h3 className="font-bold text-lg">{lesson.title}</h3>
                    </div>
                    {lesson.description && (
                      <p className="text-sm text-gray-600">{lesson.description}</p>
                    )}
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
              </CardBody>
            </Card>
          ))}
        </div>
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