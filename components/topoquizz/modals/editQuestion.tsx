import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Textarea,
  Select,
  SelectItem,
  Input,
  Chip,
  Switch,
  Button,
  ModalFooter,
  addToast
} from "@heroui/react";

import { QuestionData } from "@/interfaces/topoquizz";
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"


interface EditQuestionModalProps {
  isModalOpenState: boolean,
  handleCloseModalMethod: () => void,
  selectedQuestion: QuestionData | null,
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isModalOpenState,
  handleCloseModalMethod,
  selectedQuestion,
}) => {

  const [editedQuestion, setEditedQuestion] = useState<QuestionData | null>(null)

  useEffect(() => {
    if (selectedQuestion) {
      setEditedQuestion({
        ...selectedQuestion,
        options: [...selectedQuestion.options]
      })
    }
  }, [selectedQuestion])


  const handleOptionChange = (index: number, value: string) => {
    if (!editedQuestion) return
    const newOptions = [...editedQuestion.options]
    newOptions[index] = value
    setEditedQuestion({ ...editedQuestion, options: newOptions })
  }

  const handleSaveQuestion = async () => {
    if (!editedQuestion || !selectedQuestion) return

    try {

      const questionRef = doc(db, "questions", selectedQuestion.id)

      await updateDoc(questionRef, {
        question: editedQuestion.question,
        difficult: editedQuestion.difficult,
        options: editedQuestion.options,
        answer: editedQuestion.answer,
        explanation: editedQuestion.explanation,
        enable: editedQuestion.enable
      })

      addToast({
        title: "Pregunta actualizada",
        description: "La pregunta ha sido actualizada exitosamente"
      })

      handleCloseModalMethod()
    } catch (error) {
      console.error('Error al actualizar pregunta:', error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar la pregunta"
      })
    }
  }

  return (
    <Modal
      isOpen={isModalOpenState}
      onClose={handleCloseModalMethod}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Editar Pregunta
        </ModalHeader>`
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Textarea
              label="Pregunta"
              placeholder="Escribe la pregunta"
              value={editedQuestion?.question || ""}
              onChange={(e) => editedQuestion && setEditedQuestion({ ...editedQuestion, question: e.target.value })}
              minRows={2}
            />

            <Select
              label="Dificultad"
              selectedKeys={editedQuestion ? [editedQuestion.difficult.toString()] : []}
              onChange={(e) => editedQuestion && setEditedQuestion({ ...editedQuestion, difficult: parseInt(e.target.value) })}
            >
              <SelectItem key="1" textValue="1">Fácil</SelectItem>
              <SelectItem key="2" textValue="2">Medio</SelectItem>
              <SelectItem key="3" textValue="3">Difícil</SelectItem>
            </Select>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Opciones</label>
              {editedQuestion?.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    label={`Opción ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Chip
                    size="sm"
                    color={editedQuestion.answer === index ? "success" : "default"}
                    className="cursor-pointer"
                  // onPress={() => setEditedQuestion({ ...editedQuestion, answer: index })}
                  >
                    {editedQuestion.answer === index ? "Correcta" : "Marcar"}
                  </Chip>
                </div>
              ))}
            </div>

            <Textarea
              label="Explicación"
              placeholder="Escribe la explicación de la respuesta"
              value={editedQuestion?.explanation || ""}
              onChange={(e) => editedQuestion && setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
              minRows={3}
            />

            <Switch
              isSelected={editedQuestion?.enable || false}
              onValueChange={(value) => editedQuestion && setEditedQuestion({ ...editedQuestion, enable: value })}
            >
              {editedQuestion?.enable ? "Habilitada" : "Deshabilitada"}
            </Switch>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleCloseModalMethod}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSaveQuestion}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditQuestionModal;