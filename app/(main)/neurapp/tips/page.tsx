'use client';

import { useState } from "react";
import { Card, CardBody, Button, Modal, ModalContent, ModalBody, ModalFooter, addToast } from "@heroui/react";
import { FaPlus, FaPencilAlt, FaTrash, FaEye } from "react-icons/fa";
import useTips, { TipData } from "@/app/hooks/neurapp/useTips";
import TipModal from "@/components/neurapp/TipModal";
import DeleteModal from "@/components/shared/DeleteModal";
import { neuremyFetch } from "@/lib/neuremy-api";

export default function TipsPage() {
    const { tips, loading, error, setTips } = useTips();

    const [tipModal, setTipModal] = useState<{ isOpen: boolean; tip: { type: 'create' | 'edit'; data: TipData | null } }>({
        isOpen: false,
        tip: { type: 'create', data: null },
    });

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tip: TipData | null }>({
        isOpen: false,
        tip: null,
    });

    const [previewTip, setPreviewTip] = useState<TipData | null>(null);

    const openCreateModal = () => setTipModal({ isOpen: true, tip: { type: 'create', data: null } });
    const openEditModal = (tip: TipData) => setTipModal({ isOpen: true, tip: { type: 'edit', data: tip } });
    const closeModal = () => setTipModal(prev => ({ ...prev, isOpen: false }));

    const openDeleteModal = (tip: TipData) => setDeleteModal({ isOpen: true, tip });
    const closeDeleteModal = () => setDeleteModal({ isOpen: false, tip: null });

    const handleSave = (saved: TipData) => {
        setTips(prev => {
            const exists = prev.find(t => t.id === saved.id);
            if (exists) return prev.map(t => t.id === saved.id ? { ...t, ...saved } : t);
            return [...prev, saved];
        });
    };

    const handleDelete = async () => {
        if (!deleteModal.tip) return;
        try {
            const response = await neuremyFetch(`/tips/${deleteModal.tip.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            setTips(prev => prev.filter(t => t.id !== deleteModal.tip!.id));
            addToast({ title: 'Tip eliminado exitosamente', color: 'success' });
            closeDeleteModal();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Error al eliminar';
            addToast({ title: 'Error', description: msg, color: 'danger' });
        }
    };

    return (
        <div className="flex w-full flex-col px-4">
            <div className="mt-4">
                <div className="mb-6 2xl:ml-40 flex items-start justify-between 2xl:pr-40">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Tips</h1>
                        <p className="text-gray-600 mt-2">
                            {loading ? 'Cargando...' : `Total: ${tips.length} tip${tips.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<FaPlus />}
                        onPress={openCreateModal}
                    >
                        Nuevo Tip
                    </Button>
                </div>

                <div className="2xl:mx-40">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Cargando tips...</p>
                    ) : error ? (
                        <Card className="shadow-lg">
                            <CardBody className="gap-4 text-center py-8">
                                <h2 className="text-xl font-bold text-gray-800">Error al cargar tips</h2>
                                <p className="text-red-500">{error}</p>
                            </CardBody>
                        </Card>
                    ) : tips.length === 0 ? (
                        <Card className="shadow-lg">
                            <CardBody className="text-center py-12">
                                <p className="text-gray-500 text-lg">No hay tips registrados</p>
                                <p className="text-gray-400 text-sm mt-1">Crea el primero con el botón &quot;Nuevo Tip&quot;</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <Card className="shadow-lg">
                            <CardBody className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 bg-gray-50/50 w-8">#</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 bg-gray-50/50">Título</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 bg-gray-50/50">Contenido</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 bg-gray-50/50">Creado</th>
                                                <th className="px-6 py-4 bg-gray-50/50"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {tips.map((tip, index) => (
                                                <tr key={tip.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-900">{tip.title}</span>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-sm">
                                                        <p className="text-sm text-gray-600 truncate">{tip.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                        {new Date(tip.createdAt).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="default"
                                                                isIconOnly
                                                                onPress={() => setPreviewTip(tip)}
                                                            >
                                                                <FaEye className="text-sm" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="primary"
                                                                isIconOnly
                                                                onPress={() => openEditModal(tip)}
                                                            >
                                                                <FaPencilAlt className="text-sm" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="danger"
                                                                isIconOnly
                                                                onPress={() => openDeleteModal(tip)}
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            <TipModal
                isOpen={tipModal.isOpen}
                onClose={closeModal}
                tip={tipModal.tip}
                onSave={handleSave}
            />

            {deleteModal.tip && (
                <DeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onClick={handleDelete}
                    dataType="tip"
                    dataName={deleteModal.tip.title}
                />
            )}

            <Modal
                isOpen={!!previewTip}
                onClose={() => setPreviewTip(null)}
                size="md"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="p-0 overflow-hidden">
                                {previewTip?.url && previewTip.url.length > 0 && (
                                    <div className={`grid gap-0.5 ${previewTip.url.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                        {previewTip.url.map((imgUrl, i) => (
                                            <img
                                                key={i}
                                                src={imgUrl}
                                                alt={`${previewTip.title} ${i + 1}`}
                                                className="w-full object-cover max-h-48"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="px-6 py-5 space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">{previewTip?.title}</h2>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {previewTip?.description}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {previewTip?.createdAt && new Date(previewTip.createdAt).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
