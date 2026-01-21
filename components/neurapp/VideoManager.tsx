'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Select, SelectItem } from "@heroui/react";
import { PlayIcon } from "@heroicons/react/24/outline";
import useVideos, { VideoData } from "@/app/hooks/neurapp/useVideos";
import FileUploader from "./FileUploader";
import DeleteModal from "../shared/DeleteModal";
import UploadCancelWarningModal from "./UploadCancelWarningModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Available languages
const AVAILABLE_LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

// Helper function to format size in MB
const formatSize = (mb: number | null | undefined): string => {
  if (!mb || mb <= 0) return '-';
  return `${mb.toFixed(2)} MB`;
};

// Helper function to format duration in HH:MM:SS
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '-';
  const sec = Math.floor(seconds % 60);
  const min = Math.floor((seconds / 60) % 60);
  const hour = Math.floor(seconds / 3600);

  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(hour)}:${pad(min)}:${pad(sec)}`;
};

interface VideoManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
  triggerCreate?: number;
}

export default function VideoManager({ type, id, triggerCreate }: VideoManagerProps) {
  const { videos, loading, setVideos } = useVideos(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();
  const {
    isOpen: isOpenCancelWarning,
    onOpen: onOpenCancelWarning,
    onClose: onCloseCancelWarning
  } = useDisclosure();
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    duration: '',
    size: '',
    locale: 'es'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const prevTriggerCreate = useRef<number | undefined>(undefined);

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      description: '',
      duration: '',
      size: '',
      locale: 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    setIsUploading(false);
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

  const handleEdit = (video: VideoData) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description || '',
      duration: video.duration?.toString() || '',
      size: video.size?.toString() || '',
      locale: video.locale || 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const openDeleteModal = (video: VideoData) => {
    setDeletingVideo(video);
    onOpenDeleteModal();
  }

  const deleteVideoByUrl = async (videoUrl: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/delete/url`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el video por url');
      }

    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al eliminar video por url'});
    }
  }


  const handleDelete = async () => {
    if (!deletingVideo) return;

    try {
      // Delete from backend (which now handles S3 deletion internally)
      const backendResponse = await fetch(`${API_BASE_URL}/videos/${deletingVideo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(errorText || 'Error al eliminar video');
      }

      // Update local state
      const updatedVideos = videos.filter(v => v.id !== deletingVideo.id);
      setVideos(updatedVideos);
      setSuccessMessage('Video eliminado exitosamente');

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('Error deleting video:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al eliminar' });
    }
    onCloseDeleteModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Debes cargar un archivo de video';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelClick = () => {
    if (isUploading || formData.url) {
      onOpenCancelWarning();
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = async () => {
    onCloseCancelWarning();
    if (formData.url && !editingVideo) {
      await deleteVideoByUrl(formData.url);
    }
    setIsUploading(false);
    onClose();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const baseUrl = type === 'lesson'
        ? `${API_BASE_URL}/lessons/${id}/videos`
        : `${API_BASE_URL}/sublessons/${id}/videos`;

      const url = editingVideo ? `${baseUrl}/${editingVideo.id}` : baseUrl;
      const method = editingVideo ? 'PATCH' : 'POST';

      const payload = {
        title: formData.title,
        url: formData.url,
        description: formData.description || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        size: formData.size ? parseFloat(formData.size) : null,
        locale: formData.locale
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(`Error ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const savedVideo = await response.json();

      if (editingVideo) {
        const updatedVideos = videos.map(v =>
          v.id === editingVideo.id ? savedVideo : v
        );
        setVideos(updatedVideos);
        setSuccessMessage('Video actualizado exitosamente');
      } else {
        setVideos([...videos, savedVideo]);
        setSuccessMessage('Video creado exitosamente');
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      console.error('Error saving video:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando videos...</div>;
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

      {/* Tabla de videos */}
      {videos.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay videos. Agrega un nuevo video.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg bg-white shadow-sm border border-gray-200">
          <table className="min-w-full bg-white text-xs">
            <thead className="bg-gradient-to-r from-red-400 to-red-500 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">#</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Descripción</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Duración</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Tamaño</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Idioma</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="hover:bg-red-50/50 transition-colors"
                >
                  <td className="px-3 py-2 text-center">
                    <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                      {video.order}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {video.title}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                    {video.description || '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {formatDuration(video.duration)}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    <Chip size="sm" color="primary" variant="flat">
                      {formatSize(video.size)}
                    </Chip>  
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {video.locale || 'es'}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        onPress={() => window.open(video.url, '_blank')}
                        title="Ver video"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-warning-50 text-warning-600 hover:bg-warning-100"
                        variant="flat"
                        onPress={() => handleEdit(video)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => openDeleteModal(video)}
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

      <Modal isOpen={isOpen} onClose={handleCancelClick} size="2xl" isDismissable={false}>
        <ModalContent>
          <ModalHeader>
            {editingVideo ? 'Editar Video' : 'Nuevo Video'}
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
                placeholder="Título del video"
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
                placeholder="Descripción del video (opcional)"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                isInvalid={!!errors.description}
                errorMessage={errors.description}
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
              

              <div className="space-y-2">
                <label className="text-sm font-medium">Video</label>
                <FileUploader
                  folder="neurapp/videos/uploads"
                  acceptedFileTypes="video/*"
                  maxSizeMB={2048}
                  onUploadComplete={(fileUrl, fileName, fileSize, duration) => {
                    setFormData({
                      ...formData,
                      url: fileUrl,
                      size: fileSize ? fileSize.toFixed(2) : '',
                      duration: duration ? duration.toString() : ''
                    });
                    if (errors.url) setErrors({ ...errors, url: '' });
                  }}
                  onUploadingChange={setIsUploading}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCancelClick} isDisabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={saving}>
              {editingVideo ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteModal onClick={handleDelete}
        onClose={onCloseDeleteModal}
        isOpen={isOpenDeleteModal}
        dataName={deletingVideo ? deletingVideo.title : ''}
        dataType={'video'}>
      </DeleteModal>

      <UploadCancelWarningModal
        isOpen={isOpenCancelWarning}
        onClose={onCloseCancelWarning}
        onConfirmCancel={handleConfirmCancel}
        isUploading={isUploading}
        resourceType="video"
      />
    </div>
  );
}
