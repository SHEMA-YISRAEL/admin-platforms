import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

type VisibilityModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    courseName: string;
    currentlyVisible: boolean;
    loading?: boolean;
}

function VisibilityModal({ isOpen, onClose, onConfirm, courseName, currentlyVisible, loading }: VisibilityModalProps) {
    const action = currentlyVisible ? "ocultar" : "hacer visible";

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xs">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Cambiar visibilidad
                        </ModalHeader>
                        <ModalBody>
                            <p>
                                ¿Estás seguro que deseas <strong>{action}</strong> el curso {`"${courseName}"`}?
                            </p>
                            <p className="text-sm text-gray-500">
                                {currentlyVisible
                                    ? "El curso dejará de ser visible para los estudiantes."
                                    : "El curso será visible para los estudiantes."}
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button color={currentlyVisible ? "warning" : "success"} onPress={onConfirm} isLoading={loading}>
                                {currentlyVisible ? "Ocultar" : "Hacer visible"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default VisibilityModal;
