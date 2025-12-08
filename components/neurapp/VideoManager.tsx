'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from "@heroui/react";
import useVideos, { VideoData } from "@/app/hooks/neurapp/useVideos";
import FileUploader from "./FileUploader";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VideoManagerProps {
  type: 'lesson' | 'sublesson';
  id: number;
}

export default function VideoManager({ type, id }: VideoManagerProps) {
  const { videos, loading, setVideos } = useVideos(type, id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    duration: '',
    locale: 'es'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Videos</h3>
          <Button
            className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
            onPress={handleCreate}
            size="sm"
          >
            + Nuevo Video
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
        <div className="rounded-lg bg-white shadow-sm border border-gray-200">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full bg-white text-xs">
            <thead className="bg-gradient-to-r from-red-500 to-red-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">Título</th>
                <th className="px-3 py-2 text-left uppercase tracking-tight font-semibold">URL</th>
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
                  <td className="px-3 py-2 text-gray-600 max-w-md">
                    <span className="line-clamp-1 text-xs">{video.url}</span>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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
                onChange={(e) => {
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
                onChange={(e) => {
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
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              {editingVideo ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
