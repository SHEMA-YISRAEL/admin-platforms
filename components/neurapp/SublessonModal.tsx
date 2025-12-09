'use client';

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Chip, addToast } from "@heroui/react";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SublessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  sublesson: { type: 'create' | 'edit', data: SublessonData | null, lessonId: number };
  sublessons: SublessonData[];
  onSublessonsChange: (sublessons: SublessonData[]) => void;
  onSave: () => void;
}

export default function SublessonModal({
  isOpen,
  onClose,
  lessonId,
  sublesson,
  sublessons,
  onSublessonsChange,
  onSave
}: SublessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: sublessons.length + 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sublesson.type === 'edit' && sublesson.data) {
      setFormData({
        title: sublesson.data.title,
        description: sublesson.data.description || '',
        order: sublesson.data.order
      });
    } else {
      setFormData({
        title: '',
        description: '',
        order: sublessons.length + 1
      });
    }
    setErrors({});
  }, [sublesson, sublessons.length, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'El orden debe ser mayor a 0';
    } else {
      // Verificar si el orden ya está en uso por otra sublección
      const orderInUse = sublessons.find(s =>
        s.order === formData.order &&
        (sublesson.type === 'create' || s.id !== sublesson.data?.id)
      );

      if (orderInUse) {
        newErrors.order = `El orden ${formData.order} ya está en uso por "${orderInUse.title}". Elige otro número o elimina/cambia primero la otra sublección.`;
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
      const url = sublesson.type === 'edit' && sublesson.data
        ? `${API_BASE_URL}/lessons/${lessonId}/sublessons/${sublesson.data.id}`
        : `${API_BASE_URL}/lessons/${lessonId}/sublessons`;

      const method = sublesson.type === 'edit' ? 'PATCH' : 'POST';

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
            errorMessage = `El orden ${formData.order} ya está en uso. Por favor, elige un número diferente o cambia primero el orden de las otras sublecciones.`;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Si no es JSON, usar el mensaje original
        }

        throw new Error(errorMessage);
      }

      const savedSublesson = await response.json();

      if (sublesson.type === 'edit') {
        const updatedSublessons = sublessons.map(s =>
          s.id === savedSublesson.id ? savedSublesson : s
        );
        onSublessonsChange(updatedSublessons.sort((a, b) => a.order - b.order));
        addToast({ title: 'Sublección actualizada exitosamente', color: 'success' });
      } else {
        onSublessonsChange([...sublessons, savedSublesson].sort((a, b) => a.order - b.order));
        addToast({ title: 'Sublección creada exitosamente', color: 'success' });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving sublesson:', error);
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
          {sublesson.type === 'edit' ? 'Editar Sublección' : 'Nueva Sublección'}
        </ModalHeader>
        <ModalBody>
          {errors.general && (
            <Chip color="danger" variant="flat">
              {errors.general}
            </Chip>
          )}

          <Input
            label="Título"
            placeholder="Título de la sublección"
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
            placeholder="Descripción de la sublección (opcional)"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
            minRows={3}
          />

          <div className="flex flex-col gap-1">
            <Input
              type="number"
              label="Orden"
              placeholder="Orden de la sublección"
              value={formData.order.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, order: parseInt(e.target.value) || 1 });
                if (errors.order) setErrors({ ...errors, order: '' });
              }}
              isRequired
              isInvalid={!!errors.order}
              errorMessage={errors.order}
              description={`Órdenes en uso: ${sublessons.filter(s => sublesson.type === 'edit' && s.id === sublesson.data?.id ? false : true).map(s => s.order).sort((a, b) => a - b).join(', ') || 'ninguno'}`}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={saving}>
            {sublesson.type === 'edit' ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
