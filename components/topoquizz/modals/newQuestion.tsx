import { useState } from "react";
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
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";


interface NewQuestionModalProps {
    isModalOpenState: boolean;
    handleCloseModalMethod: () => void;
    lessonId: string;
}

const emptyQuestion: Omit<QuestionData, 'id' | 'createdAt' | 'updatedAt' | 'lessonId'> = {
    question: "",
    difficult: 1,
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    enable: true
};

const NewQuestionModal: React.FC<NewQuestionModalProps> = ({
    isModalOpenState,
    handleCloseModalMethod,
    lessonId
}) => {

    const [newQuestion, setNewQuestion] = useState(emptyQuestion);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleSaveQuestion = async () => {
        // Validaciones
        if (!newQuestion.question.trim()) {
            addToast({
                title: "Error",
                description: "La pregunta no puede estar vacía"
            });
            return;
        }

        if (newQuestion.options.some(opt => !opt.trim())) {
            addToast({
                title: "Error",
                description: "Todas las opciones deben estar completas"
            });
            return;
        }

        if (!lessonId) {
            addToast({
                title: "Error",
                description: "No se ha seleccionado una lección"
            });
            return;
        }

        try {
            await addDoc(collection(db, "questions"), {
                question: newQuestion.question,
                difficult: newQuestion.difficult,
                options: newQuestion.options,
                answer: newQuestion.answer,
                explanation: newQuestion.explanation,
                enable: newQuestion.enable,
                lessonId: lessonId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            addToast({
                title: "Pregunta creada",
                description: "La pregunta ha sido creada exitosamente"
            });

            // Reset form
            setNewQuestion(emptyQuestion);
            handleCloseModalMethod();
        } catch (error) {
            console.error('Error al crear pregunta:', error);
            addToast({
                title: "Error",
                description: "No se pudo crear la pregunta"
            });
        }
    };

    return (
        <Modal
            isOpen={isModalOpenState}
            onClose={handleCloseModalMethod}
            size="3xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Nueva Pregunta
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <Textarea
                            label="Pregunta"
                            placeholder="Escribe la pregunta"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            minRows={2}
                        />

                        <Select
                            label="Dificultad"
                            selectedKeys={[newQuestion.difficult.toString()]}
                            onChange={(e) => setNewQuestion({ ...newQuestion, difficult: parseInt(e.target.value) })}
                        >
                            <SelectItem key="1" textValue="1">Fácil</SelectItem>
                            <SelectItem key="2" textValue="2">Medio</SelectItem>
                            <SelectItem key="3" textValue="3">Difícil</SelectItem>
                        </Select>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Opciones</label>
                            {newQuestion.options.map((option, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        label={`Opción ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => setNewQuestion({ ...newQuestion, answer: index })}
                                    >
                                        <Chip
                                            size="sm"
                                            color={newQuestion.answer === index ? "success" : "default"}
                                        >
                                            {newQuestion.answer === index ? "Correcta" : "Marcar"}
                                        </Chip>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Textarea
                            label="Explicación"
                            placeholder="Escribe la explicación de la respuesta"
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                            minRows={3}
                        />

                        <Switch
                            isSelected={newQuestion.enable}
                            onValueChange={(value) => setNewQuestion({ ...newQuestion, enable: value })}
                        >
                            {newQuestion.enable ? "Habilitada" : "Deshabilitada"}
                        </Switch>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={handleCloseModalMethod}>
                        Cancelar
                    </Button>
                    <Button color="primary" onPress={handleSaveQuestion}>
                        Crear Pregunta
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default NewQuestionModal;
