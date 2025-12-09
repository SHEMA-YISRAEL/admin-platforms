import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

type ClickButton = {
    onClick: () => void;
    onClose: () => void;
    isOpen: boolean;
    dataType: string;
    dataName: string;
}

function DeleteModal ({onClick, onClose, isOpen, dataName, dataType}: ClickButton){
    return (
        <div>
            <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Eliminar {dataType}</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estas seguro que deseas eliminar el {dataType} {dataName}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" onPress={onClick}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
        </div>
    )
}

export default DeleteModal;