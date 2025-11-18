'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import useFlashcards, { FlashcardData } from "@/app/hooks/neurapp/useFlashcards";

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

  const handleCreate = () => {
    setEditingFlashcard(null);
    setFormData({
      obverse_side_url: '',
      reverse_side_url: '',
      locale: 'es'
    });
    onOpen();
  };

  const handleEdit = (flashcard: FlashcardData) => {
    setEditingFlashcard(flashcard);
    setFormData({
      obverse_side_url: flashcard.obverse_side_url,
      reverse_side_url: flashcard.reverse_side_url,
      locale: flashcard.locale
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      const baseUrl = type === 'lesson'
        ? `${API_BASE_URL}/lesson/${id}/flashcards`
        : `${API_BASE_URL}/sublesson/${id}/flashcards`; 

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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const savedFlashcard = await response.json();

      if (editingFlashcard) {
        const updatedFlashcards = flashcards.map(f =>
          f.id === editingFlashcard.id ? savedFlashcard : f
        );
        setFlashcards(updatedFlashcards);
      } else {
        setFlashcards([...flashcards, savedFlashcard]);
      }

      onClose();
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Error al guardar la flashcard');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando flashcards...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Flashcards</h3>
        <Button className="bg-blue-500 text-white text-sm" size="sm" onPress={handleCreate}>
          + Nueva Flashcard
        </Button>
      </div>

      {flashcards.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay flashcards. Agrega una nueva flashcard.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id}>
              <CardBody>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Anverso:</p>
                    <p className="text-sm truncate">{flashcard.obverse_side_url}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Reverso:</p>
                    <p className="text-sm truncate">{flashcard.reverse_side_url}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {flashcard.locale}
                    </span>
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={() => handleEdit(flashcard)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingFlashcard ? 'Editar Flashcard' : 'Nueva Flashcard'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="URL Anverso"
                placeholder="URL de la imagen del anverso"
                value={formData.obverse_side_url}
                onChange={(e) => setFormData({ ...formData, obverse_side_url: e.target.value })}
                isRequired
              />
              <Input
                label="URL Reverso"
                placeholder="URL de la imagen del reverso"
                value={formData.reverse_side_url}
                onChange={(e) => setFormData({ ...formData, reverse_side_url: e.target.value })}
                isRequired
              />
              <Input
                label="Idioma"
                placeholder="Código de idioma (ej: es, en)"
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingFlashcard ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
