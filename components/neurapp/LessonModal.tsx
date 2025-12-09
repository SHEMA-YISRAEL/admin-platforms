'use client';

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Chip, addToast } from "@heroui/react";
import { LessonData } from "@/app/hooks/neurapp/useLessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  lesson: { type: 'create' | 'edit', data: LessonData | null };
  lessons: LessonData[];
  onSave: (lesson: LessonData) => void;
}

export default function LessonModal({
  isOpen,
  onClose,
  courseId,
  lesson,
  lessons,
  onSave
}: LessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: lessons.length + 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson.type === 'edit' && lesson.data) {
      setFormData({
        title: lesson.data.title,
        description: lesson.data.description || '',
        order: lesson.data.order
      });
    } else {
      setFormData({
        title: '',
        description: '',
        order: lessons.length + 1
      });
    }
    setErrors({});
  }, [lesson, lessons.length, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'El orden debe ser mayor a 0';
    } else {
      // Verificar si el orden ya está en uso por otra lección
      const orderInUse = lessons.find(l =>
        l.order === formData.order &&
        (lesson.type === 'create' || l.id !== lesson.data?.id)
      );

      if (orderInUse) {
        newErrors.order = `El orden ${formData.order} ya está en uso por "${orderInUse.title}". Elige otro número o elimina/cambia primero la otra lección.`;
      }
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
      const url = lesson.type === 'edit' && lesson.data
        ? `${API_BASE_URL}/courses/${courseId}/lessons/${lesson.data.id}`
        : `${API_BASE_URL}/courses/${courseId}/lessons`;

      const method = lesson.type === 'edit' ? 'PATCH' : 'POST';

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

        // Parsear el mensaje de error del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message && errorJson.message.includes('already used')) {
            errorMessage = `El orden ${formData.order} ya está en uso. Por favor, elige un número diferente o cambia primero el orden de las otras lecciones.`;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Si no es JSON, usar el mensaje original
        }

        throw new Error(errorMessage);
      }

      const savedLesson = await response.json();

      if (lesson.type === 'edit') {
        addToast({ title: 'Lección actualizada exitosamente', color: 'success' });
      } else {
        addToast({ title: 'Lección creada exitosamente', color: 'success' });
      }

      onSave(savedLesson);
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
      setErrors({ general: errorMessage });
      addToast({ title: 'Error', description: errorMessage, color: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {lesson.type === 'edit' ? 'Editar Lección' : 'Nueva Lección'}
        </ModalHeader>
        <ModalBody>
          {errors.general && (
            <Chip color="danger" variant="flat">
              {errors.general}
            </Chip>
          )}

          <Input
            label="Título"
            placeholder="Título de la lección"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
            minRows={3}
          />

          <div className="flex flex-col gap-1">
            <Input
              type="number"
              label="Orden"
              placeholder="Orden de la lección"
              value={formData.order.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, order: parseInt(e.target.value) || 1 });
                if (errors.order) setErrors({ ...errors, order: '' });
              }}
              isRequired
              isInvalid={!!errors.order}
              errorMessage={errors.order}
              description={`Órdenes en uso: ${lessons.filter(l => lesson.type === 'edit' && l.id === lesson.data?.id ? false : true).map(l => l.order).sort((a, b) => a - b).join(', ') || 'ninguno'}`}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={saving}>
            {lesson.type === 'edit' ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
