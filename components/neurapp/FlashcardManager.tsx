'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import useFlashcards, { FlashcardData } from "@/app/hooks/neurapp/useFlashcards";
import FileUploader from "./FileUploader";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FlashcardManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
}

export default function FlashcardManager({ type, id }: FlashcardManagerProps) {
  const { flashcards, loading, setFlashcards } = useFlashcards(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardData | null>(null);
  const [formData, setFormData] = useState({
    obverse_side_url: '',
    reverse_side_url: '',
    locale: 'es'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingFlashcard(null);
    setFormData({
      obverse_side_url: '',
      reverse_side_url: '',
      locale: 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const handleEdit = (flashcard: FlashcardData) => {
    setEditingFlashcard(flashcard);
    setFormData({
      obverse_side_url: flashcard.obverse_side_url,
      reverse_side_url: flashcard.reverse_side_url,
      locale: flashcard.locale
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.obverse_side_url.trim()) {
      newErrors.obverse_side_url = 'La imagen del anverso es requerida';
    }

    if (!formData.reverse_side_url.trim()) {
      newErrors.reverse_side_url = 'La imagen del reverso es requerida';
    }

    if (!formData.locale.trim()) {
      newErrors.locale = 'El idioma es requerido';
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
      const baseUrl = type === 'lesson'
        ? `${API_BASE_URL}/lessons/${id}/flashcards`
        : `${API_BASE_URL}/sublessons/${id}/flashcards`;

      const url = editingFlashcard ? `${baseUrl}/${editingFlashcard.id}` : baseUrl;
      const method = editingFlashcard ? 'PATCH' : 'POST';

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

      const savedFlashcard = await response.json();

      if (editingFlashcard) {
        const updatedFlashcards = flashcards.map(f =>
          f.id === editingFlashcard.id ? savedFlashcard : f
        );
        setFlashcards(updatedFlashcards);
        setSuccessMessage('Flashcard actualizada exitosamente');
      } else {
        setFlashcards([...flashcards, savedFlashcard]);
        setSuccessMessage('Flashcard creada exitosamente');
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      console.error('Error saving flashcard:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando flashcards...</div>;
  }

  return (
    <div className="h-full flex flex-col mt-4">
      {/* Header */}
      <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Flashcards</h3>
          <Button
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm"
            onPress={handleCreate}
            size="sm"
          >
            + Nueva Flashcard
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

      {/* Tabla de flashcards */}
      {flashcards.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay flashcards. Agrega una nueva flashcard.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Anverso</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Reverso</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Idioma</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flashcards.map((flashcard) => (
                <tr
                  key={flashcard.id}
                  className="hover:bg-purple-50/50 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-700 max-w-xs">
                    <span className="line-clamp-1 text-xs">{flashcard.obverse_side_url}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 max-w-xs">
                    <span className="line-clamp-1 text-xs">{flashcard.reverse_side_url}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {flashcard.locale}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                      variant="flat"
                      onPress={() => handleEdit(flashcard)}
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
            {editingFlashcard ? 'Editar Flashcard' : 'Nueva Flashcard'}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <Chip color="danger" variant="flat" className="mb-4">
                {errors.general}
              </Chip>
            )}
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagen Anverso</label>
                <FileUploader
                  folder="neurapp/flashcards"
                  acceptedFileTypes="image/*"
                  maxSizeMB={10}
                  onUploadComplete={(fileUrl) => {
                    setFormData({ ...formData, obverse_side_url: fileUrl });
                    if (errors.obverse_side_url) setErrors({ ...errors, obverse_side_url: '' });
                  }}
                />
              </div>

              <Input
                label="URL Anverso"
                placeholder="URL de la imagen del anverso (generada automáticamente)"
                value={formData.obverse_side_url}
                onChange={(e) => {
                  setFormData({ ...formData, obverse_side_url: e.target.value });
                  if (errors.obverse_side_url) setErrors({ ...errors, obverse_side_url: '' });
                }}
                isRequired
                isInvalid={!!errors.obverse_side_url}
                errorMessage={errors.obverse_side_url}
                description="La URL se generará automáticamente al subir el archivo"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Imagen Reverso</label>
                <FileUploader
                  folder="neurapp/flashcards"
                  acceptedFileTypes="image/*"
                  maxSizeMB={10}
                  onUploadComplete={(fileUrl) => {
                    setFormData({ ...formData, reverse_side_url: fileUrl });
                    if (errors.reverse_side_url) setErrors({ ...errors, reverse_side_url: '' });
                  }}
                />
              </div>

              <Input
                label="URL Reverso"
                placeholder="URL de la imagen del reverso (generada automáticamente)"
                value={formData.reverse_side_url}
                onChange={(e) => {
                  setFormData({ ...formData, reverse_side_url: e.target.value });
                  if (errors.reverse_side_url) setErrors({ ...errors, reverse_side_url: '' });
                }}
                isRequired
                isInvalid={!!errors.reverse_side_url}
                errorMessage={errors.reverse_side_url}
                description="La URL se generará automáticamente al subir el archivo"
              />

              <Input
                label="Idioma"
                placeholder="Código de idioma (ej: es, en)"
                value={formData.locale}
                onChange={(e) => {
                  setFormData({ ...formData, locale: e.target.value });
                  if (errors.locale) setErrors({ ...errors, locale: '' });
                }}
                isRequired
                isInvalid={!!errors.locale}
                errorMessage={errors.locale}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose} isDisabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={saving}>
              {editingFlashcard ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
