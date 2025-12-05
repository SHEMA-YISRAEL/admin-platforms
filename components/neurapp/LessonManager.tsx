'use client';

import { useState, Fragment } from "react";
import { Card, CardBody, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
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
  const { sublessons, loading, error, setSublessons } = useSublessons(lessonId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSublesson, setEditingSublesson] = useState<SublessonData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setEditingSublesson(null);
    setFormData({
      title: '',
      description: '',
      order: sublessons.length + 1
    });
    setErrors({});
    onOpen();
  };

  const handleEdit = (sublesson: SublessonData) => {
    setEditingSublesson(sublesson);
    setFormData({
      title: sublesson.title,
      description: sublesson.description || '',
      order: sublesson.order
    });
    setErrors({});
    onOpen();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'El orden debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const url = editingSublesson
        ? `${API_BASE_URL}/lessons/${lessonId}/sublessons/${editingSublesson.id}`
        : `${API_BASE_URL}/lessons/${lessonId}/sublessons`;

      const method = editingSublesson ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}\n${errorText}`);
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
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-2 text-sm text-gray-500">Cargando sublecciones...</div>;
  }

  if (error) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-red-200">
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-xs text-red-600">Error al cargar sublecciones: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-green-300 pl-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Sublecciones {sublessons.length > 0 && `(${sublessons.length})`}
        </h4>
        <Button size="sm" className="bg-green-500 text-white text-xs" onPress={handleCreate}>
          + Sublección
        </Button>
      </div>

      {sublessons.length === 0 ? (
        <p className="text-xs text-gray-500 py-2">No hay sublecciones creadas para esta lección</p>
      ) : (
        <div className="overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs">
            <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Descripción</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sublessons.map((sublesson) => (
                <tr
                  key={sublesson.id}
                  className={`hover:bg-green-50/50 transition-colors cursor-pointer ${
                    selectedSublessonId === sublesson.id ? 'bg-green-100/70' : ''
                  }`}
                  onClick={() => onSublessonSelect?.(selectedSublessonId === sublesson.id ? null : sublesson.id)}
                >
                  <td className="px-3 py-2 text-gray-700">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      {sublesson.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {sublesson.title}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-md">
                    <span className="line-clamp-2">{sublesson.description || '-'}</span>
                  </td>
                  <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                      variant="flat"
                      onPress={() => handleEdit(sublesson)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingSublesson ? 'Editar Sublección' : 'Nueva Sublección'}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <Chip color="danger" variant="flat" className="mb-4">
                {errors.general}
              </Chip>
            )}
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título de la sublección"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                isRequired
                isInvalid={!!errors.title}
                errorMessage={errors.title}
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
                onChange={(e) => {
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 });
                  if (errors.order) setErrors({ ...errors, order: '' });
                }}
                isRequired
                isInvalid={!!errors.order}
                errorMessage={errors.order}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={saving}>
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      order: lessons.length + 1
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const handleEdit = (lesson: LessonData) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'El orden debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const url = editingLesson
        ? `${API_BASE_URL}/courses/${courseId}/lessons/${editingLesson.id}`
        : `${API_BASE_URL}/courses/${courseId}/lessons`;

      const method = editingLesson ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const savedLesson = await response.json();

      if (editingLesson) {
        // Update existing lesson
        const updatedLessons = lessons.map(l =>
          l.id === editingLesson.id ? savedLesson : l
        );
        onLessonsChange(updatedLessons.sort((a, b) => a.order - b.order));
        setSuccessMessage('Lección actualizada exitosamente');
      } else {
        // Add new lesson
        onLessonsChange([...lessons, savedLesson].sort((a, b) => a.order - b.order));
        setSuccessMessage('Lección creada exitosamente');
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando lecciones...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 2xl:ml-30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Lecciones del Curso</h2>
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
            onPress={handleCreate}
            size="sm"
          >
            + Nueva Lección
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex-shrink-0 mb-3">
          <Chip color="success" variant="flat">
            {successMessage}
          </Chip>
        </div>
      )}

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
            <p className="text-center text-gray-500 py-4 2xl:ml-30">
              No hay lecciones. Crea una nueva lección para comenzar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg bg-white shadow-md border border-gray-200 2xl:ml-30">
          <table className="min-w-full bg-white 2xl:text-base text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Descripción</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lessons.map((lesson) => (
                <Fragment key={lesson.id}>
                  <tr
                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                      selectedLessonId === lesson.id ? 'bg-blue-100/70' : ''
                    }`}
                    onClick={() => onLessonSelect(selectedLessonId === lesson.id ? null : lesson.id)}
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
                    <td className="px-3 py-2 text-gray-600 max-w-md">
                      <span className="line-clamp-2">{lesson.description || '-'}</span>
                    </td>
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className="bg-warning-50 text-sm 2xl:text-base text-warning-600 hover:bg-warning-100"
                        variant="flat"
                        onPress={() => handleEdit(lesson)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                  {selectedLessonId === lesson.id && (
                    <tr>
                      <td colSpan={4} className="px-0 py-0 bg-gray-50">
                        <div className="px-6 py-4">
                          <SublessonSection
                            lessonId={selectedLessonId}
                            onSublessonSelect={onSublessonSelect}
                            selectedSublessonId={selectedSublessonId}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <Chip color="danger" variant="flat" className="mb-4">
                {errors.general}
              </Chip>
            )}
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título de la lección"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                isRequired
                isInvalid={!!errors.title}
                errorMessage={errors.title}
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
                onChange={(e) => {
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 });
                  if (errors.order) setErrors({ ...errors, order: '' });
                }}
                isRequired
                isInvalid={!!errors.order}
                errorMessage={errors.order}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={saving}>
              {editingLesson ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}