'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import useSummaries, { SummaryData } from "@/app/hooks/neurapp/useSummaries";
import FileUploader from "./FileUploader";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingSummary(null);
    setFormData({
      title: '',
      urlFile: '',
      locale: 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const handleEdit = (summary: SummaryData) => {
    setEditingSummary(summary);
    setFormData({
      title: summary.title,
      urlFile: summary.urlFile,
      locale: summary.locale
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.urlFile.trim()) {
      newErrors.urlFile = 'La URL del archivo es requerida';
    }

    if (!formData.locale.trim()) {
      newErrors.locale = 'El idioma es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyUrl = async (summaryId: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(summaryId);
      setTimeout(() => setCopiedId(null), 2000);
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
        ? `${API_BASE_URL}/lessons/${id}/summaries`
        : `${API_BASE_URL}/sublessons/${id}/summaries`;

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
        const errorText = await response.text();
        console.error('API Error:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const savedSummary = await response.json();

      if (editingSummary) {
        const updatedSummaries = summaries.map(s =>
          s.id === editingSummary.id ? savedSummary : s
        );
        setSummaries(updatedSummaries);
        setSuccessMessage('Resumen actualizado exitosamente');
      } else {
        setSummaries([...summaries, savedSummary]);
        setSuccessMessage('Resumen creado exitosamente');
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      console.error('Error saving summary:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando resúmenes...</div>;
  }

  return (
    <div className="h-full flex flex-col mt-4">
      {/* Header */}
        <div className="flex items-end justify-end p-3 mb-2">
          <Button
            className="bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-sm"
            onPress={handleCreate}
            size="sm"
          >
            + Nuevo Resumen
          </Button>
        </div>

      {successMessage && (
        <div className="flex-shrink-0 mb-3">
          <Chip color="success" variant="flat">
            {successMessage}
          </Chip>
        </div>
      )}

      {/* Tabla de resúmenes */}
      {summaries.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay resúmenes. Agrega un nuevo resumen.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs">
            <thead className="bg-gradient-to-r from-teal-400 to-teal-500 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">URL Archivo</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Idioma</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map((summary) => (
                <tr
                  key={summary.id}
                  className="hover:bg-teal-50/50 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {summary.title}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className={copiedId === summary.id ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}
                      onPress={() => handleCopyUrl(summary.id, summary.urlFile)}
                      title={copiedId === summary.id ? "¡Copiado!" : "Copiar URL"}
                    >
                      {copiedId === summary.id ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {summary.locale}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                      variant="flat"
                      onPress={() => handleEdit(summary)}
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
            {editingSummary ? 'Editar Resumen' : 'Nuevo Resumen'}
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
                placeholder="Título del resumen"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                isRequired
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Archivo del Resumen</label>
                <FileUploader
                  folder="neurapp/summaries"
                  acceptedFileTypes=".pdf,.doc,.docx,.txt"
                  maxSizeMB={50}
                  onUploadComplete={(fileUrl) => {
                    setFormData({ ...formData, urlFile: fileUrl });
                    if (errors.urlFile) setErrors({ ...errors, urlFile: '' });
                  }}
                />
              </div>

              <Input
                label="URL del Archivo"
                placeholder="URL del archivo del resumen (generada automáticamente)"
                value={formData.urlFile}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, urlFile: e.target.value });
                  if (errors.urlFile) setErrors({ ...errors, urlFile: '' });
                }}
                isRequired
                isInvalid={!!errors.urlFile}
                errorMessage={errors.urlFile}
                description="La URL se generará automáticamente al subir el archivo"
              />

              <Input
                label="Idioma"
                placeholder="Código de idioma (ej: es, en)"
                value={formData.locale}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              {editingSummary ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
