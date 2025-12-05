'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { SublessonData } from "@/app/hooks/neurapp/useSublessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SublessonManagerProps {
  lessonId: number;
  sublessons: SublessonData[];
  loading: boolean;
  onSublessonsChange: (sublessons: SublessonData[]) => void;
}

export default function SublessonManager({
  lessonId,
  sublessons,
  loading,
  onSublessonsChange
}: SublessonManagerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSublesson, setEditingSublesson] = useState<SublessonData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: sublessons.length + 1
  });

  const handleCreate = () => {
    setEditingSublesson(null);
    setFormData({
      title: '',
      description: '',
      order: sublessons.length + 1
    });
    onOpen();
  };

  const handleEdit = (sublesson: SublessonData) => {
    setEditingSublesson(sublesson);
    setFormData({
      title: sublesson.title,
      description: sublesson.description || '',
      order: sublesson.order
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const savedSublesson = await response.json();

      if (editingSublesson) {
        // Update existing sublesson
        const updatedSublessons = sublessons.map(s =>
          s.id === editingSublesson.id ? savedSublesson : s
        );
        onSublessonsChange(updatedSublessons.sort((a, b) => a.order - b.order));
      } else {
        // Add new sublesson
        onSublessonsChange([...sublessons, savedSublesson].sort((a, b) => a.order - b.order));
      }

      onClose();
    } catch (error) {
      console.error('Error saving sublesson:', error);
      alert('Error al guardar la sublección');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando sublecciones...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 2xl:mx-40">
        <h2 className="text-xl font-bold">Sublecciones</h2>
        <Button className="bg-blue-500 text-white text-sm" onPress={handleCreate}>
          + Nueva Sublección
        </Button>
      </div>

      {sublessons.length === 0 ? (
        <Card className="2xl:mx-40">
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay sublecciones. Crea una nueva sublección para comenzar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 2xl:mx-40">
          {sublessons.map((sublesson) => (
            <Card key={sublesson.id} isHoverable>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Orden: {sublesson.order}
                      </span>
                      <h3 className="font-bold text-lg">{sublesson.title}</h3>
                    </div>
                    {sublesson.description && (
                      <p className="text-sm text-gray-600">{sublesson.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => handleEdit(sublesson)}
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
            {editingSublesson ? 'Editar Sublección' : 'Nueva Sublección'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título de la sublección"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
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
              {editingSublesson ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}