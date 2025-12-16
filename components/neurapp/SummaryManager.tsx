'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Select, SelectItem } from "@heroui/react";
import { DocumentTextIcon, EyeIcon } from "@heroicons/react/24/outline";
import useSummaries, { SummaryData } from "@/app/hooks/neurapp/useSummaries";
import FileUploader from "./FileUploader";
import DeleteModal from "../shared/DeleteModal";
import SummaryPreviewModal from "./SummaryPreviewModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Available languages
const AVAILABLE_LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

// Helper function to format file size
const formatFileSize = (mb: number | null | undefined): string => {
  if (!mb || mb <= 0) return '-';
  return `${mb.toFixed(2)} MB`;
};

interface SummaryManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
  triggerCreate?: number;
}

export default function SummaryManager({ type, id, triggerCreate }: SummaryManagerProps) {
  const { summaries, loading, setSummaries } = useSummaries(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSummary, setEditingSummary] = useState<SummaryData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    urlFile: '',
    description: '',
    size: null as number | null,
    locale: 'es'
  });
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();
  const [deletingSummary, setDeletingSummary] = useState<SummaryData | null>(null);
  const {
    isOpen: isPreviewOpen,
    onOpen: onOpenPreview,
    onClose: onClosePreview
  } = useDisclosure();
  const [previewSummary, setPreviewSummary] = useState<SummaryData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const prevTriggerCreate = useRef<number | undefined>(undefined);

  const handleCreate = () => {
    setEditingSummary(null);
    setFormData({
      title: '',
      urlFile: '',
      description: '',
      size: null,
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

  const handleEdit = (summary: SummaryData) => {
    setEditingSummary(summary);
    setFormData({
      title: summary.title,
      urlFile: summary.urlFile,
      description: summary.description || '',
      size: summary.size || null,
      locale: summary.locale
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const openDeleteModal = (summary: SummaryData) => {
    setDeletingSummary(summary);
    onOpenDeleteModal();
  }

  const handlePreview = (summary: SummaryData) => {
    setPreviewSummary(summary);
    onOpenPreview();
  };

  const handleDelete = async () => {
    if (!deletingSummary) return;

    try {
      // Delete from backend (backend will handle S3 deletion)
      const backendResponse = await fetch(`${API_BASE_URL}/summaries/${deletingSummary.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deletingSummary.id }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.warn('Backend deletion failed, but S3 deletion succeeded:', {
          summaryId: deletingSummary.id,
          status: backendResponse.status,
          error: errorText
        });
      }

      // Update local state
      const updatedSummaries = summaries.filter(s => s.id !== deletingSummary.id);
      setSummaries(updatedSummaries);
      setSuccessMessage('Resumen eliminado exitosamente');

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error deleting summary:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al eliminar' });
    }
    onCloseDeleteModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.urlFile.trim()) {
      newErrors.urlFile = 'Debes cargar un archivo de resumen';
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
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Descripción</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Tamaño</th>
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
                  <td className="px-3 py-2 text-center">
                    <span className="inline-block bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-semibold">
                      {summary.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {summary.title}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                    {summary.description || '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="primary" variant="flat">
                      {formatFileSize(summary.size)}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {summary.locale}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-purple-50 text-purple-600 hover:bg-purple-100"
                        onPress={() => handlePreview(summary)}
                        title="Previsualizar"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        onPress={async () => {
                          // Get signed URL before opening
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                          try {
                            const response = await fetch(`${apiUrl}/s3/signed-url`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ fileUrl: summary.urlFile }),
                            });
                            if (response.ok) {
                              const { signedUrl } = await response.json();
                              window.open(signedUrl, '_blank');
                            } else {
                              window.open(summary.urlFile, '_blank');
                            }
                          } catch {
                            window.open(summary.urlFile, '_blank');
                          }
                        }}
                        title="Abrir en nueva ventana"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                        variant="flat"
                        onPress={() => handleEdit(summary)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => openDeleteModal(summary)}
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

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isDismissable={false}>
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

              <Input
                label="Descripción"
                placeholder="Descripción del resumen (opcional)"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Archivo del Resumen</label>
                <FileUploader
                  folder="neurapp/summaries"
                  acceptedFileTypes=".pdf,.doc,.docx"
                  maxSizeMB={50}
                  onUploadComplete={(fileUrl, fileName, fileSize) => {
                    setFormData({ ...formData, urlFile: fileUrl, size: fileSize || null });
                    if (errors.urlFile) setErrors({ ...errors, urlFile: '' });
                  }}
                />
              </div>

              <Input
                label="URL del Archivo"
                placeholder="URL del archivo del resumen (generada automáticamente)"
                value={formData.urlFile}
                isReadOnly
                isInvalid={!!errors.urlFile}
                errorMessage={errors.urlFile}
                description="La URL se genera automáticamente al subir el archivo"
                classNames={{
                  input: "bg-gray-50 cursor-not-allowed"
                }}
              />

              {formData.urlFile && (
                <Button
                  color="secondary"
                  variant="flat"
                  startContent={<EyeIcon className="h-4 w-4" />}
                  onPress={() => {
                    const tempSummary: SummaryData = {
                      id: editingSummary?.id || 0,
                      title: formData.title || 'Vista Previa',
                      urlFile: formData.urlFile,
                      description: formData.description || null,
                      locale: formData.locale,
                      order: editingSummary?.order || 0,
                      createdAt: editingSummary?.createdAt || new Date().toISOString(),
                      updatedAt: editingSummary?.updatedAt || new Date().toISOString(),
                    };
                    handlePreview(tempSummary);
                  }}
                  className="w-full"
                >
                  Previsualizar Resumen
                </Button>
              )}

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
              {editingSummary ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteModal onClick={handleDelete}
        onClose={onCloseDeleteModal}
        isOpen={isOpenDeleteModal}
        dataName={deletingSummary ? deletingSummary.title : ''}
        dataType={'resumen'}>
      </DeleteModal>

      {previewSummary && (
        <SummaryPreviewModal
          isOpen={isPreviewOpen}
          onClose={onClosePreview}
          title={previewSummary.title}
          description={previewSummary.description}
          urlFile={previewSummary.urlFile}
          locale={previewSummary.locale}
        />
      )}
    </div>
  );
}
