'use client';

import { useState } from "react";
import { Card, CardBody, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import useVideos, { VideoData } from "@/app/hooks/neurapp/useVideos";

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

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      duration: '',
      locale: 'es'
    });
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
    onOpen();
  };

  const handleSave = async () => {
    try {
      const baseUrl = type === 'lesson'
        ? `${API_BASE_URL}/lesson/${id}/videos`
        : `${API_BASE_URL}/sublesson/${id}/videos`;

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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const savedVideo = await response.json();

      if (editingVideo) {
        const updatedVideos = videos.map(v =>
          v.id === editingVideo.id ? savedVideo : v
        );
        setVideos(updatedVideos);
      } else {
        setVideos([...videos, savedVideo]);
      }

      onClose();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Error al guardar el video');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando videos...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Videos</h3>
        <Button className="bg-blue-500 text-white text-sm" size="sm" onPress={handleCreate}>
          + Nuevo Video
        </Button>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-500 py-4">
              No hay videos. Agrega un nuevo video.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardBody>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{video.url}</p>
                    {video.duration && (
                      <p className="text-xs text-gray-500">Duración: {video.duration}s</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => handleEdit(video)}
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
            {editingVideo ? 'Editar Video' : 'Nuevo Video'}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Título"
                placeholder="Título del video"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Input
                label="URL"
                placeholder="URL del video"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                isRequired
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
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSave}>
              {editingVideo ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
