'use client';

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Chip, Switch, addToast } from "@heroui/react";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";
import { neuremyFetch } from "@/lib/neuremy-api";

interface SublessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  sublesson: { type: 'create' | 'edit', data: SublessonData | null, lessonId: string };
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
    order: sublessons.length + 1,
    isFree: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sublesson.type === 'edit' && sublesson.data) {
      setFormData({
        title: sublesson.data.title,
        order: sublesson.data.order,
        isFree: sublesson.data.isFree
      });
    } else {
      setFormData({
        title: '',
        order: sublessons.length + 1,
        isFree: false
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
      const path = sublesson.type === 'edit' && sublesson.data
        ? `/lessons/${lessonId}/sublessons/${sublesson.data.id}`
        : `/lessons/${lessonId}/sublessons`;

      const method = sublesson.type === 'edit' ? 'PATCH' : 'POST';

      const response = await neuremyFetch(path, {
        method,
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

          {/* <div className="flex items-center justify-between px-1 py-2 border rounded-xl border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Acceso libre</span>
              <span className="text-xs text-gray-400">Los usuarios sin suscripción podrán acceder a esta sublección</span>
            </div>
            <Switch
              isSelected={formData.isFree}
              onValueChange={(value) => setFormData({ ...formData, isFree: value })}
              color="success"
            />
          </div> */}
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
