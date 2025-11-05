import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast
} from "@heroui/react";

import { QuestionData } from "@/interfaces/topoquizz";
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"

interface DeleteQuestionModalProps {
  isModalOpenState: boolean,
  handleCloseModalMethod: () => void,
  selectedQuestion: QuestionData | null,
}

const DeleteQuestionModal: React.FC<DeleteQuestionModalProps> = ({
  isModalOpenState,
  handleCloseModalMethod,
  selectedQuestion,
}) => {

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    try {
      const questionRef = doc(db, "questions", selectedQuestion.id)
      await deleteDoc(questionRef)

      addToast({
        title: "Pregunta eliminada",
        description: `La pregunta "${selectedQuestion.question}" ha sido eliminada exitosamente`,
        color: "success"
      })

      handleCloseModalMethod()
    } catch (error) {
      console.error('Error al eliminar pregunta:', error)
      addToast({
        title: "Error",
        description: "No se pudo eliminar la pregunta",
        color: "danger"
      })
    }
  }

  return (
    <Modal
      isOpen={isModalOpenState}
      onClose={handleCloseModalMethod}
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Confirmar eliminación
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción <strong>no se puede deshacer</strong>.
            </p>
            {selectedQuestion && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-sm mb-2">Pregunta a eliminar:</p>
                <p className="text-sm text-gray-700">{selectedQuestion.question}</p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleCloseModalMethod}>
            Cancelar
          </Button>
          <Button color="danger" onPress={handleDeleteQuestion}>
            Eliminar pregunta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DeleteQuestionModal;
