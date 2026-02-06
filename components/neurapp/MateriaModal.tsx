'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, addToast } from "@heroui/react";
import { MateriaData, API_BASE_URL, generateSlug, notifyMateriasUpdated } from "@/app/hooks/neurapp/useMaterias";

interface MateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materia: { type: 'create' | 'edit'; data: MateriaData | null };
}

export default function MateriaModal({ isOpen, onClose, materia }: MateriaModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (materia.type === 'edit' && materia.data) {
      setTitle(materia.data.title);
    } else {
      setTitle('');
    }
    setErrors({});
  }, [materia, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'El nombre es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const url = materia.type === 'edit' && materia.data
        ? `${API_BASE_URL}/courses/${materia.data.id}`
        : `${API_BASE_URL}/courses`;

      const method = materia.type === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch { /* usar mensaje original */ }
        throw new Error(errorMessage);
      }

      addToast({
        title: materia.type === 'edit' ? 'Materia actualizada exitosamente' : 'Materia creada exitosamente',
        color: 'success',
      });

      notifyMateriasUpdated();
      onClose();

      // Redirect to materia (new slug) after create or edit
      const newSlug = generateSlug(title.trim());
      const oldSlug = materia.data ? generateSlug(materia.data.title) : null;

      if (materia.type === 'create' || newSlug !== oldSlug) {
        router.push(`/neurapp/${newSlug}`);
      }
    } catch (error) {
      console.error('Error saving materia:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
      setErrors({ general: errorMessage });
      addToast({ title: 'Error', description: errorMessage, color: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          {materia.type === 'edit' ? 'Editar Materia' : 'Nueva Materia'}
        </ModalHeader>
        <ModalBody>
          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}
          <Input
            label="Nombre"
            placeholder="Nombre de la materia"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            isRequired
            isInvalid={!!errors.title}
            errorMessage={errors.title}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={saving}>
            {materia.type === 'edit' ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
