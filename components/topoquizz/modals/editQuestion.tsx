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
  addToast,
  Tabs,
  Tab
} from "@heroui/react";

import { QuestionData, QuestionTranslation } from "@/interfaces/topoquizz";
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"
import { AVAILABLE_LANGUAGES, LanguageCode } from "@/types/languages";


interface EditQuestionModalProps {
  isModalOpenState: boolean,
  handleCloseModalMethod: () => void,
  selectedQuestion: QuestionData | null,
}

const emptyTranslation: QuestionTranslation = {
  question: "",
  options: ["", "", "", ""],
  explanation: ""
};

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isModalOpenState,
  handleCloseModalMethod,
  selectedQuestion,
}) => {

  const [editedQuestion, setEditedQuestion] = useState<QuestionData | null>(null)
  const [currentLang, setCurrentLang] = useState<LanguageCode>('es');

  useEffect(() => {
    if (selectedQuestion) {
      setEditedQuestion({
        ...selectedQuestion,
        options: [...selectedQuestion.options],
        translations: selectedQuestion.translations || {}
      })
    }
  }, [selectedQuestion])


  const handleOptionChange = (index: number, value: string) => {
    if (!editedQuestion) return

    if (currentLang === 'es') {
      const newOptions = [...editedQuestion.options]
      newOptions[index] = value
      setEditedQuestion({ ...editedQuestion, options: newOptions })
    } else {
      const translations = { ...editedQuestion.translations };
      if (!translations[currentLang]) {
        translations[currentLang] = { ...emptyTranslation };
      }
      const newOptions = [...(translations[currentLang]?.options || ["", "", "", ""])];
      newOptions[index] = value;
      translations[currentLang] = {
        ...translations[currentLang]!,
        options: newOptions
      };
      setEditedQuestion({ ...editedQuestion, translations });
    }
  }

  const handleQuestionChange = (value: string) => {
    if (!editedQuestion) return

    if (currentLang === 'es') {
      setEditedQuestion({ ...editedQuestion, question: value });
    } else {
      const translations = { ...editedQuestion.translations };
      if (!translations[currentLang]) {
        translations[currentLang] = { ...emptyTranslation };
      }
      translations[currentLang] = {
        ...translations[currentLang]!,
        question: value
      };
      setEditedQuestion({ ...editedQuestion, translations });
    }
  };

  const handleExplanationChange = (value: string) => {
    if (!editedQuestion) return

    if (currentLang === 'es') {
      setEditedQuestion({ ...editedQuestion, explanation: value });
    } else {
      const translations = { ...editedQuestion.translations };
      if (!translations[currentLang]) {
        translations[currentLang] = { ...emptyTranslation };
      }
      translations[currentLang] = {
        ...translations[currentLang]!,
        explanation: value
      };
      setEditedQuestion({ ...editedQuestion, translations });
    }
  };

  const getCurrentContent = () => {
    if (!editedQuestion) return emptyTranslation;

    if (currentLang === 'es') {
      return {
        question: editedQuestion.question,
        options: editedQuestion.options,
        explanation: editedQuestion.explanation
      };
    }
    return editedQuestion.translations?.[currentLang] || emptyTranslation;
  };

  const currentContent = getCurrentContent();

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
        enable: editedQuestion.enable,
        translations: editedQuestion.translations || {}
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
            {/* Tabs de idiomas */}
            <Tabs
              selectedKey={currentLang}
              onSelectionChange={(key) => setCurrentLang(key as LanguageCode)}
              aria-label="Idiomas"
              color="warning"
              variant="bordered"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <Tab
                  key={lang.code}
                  title={
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  }
                />
              ))}
            </Tabs>

            {/* Contenido según idioma seleccionado */}
            <Textarea
              label="Pregunta"
              placeholder="Escribe la pregunta"
              value={currentContent.question}
              onChange={(e) => handleQuestionChange(e.target.value)}
              minRows={2}
            />

            {/* Dificultad solo en español */}
            {currentLang === 'es' && (
              <Select
                label="Dificultad"
                selectedKeys={editedQuestion ? [editedQuestion.difficult.toString()] : []}
                onChange={(e) => editedQuestion && setEditedQuestion({ ...editedQuestion, difficult: parseInt(e.target.value) })}
              >
                <SelectItem key="1" textValue="1">Fácil</SelectItem>
                <SelectItem key="2" textValue="2">Medio</SelectItem>
                <SelectItem key="3" textValue="3">Difícil</SelectItem>
              </Select>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Opciones</label>
              {currentContent.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    label={`Opción ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {currentLang === 'es' && editedQuestion && (
                    <Chip
                      size="sm"
                      color={editedQuestion.answer === index ? "success" : "default"}
                      className="cursor-pointer"
                      onClick={() => setEditedQuestion({ ...editedQuestion, answer: index })}
                    >
                      {editedQuestion.answer === index ? "Correcta" : "Marcar"}
                    </Chip>
                  )}
                </div>
              ))}
            </div>

            <Textarea
              label="Explicación"
              placeholder="Escribe la explicación de la respuesta"
              value={currentContent.explanation}
              onChange={(e) => handleExplanationChange(e.target.value)}
              minRows={3}
            />

            {/* Estado solo en español */}
            {currentLang === 'es' && (
              <Switch
                isSelected={editedQuestion?.enable || false}
                onValueChange={(value) => editedQuestion && setEditedQuestion({ ...editedQuestion, enable: value })}
              >
                {editedQuestion?.enable ? "Habilitada" : "Deshabilitada"}
              </Switch>
            )}
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