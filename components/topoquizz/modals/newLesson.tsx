import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  addToast
} from "@heroui/react";

import { addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/utils/firebase"

interface NewLessonModalProps {
  isModalOpenState: boolean,
  handleCloseModalMethod: () => void,
  courseId: string,
}

const NewLessonModal: React.FC<NewLessonModalProps> = ({
  isModalOpenState,
  handleCloseModalMethod,
  courseId,
}) => {

  const [lessonName, setLessonName] = useState("")
  const [lessonSlug, setLessonSlug] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateLesson = async () => {
    // Validaciones
    if (!lessonName.trim()) {
      addToast({
        title: "Error",
        description: "El nombre de la lección es obligatorio",
        color: "danger"
      })
      return
    }

    if (!lessonSlug.trim()) {
      addToast({
        title: "Error",
        description: "El slug de la lección es obligatorio",
        color: "danger"
      })
      return
    }

    if (!courseId) {
      addToast({
        title: "Error",
        description: "Debe seleccionar una materia primero",
        color: "danger"
      })
      return
    }

    try {
      setIsCreating(true)

      await addDoc(collection(db, "lessons"), {
        name: lessonName.trim(),
        slug: lessonSlug.trim().toLowerCase(),
        courseId: courseId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      addToast({
        title: "Lección creada",
        description: `La lección "${lessonName}" ha sido creada exitosamente`,
        color: "success"
      })

      // Limpiar formulario
      setLessonName("")
      setLessonSlug("")
      handleCloseModalMethod()
    } catch (error) {
      console.error('Error al crear lección:', error)
      addToast({
        title: "Error",
        description: "No se pudo crear la lección",
        color: "danger"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setLessonName("")
      setLessonSlug("")
      handleCloseModalMethod()
    }
  }

  // Generar slug automáticamente basado en el nombre
  const handleNameChange = (value: string) => {
    setLessonName(value)
    // Auto-generar slug (convertir a minúsculas, reemplazar espacios por guiones)
    const autoSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
    setLessonSlug(autoSlug)
  }

  return (
    <Modal
      isOpen={isModalOpenState}
      onClose={handleClose}
      size="md"
      isDismissable={!isCreating}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Crear Nueva Lección
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre de la lección"
              placeholder="Ej: Introducción a la Torá"
              value={lessonName}
              onValueChange={handleNameChange}
              isRequired
              isDisabled={isCreating}
              description="El nombre que verán los usuarios"
            />

            <Input
              label="Slug (URL amigable)"
              placeholder="Ej: introduccion-a-la-tora"
              value={lessonSlug}
              onValueChange={setLessonSlug}
              isRequired
              isDisabled={isCreating}
              description="Se genera automáticamente del nombre, pero puedes editarlo"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">/</span>
                </div>
              }
            />

            {!courseId && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <p className="text-sm text-warning-700">
                  ⚠️ Debes seleccionar una materia antes de crear una lección
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleClose}
            isDisabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            color="success"
            onPress={handleCreateLesson}
            isLoading={isCreating}
            isDisabled={!courseId}
          >
            Crear Lección
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NewLessonModal;
