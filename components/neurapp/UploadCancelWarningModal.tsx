'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface UploadCancelWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  isUploading: boolean;
  resourceType?: string; // e.g., "video", "imagen", "archivo"
}

export default function UploadCancelWarningModal({
  isOpen,
  onClose,
  onConfirmCancel,
  isUploading,
  resourceType = "archivo"
}: UploadCancelWarningModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          {isUploading ? `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} en proceso de subida` : `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} subido`}
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            {isUploading
              ? `Hay un ${resourceType} siendo subido actualmente. Si cancelas, se perderá el progreso de la subida.`
              : `Ya hay un ${resourceType} subido. Si cancelas, el ${resourceType} será eliminado y no se guardará.`}
          </p>
          <p className="text-gray-600 mt-2 font-medium">
            ¿Estás seguro de que deseas cancelar?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onConfirmCancel}>
            Sí, cancelar
          </Button>
          <Button color="primary" onPress={onClose}>
            Continuar editando
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
