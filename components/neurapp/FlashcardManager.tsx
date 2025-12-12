'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Select, SelectItem } from "@heroui/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, PhotoIcon } from "@heroicons/react/24/outline";
import useFlashcards, { FlashcardData } from "@/app/hooks/neurapp/useFlashcards";
import FileUploader from "./FileUploader";
import DeleteModal from "../shared/DeleteModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Available languages
const AVAILABLE_LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

interface FlashcardManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
  triggerCreate?: number;
}

export default function FlashcardManager({ type, id, triggerCreate }: FlashcardManagerProps) {
  const { flashcards, loading, setFlashcards } = useFlashcards(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    obverse_side_url: '',
    reverse_side_url: '',
    description: '',
    locale: 'es'
  });
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();
  const [deletingFlashCard, setDeletingFlashCard] = useState<FlashcardData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedSide, setCopiedSide] = useState<'obverse' | 'reverse' | null>(null);
  const prevTriggerCreate = useRef<number | undefined>(undefined);

  const handleCreate = () => {
    setEditingFlashcard(null);
    setFormData({
      title: '',
      obverse_side_url: '',
      reverse_side_url: '',
      description: '',
      locale: 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  useEffect(() => {
    // If the first time it mounts, just save the value without executing
    if (prevTriggerCreate.current === undefined) {
      prevTriggerCreate.current = triggerCreate || 0;
      return;
    }

    // Only execute when triggerCreate changes and is greater than 0
    if (triggerCreate && triggerCreate > 0 && triggerCreate !== prevTriggerCreate.current) {
      prevTriggerCreate.current = triggerCreate;
      handleCreate();
    }
  }, [triggerCreate]);

  const handleEdit = (flashcard: FlashcardData) => {
    setEditingFlashcard(flashcard);
    setFormData({
      title: flashcard.title || '',
      obverse_side_url: flashcard.obverse_side_url,
      reverse_side_url: flashcard.reverse_side_url,
      description: flashcard.description || '',
      locale: flashcard.locale
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const openDeleteModal = (flashCard: FlashcardData) => {
    setDeletingFlashCard(flashCard);
    onOpenDeleteModal();
  }

  const handleDelete = async () => {
    if (!deletingFlashCard) return;

    try {
      // Delete from backend (backend handles S3 deletion internally)
      const backendResponse = await fetch(`${API_BASE_URL}/flashcards/${deletingFlashCard.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deletingFlashCard.id }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Error al eliminar flashcard: ${errorText}`);
      }

      // Update local state
      const updatedFlashCards = flashcards.filter(f => f.id !== deletingFlashCard.id);
      setFlashcards(updatedFlashCards);
      setSuccessMessage('Flashcard eliminada exitosamente');

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al eliminar' });
    }
    onCloseDeleteModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyUrl = async (flashcardId: number, url: string, side: 'obverse' | 'reverse') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(flashcardId);
      setCopiedSide(side);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedSide(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
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
            <thead className="bg-gradient-to-r from-purple-400 to-purple-500 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Descripción</th>
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
                  <td className="px-3 py-2 text-center">
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                      {flashcard.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {flashcard.title || '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                    {flashcard.description || '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {flashcard.locale}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        onPress={() => window.open(flashcard.obverse_side_url, '_blank')}
                        title="Ver anverso"
                      >
                        <PhotoIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className={copiedId === flashcard.id && copiedSide === 'obverse' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}
                        onPress={() => handleCopyUrl(flashcard.id, flashcard.obverse_side_url, 'obverse')}
                        title={copiedId === flashcard.id && copiedSide === 'obverse' ? "¡Copiado!" : "Copiar URL Anverso"}
                      >
                        {copiedId === flashcard.id && copiedSide === 'obverse' ? (
                          <ClipboardDocumentCheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        onPress={() => window.open(flashcard.reverse_side_url, '_blank')}
                        title="Ver reverso"
                      >
                        <PhotoIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className={copiedId === flashcard.id && copiedSide === 'reverse' ? "bg-green-50 text-green-600" : "bg-pink-50 text-pink-600 hover:bg-pink-100"}
                        onPress={() => handleCopyUrl(flashcard.id, flashcard.reverse_side_url, 'reverse')}
                        title={copiedId === flashcard.id && copiedSide === 'reverse' ? "¡Copiado!" : "Copiar URL Reverso"}
                      >
                        {copiedId === flashcard.id && copiedSide === 'reverse' ? (
                          <ClipboardDocumentCheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                        variant="flat"
                        onPress={() => handleEdit(flashcard)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => openDeleteModal(flashcard)}
                      >
                        Borrar
                      </Button>
                    </div>
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
              <Input
                label="Título"
                placeholder="Título de la flashcard"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                isRequired
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />

              <Input
                label="Descripción"
                placeholder="Descripción de la flashcard (opcional)"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
              />

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
                isReadOnly
                isInvalid={!!errors.obverse_side_url}
                errorMessage={errors.obverse_side_url}
                description="La URL se genera automáticamente al subir el archivo"
                classNames={{
                  input: "bg-gray-50 cursor-not-allowed"
                }}
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
                isReadOnly
                isInvalid={!!errors.reverse_side_url}
                errorMessage={errors.reverse_side_url}
                description="La URL se genera automáticamente al subir el archivo"
                classNames={{
                  input: "bg-gray-50 cursor-not-allowed"
                }}
              />

              <Select
                label="Idioma"
                placeholder="Selecciona un idioma"
                selectedKeys={[formData.locale]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, locale: selected });
                }}
                isRequired
                isInvalid={!!errors.locale}
                errorMessage={errors.locale}
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </Select>
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

      <DeleteModal onClick={handleDelete}
        onClose={onCloseDeleteModal}
        isOpen={isOpenDeleteModal}
        dataName=''
        dataType={'flashcard'}>
      </DeleteModal>
    </div>
  );
}
