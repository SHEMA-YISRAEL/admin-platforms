'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, addToast } from "@heroui/react";
import { MateriaData, generateSlug, notifyMateriasUpdated } from "@/app/hooks/neurapp/useMaterias";
import { neuremyFetch } from "@/lib/neuremy-api";

interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

interface MateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materia: { type: 'create' | 'edit'; data: MateriaData | null };
}

export default function MateriaModal({ isOpen, onClose, materia }: MateriaModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [professorId, setProfessorId] = useState<string>('');
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    neuremyFetch('/professors')
      .then(r => r.json())
      .then(setProfessors)
      .catch(() => setProfessors([]));
  }, []);

  useEffect(() => {
    if (materia.type === 'edit' && materia.data) {
      setTitle(materia.data.title);
      setDescription(materia.data.description ?? '');
      setProfessorId(materia.data.professorId ?? '');
    } else {
      setTitle('');
      setDescription('');
      setProfessorId('');
    }
    setErrors({});
  }, [materia, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'El nombre es requerido';
    }
    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const path = materia.type === 'edit' && materia.data
        ? `/courses/${materia.data.id}`
        : `/courses`;

      const method = materia.type === 'edit' ? 'PATCH' : 'POST';

      const response = await neuremyFetch(path, {
        method,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          ...(professorId ? { professorId } : {}),
        }),
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
          <Textarea
            label="Descripción"
            placeholder="Descripción de la materia"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            isRequired
            isInvalid={!!errors.description}
            errorMessage={errors.description}
            minRows={3}
          />
          <Select
            label="Docente"
            placeholder="Seleccionar docente"
            selectedKeys={professorId ? new Set([professorId]) : new Set()}
            onSelectionChange={(keys) => setProfessorId(Array.from(keys)[0] as string ?? '')}
          >
            {professors.map((p) => (
              <SelectItem key={p.id}>
                {`${p.firstName} ${p.lastName}`}
              </SelectItem>
            ))}
          </Select>
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
