'use client';

import { useState, useEffect } from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Textarea, Chip, addToast
} from "@heroui/react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { TipData } from "@/app/hooks/neurapp/useTips";
import { neuremyFetch } from "@/lib/neuremy-api";
import FileUploader from "@/components/neurapp/FileUploader";
import { IMAGE_FILE_TYPES } from "@/constants/file-types";

const CONTENT_MAX = 540;

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    tip: { type: 'create' | 'edit'; data: TipData | null };
    onSave: (tip: TipData) => void;
}

export default function TipModal({ isOpen, onClose, tip, onSave }: TipModalProps) {
    const [formData, setFormData] = useState({ title: '', description: '', url: [] as string[] });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploader, setShowUploader] = useState(false);
    const [newUrls, setNewUrls] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (tip.type === 'edit' && tip.data) {
            setFormData({
                title: tip.data.title,
                description: tip.data.description,
                url: tip.data.url ?? [],
            });
        } else {
            setFormData({ title: '', description: '', url: [] });
        }
        setErrors({});
        setIsUploading(false);
        setShowUploader(false);
        setNewUrls(new Set());
    }, [tip, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'El título es requerido';
        if (!formData.description.trim()) newErrors.description = 'El contenido es requerido';
        if (formData.description.length > CONTENT_MAX) newErrors.description = `Máximo ${CONTENT_MAX} caracteres`;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = () => {
        if (tip.type === 'create') {
            return { title: formData.title, description: formData.description, url: formData.url };
        }
        const original = tip.data!;
        const changed: Record<string, unknown> = {};
        if (formData.title !== original.title) changed.title = formData.title;
        if (formData.description !== original.description) changed.description = formData.description;
        const originalUrls = original.url ?? [];
        const urlsChanged =
            formData.url.length !== originalUrls.length ||
            formData.url.some((u, i) => u !== originalUrls[i]);
        if (urlsChanged) changed.url = formData.url;
        return changed;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            setSaving(true);
            const path = tip.type === 'edit' && tip.data ? `/tips/${tip.data.id}` : '/tips';
            const method = tip.type === 'edit' ? 'PATCH' : 'POST';
            const payload = buildPayload();

            if (tip.type === 'edit' && Object.keys(payload).length === 0) {
                onClose();
                return;
            }

            const response = await neuremyFetch(path, { method, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.message) errorMessage = Array.isArray(errorJson.message)
                        ? errorJson.message.join(', ')
                        : errorJson.message;
                } catch { /* not JSON */ }
                throw new Error(errorMessage);
            }

            const savedTip: TipData = await response.json();
            addToast({
                title: tip.type === 'edit' ? 'Tip actualizado exitosamente' : 'Tip creado exitosamente',
                color: 'success',
            });
            onSave(savedTip);
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
            setErrors({ general: errorMessage });
            addToast({ title: 'Error', description: errorMessage, color: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUploaded = (fileUrl: string) => {
        setFormData(prev => ({ ...prev, url: [fileUrl, ...prev.url] }));
        setNewUrls(prev => new Set(prev).add(fileUrl));
        setShowUploader(false);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, url: prev.url.filter((_, i) => i !== index) }));
    };

    const contentLength = formData.description.length;
    const isOverLimit = contentLength > CONTENT_MAX;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {tip.type === 'edit' ? 'Editar Tip' : 'Nuevo Tip'}
                </ModalHeader>
                <ModalBody>
                    {errors.general && (
                        <Chip color="danger" variant="flat" className="w-full max-w-full">
                            {errors.general}
                        </Chip>
                    )}

                    <Input
                        label="Título"
                        placeholder="Título del tip"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: '' });
                        }}
                        isRequired
                        isInvalid={!!errors.title}
                        errorMessage={errors.title}
                    />

                    <div className="flex flex-col gap-1">
                        <Textarea
                            label="Contenido"
                            placeholder="Contenido del tip"
                            value={formData.description}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length > CONTENT_MAX) return;
                                setFormData({ ...formData, description: val });
                                if (errors.description) setErrors({ ...errors, description: '' });
                            }}
                            isRequired
                            isInvalid={!!errors.description || isOverLimit}
                            errorMessage={errors.description}
                            minRows={4}
                        />
                        <div className={`text-xs text-right pr-1 ${isOverLimit ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                            {contentLength} / {CONTENT_MAX}
                        </div>
                    </div>

                    {/* Imágenes */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Imágenes
                                {formData.url.length > 0 && (
                                    <span className="ml-2 text-xs text-gray-400">({formData.url.length})</span>
                                )}
                            </label>
                            {!showUploader && (
                                <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    startContent={<FaPlus className="text-xs" />}
                                    onPress={() => setShowUploader(true)}
                                    isDisabled={isUploading}
                                >
                                    Agregar imagen
                                </Button>
                            )}
                        </div>

                        {showUploader && (
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Nueva imagen</span>
                                    <Button
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        onPress={() => setShowUploader(false)}
                                        isDisabled={isUploading}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                                <FileUploader
                                    folder="neurapp/tips"
                                    acceptedFileTypes={IMAGE_FILE_TYPES.acceptAttribute}
                                    fileTypeCategory="image"
                                    maxSizeMB={IMAGE_FILE_TYPES.maxSizeMB}
                                    onUploadComplete={handleImageUploaded}
                                    onUploadingChange={setIsUploading}
                                    onValidationError={(error) => setErrors(prev => ({ ...prev, image: error }))}
                                />
                                {errors.image && (
                                    <p className="text-tiny text-danger">{errors.image}</p>
                                )}
                            </div>
                        )}

                        {formData.url.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {formData.url.map((imgUrl, index) => (
                                    <div key={index} className="flex items-center gap-3 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                        {newUrls.has(imgUrl) ? (
                                            <div className="w-16 h-12 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs text-gray-500 font-semibold">{index + 1}</span>
                                            </div>
                                        ) : (
                                            <img
                                                src={imgUrl}
                                                alt={`Imagen ${index + 1}`}
                                                className="w-16 h-12 flex-shrink-0 object-cover"
                                            />
                                        )}
                                        <span className="flex-1 text-sm text-gray-700 truncate">
                                            {newUrls.has(imgUrl) ? `Imagen ${index + 1} (pendiente de guardar)` : `Imagen ${index + 1}`}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            isIconOnly
                                            className="mr-2"
                                            onPress={() => removeImage(index)}
                                        >
                                            <FaTrash className="text-xs" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.url.length === 0 && !showUploader && (
                            <p className="text-xs text-gray-400 text-center py-2">Sin imágenes. Usa &quot;Agregar imagen&quot; para subir.</p>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose} isDisabled={saving || isUploading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isLoading={saving}
                        isDisabled={isOverLimit || isUploading}
                    >
                        {tip.type === 'edit' ? 'Actualizar' : 'Crear'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
