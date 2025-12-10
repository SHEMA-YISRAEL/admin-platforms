'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import useVideos, { VideoData } from "@/app/hooks/neurapp/useVideos";
import FileUploader from "./FileUploader";
import DeleteModal from "../shared/DeleteModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VideoManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
}

export default function VideoManager({ type, id }: VideoManagerProps) {
  const { videos, loading, setVideos } = useVideos(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal
  } = useDisclosure();
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    duration: '',
    locale: 'es'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      duration: '',
      locale: 'es'
    });
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const handleEdit = (video: VideoData) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      duration: video.duration?.toString() || '',
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
      newErrors.url = 'La URL es requerida';
    }

    if (!formData.locale.trim()) {
      newErrors.locale = 'El idioma es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyUrl = async (videoId: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(videoId);
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
        ? `${API_BASE_URL}/lessons/${id}/videos`
        : `${API_BASE_URL}/sublessons/${id}/videos`;

      const url = editingVideo ? `${baseUrl}/${editingVideo.id}` : baseUrl;
      const method = editingVideo ? 'PATCH' : 'POST';

      const payload = {
        title: formData.title,
        url: formData.url,
        duration: formData.duration ? parseInt(formData.duration) : null,
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
      {/* Header */}
      <div className="flex items-end justify-end p-3 mb-2">
        <Button
          className="bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm"
          onPress={handleCreate}
          size="sm"
        >
          + Nuevo Video
        </Button>
      </div>

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
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">URL Video</th>
                <th className="px-3 py-2 text-center uppercase tracking-tight font-semibold">Duración</th>
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
                  <td className="px-3 py-2 text-gray-700 font-medium max-w-xs">
                    {video.title}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      variant="flat"
                      isIconOnly
                      className={copiedId === video.id ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}
                      onPress={() => handleCopyUrl(video.id, video.url)}
                      title={copiedId === video.id ? "¡Copiado!" : "Copiar URL"}
                    >
                      {copiedId === video.id ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {video.duration ? `${video.duration}s` : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Chip size="sm" color="default" variant="flat">
                      {video.locale || 'es'}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-center">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Video</label>
                <FileUploader
                  folder="neurapp/videos"
                  acceptedFileTypes="video/*"
                  maxSizeMB={500}
                  onUploadComplete={(fileUrl) => {
                    setFormData({ ...formData, url: fileUrl });
                    if (errors.url) setErrors({ ...errors, url: '' });
                  }}
                />
              </div>

              <Input
                label="URL"
                placeholder="URL del video (generada automáticamente)"
                value={formData.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, url: e.target.value });
                  if (errors.url) setErrors({ ...errors, url: '' });
                }}
                isRequired
                isInvalid={!!errors.url}
                errorMessage={errors.url}
                description="La URL se generará automáticamente al subir el archivo"
              />

              <Input
                type="number"
                label="Duración (segundos)"
                placeholder="Duración en segundos (opcional)"
                value={formData.duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
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
    </div>
  );
}
