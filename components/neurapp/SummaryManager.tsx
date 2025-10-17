'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import useSummaries, { SummaryData } from "@/app/hooks/neurapp/useSummaries";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SummaryManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
}

export default function SummaryManager({ type, id }: SummaryManagerProps) {
  const { summaries, loading, setSummaries } = useSummaries(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSummary, setEditingSummary] = useState<SummaryData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    urlFile: '',
    locale: 'es'
  });

  const handleCreate = () => {
    setEditingSummary(null);
    setFormData({
      title: '',
      urlFile: '',
      locale: 'es'
    });
    onOpen();
  };

  const handleEdit = (summary: SummaryData) => {
    setEditingSummary(summary);
    setFormData({
      title: summary.title,
      urlFile: summary.urlFile,
      locale: summary.locale
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      const baseUrl = type === 'lesson'
        ? `${API_BASE_URL}/lesson/${id}/summaries`
        : `${API_BASE_URL}/sublesson/${id}/summaries`;

      const url = editingSummary ? `${baseUrl}/${editingSummary.id}` : baseUrl;
      const method = editingSummary ? 'PATCH' : 'POST';

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

      const savedSummary = await response.json();

      if (editingSummary) {
        const updatedSummaries = summaries.map(s =>
          s.id === editingSummary.id ? savedSummary : s
        );
        setSummaries(updatedSummaries);
      } else {
        setSummaries([...summaries, savedSummary]);
      }

      onClose();
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Error al guardar el resumen');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando resúmenes...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Resúmenes</h3>
        <Button className="bg-green-600 text-white text-sm" size="sm" onPress={handleCreate}>
          + Nuevo Resumen
        </Button>
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay resúmenes. Agrega un nuevo resumen.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {summaries.map((summary) => (
            <Card key={summary.id}>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{summary.title}</h4>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {summary.locale}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{summary.urlFile}</p>
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => handleEdit(summary)}
                  >
                    Editar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingSummary ? 'Editar Resumen' : 'Nuevo Resumen'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título del resumen"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Input
                label="URL del Archivo"
                placeholder="URL del archivo del resumen"
                value={formData.urlFile}
                onChange={(e) => setFormData({ ...formData, urlFile: e.target.value })}
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
              {editingSummary ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
