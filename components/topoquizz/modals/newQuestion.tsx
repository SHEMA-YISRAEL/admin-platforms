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
    addToast,
    Tabs,
    Tab
} from "@heroui/react";

import { QuestionData, DataQuestionTranslated } from "@/interfaces/topoquizz";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { AVAILABLE_LANGUAGES, LanguageCode } from "@/types/languages";


interface NewQuestionModalProps {
    isModalOpenState: boolean;
    handleCloseModalMethod: () => void;
    lessonId: string;
}

const emptyQuestion: Omit<QuestionData, 'id' | 'createdAt' | 'updatedAt' | 'lessonId'> = {
    difficult: 1,
    answer: 0,
    enable: true,
    translations: {}
};

const emptyTranslation: DataQuestionTranslated = {
    question: "",
    options: ["", "", "", ""],
    explanation: ""
};

const NewQuestionModal: React.FC<NewQuestionModalProps> = ({
    isModalOpenState,
    handleCloseModalMethod,
    lessonId
}) => {

    const [newQuestion, setNewQuestion] = useState(emptyQuestion);
    const [currentLang, setCurrentLang] = useState<LanguageCode>('es');

    const handleOptionChange = (index: number, value: string) => {
        const translations = { ...newQuestion.translations };
        if (!translations[currentLang]) {
            translations[currentLang] = { ...emptyTranslation };
        }
        const newOptions = [...(translations[currentLang]?.options || ["", "", "", ""])];
        newOptions[index] = value;
        translations[currentLang] = {
            ...translations[currentLang]!,
            options: newOptions
        };
        setNewQuestion({ ...newQuestion, translations });
    };

    const handleQuestionChange = (value: string) => {
        const translations = { ...newQuestion.translations };
        if (!translations[currentLang]) {
            translations[currentLang] = { ...emptyTranslation };
        }
        translations[currentLang] = {
            ...translations[currentLang]!,
            question: value
        };
        setNewQuestion({ ...newQuestion, translations });
    };

    const handleExplanationChange = (value: string) => {
        const translations = { ...newQuestion.translations };
        if (!translations[currentLang]) {
            translations[currentLang] = { ...emptyTranslation };
        }
        translations[currentLang] = {
            ...translations[currentLang]!,
            explanation: value
        };
        setNewQuestion({ ...newQuestion, translations });
    };

    const getCurrentContent = () => {
        return newQuestion.translations?.[currentLang] || emptyTranslation;
    };

    const currentContent = getCurrentContent();

    const handleSaveQuestion = async () => {
        // Validaciones
        const esTranslation = newQuestion.translations?.es;
        if (!esTranslation?.question?.trim()) {
            addToast({
                title: "Error",
                description: "La pregunta en español no puede estar vacía"
            });
            return;
        }

        if (esTranslation.options.some((opt: string) => !opt.trim())) {
            addToast({
                title: "Error",
                description: "Todas las opciones en español deben estar completas"
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
                difficult: newQuestion.difficult,
                answer: newQuestion.answer,
                enable: newQuestion.enable,
                lessonId: lessonId,
                translations: newQuestion.translations || {},
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

                        {/* Dificultad y respuesta correcta solo en español */}
                        {currentLang === 'es' && (
                            <>
                                <Select
                                    label="Dificultad"
                                    selectedKeys={[newQuestion.difficult.toString()]}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, difficult: parseInt(e.target.value) })}
                                >
                                    <SelectItem key="1" textValue="1">Fácil</SelectItem>
                                    <SelectItem key="2" textValue="2">Medio</SelectItem>
                                    <SelectItem key="3" textValue="3">Difícil</SelectItem>
                                </Select>
                            </>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Opciones</label>
                            {currentContent.options.map((option: string, index: number) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        label={`Opción ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    {currentLang === 'es' && (
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
                                isSelected={newQuestion.enable}
                                onValueChange={(value) => setNewQuestion({ ...newQuestion, enable: value })}
                            >
                                {newQuestion.enable ? "Habilitada" : "Deshabilitada"}
                            </Switch>
                        )}
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
