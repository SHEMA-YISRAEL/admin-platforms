import { useState } from "react";
import { QuestionData, QuestionTranslation } from "@/interfaces/topoquizz";
import { Button, Chip, Textarea, addToast } from "@heroui/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { MdTranslate, MdSave } from "react-icons/md";

interface TranslationCardProps {
  question: QuestionData;
  questionNumber: number;
}

const languages = [
  { code: 'en', label: 'Inglés', flag: '🇬🇧' },
  { code: 'pt', label: 'Portugués', flag: '🇧🇷' },
  { code: 'de', label: 'Alemán', flag: '🇩🇪' }
] as const;

const TranslationCard: React.FC<TranslationCardProps> = ({ question, questionNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'pt' | 'de'>('en');
  const [isSaving, setIsSaving] = useState(false);

  // Obtener la traducción existente para el idioma seleccionado
  const existingTranslation = question.translations?.find(t => t.language === selectedLanguage);

  const [translatedQuestion, setTranslatedQuestion] = useState(existingTranslation?.question || '');
  const [translatedOptions, setTranslatedOptions] = useState<string[]>(
    existingTranslation?.options || ['', '', '', '']
  );
  const [translatedExplanation, setTranslatedExplanation] = useState(existingTranslation?.explanation || '');

  // Actualizar los campos cuando cambia el idioma seleccionado
  const handleLanguageChange = (lang: 'en' | 'pt' | 'de') => {
    setSelectedLanguage(lang);
    const translation = question.translations?.find(t => t.language === lang);
    setTranslatedQuestion(translation?.question || '');
    setTranslatedOptions(translation?.options || ['', '', '', '']);
    setTranslatedExplanation(translation?.explanation || '');
  };

  const handleSaveTranslation = async () => {
    if (!translatedQuestion.trim()) {
      addToast({
        title: "Error",
        description: "La pregunta traducida no puede estar vacía"
      });
      return;
    }

    // Validar que todas las opciones estén traducidas
    if (translatedOptions.some(opt => !opt.trim())) {
      addToast({
        title: "Error",
        description: "Todas las opciones deben estar traducidas"
      });
      return;
    }

    setIsSaving(true);
    try {
      const newTranslation: QuestionTranslation = {
        language: selectedLanguage,
        question: translatedQuestion,
        options: translatedOptions,
        explanation: translatedExplanation
      };

      // Actualizar o agregar la traducción
      const existingTranslations = question.translations || [];
      const filteredTranslations = existingTranslations.filter(t => t.language !== selectedLanguage);
      const updatedTranslations = [...filteredTranslations, newTranslation];

      const questionRef = doc(db, "questions", question.id);
      await updateDoc(questionRef, {
        translations: updatedTranslations
      });

      addToast({
        title: "Traducción guardada",
        description: `Traducción al ${languages.find(l => l.code === selectedLanguage)?.label} guardada exitosamente`
      });
    } catch (error) {
      console.error('Error al guardar traducción:', error);
      addToast({
        title: "Error",
        description: "No se pudo guardar la traducción"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const difficultyConfig = {
    1: { label: "Fácil", color: "success" as const },
    2: { label: "Medio", color: "warning" as const },
    3: { label: "Difícil", color: "danger" as const }
  };

  const config = difficultyConfig[question.difficult as 1 | 2 | 3];

  // Verificar si tiene traducciones completas
  const hasTranslations = question.translations && question.translations.length > 0;
  const translationsCount = question.translations?.length || 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 cursor-pointer hover:from-amber-100 hover:to-amber-150 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-amber-900">#{questionNumber}</span>
              {config && (
                <Chip size="sm" color={config.color}>
                  {config.label}
                </Chip>
              )}
              {hasTranslations && (
                <Chip size="sm" color="primary" variant="flat">
                  <MdTranslate className="inline mr-1" />
                  {translationsCount} {translationsCount === 1 ? 'idioma' : 'idiomas'}
                </Chip>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{question.question}</p>
          </div>
          <Button
            size="sm"
            color="warning"
            variant="flat"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Traducir'}
          </Button>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Pregunta original */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">PREGUNTA ORIGINAL (Español)</h4>
            <p className="text-sm text-gray-800 mb-3">{question.question}</p>

            <h5 className="text-xs font-semibold text-gray-600 mb-1">Opciones:</h5>
            <div className="grid grid-cols-1 gap-1 mb-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    index === question.answer
                      ? 'bg-green-100 border border-green-400 font-semibold'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <span className="font-bold">{index + 1}.</span> {option}
                </div>
              ))}
            </div>

            {question.explanation && (
              <>
                <h5 className="text-xs font-semibold text-gray-600 mb-1">Explicación:</h5>
                <p className="text-xs text-gray-700">{question.explanation}</p>
              </>
            )}
          </div>

          {/* Selector de idioma */}
          <div className="flex gap-2 mb-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                size="sm"
                color={selectedLanguage === lang.code ? 'warning' : 'default'}
                variant={selectedLanguage === lang.code ? 'solid' : 'flat'}
                onPress={() => handleLanguageChange(lang.code)}
              >
                {lang.flag} {lang.label}
              </Button>
            ))}
          </div>

          {/* Formulario de traducción */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Pregunta en {languages.find(l => l.code === selectedLanguage)?.label}
              </label>
              <Textarea
                value={translatedQuestion}
                onValueChange={setTranslatedQuestion}
                placeholder={`Traduce la pregunta al ${languages.find(l => l.code === selectedLanguage)?.label.toLowerCase()}`}
                minRows={2}
                size="sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Opciones traducidas
              </label>
              <div className="space-y-2">
                {translatedOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 w-6">
                      {index + 1}.
                    </span>
                    <Textarea
                      value={option}
                      onValueChange={(value) => {
                        const newOptions = [...translatedOptions];
                        newOptions[index] = value;
                        setTranslatedOptions(newOptions);
                      }}
                      placeholder={`Opción ${index + 1}`}
                      minRows={1}
                      size="sm"
                      className="flex-1"
                    />
                    {index === question.answer && (
                      <Chip size="sm" color="success" variant="flat">
                        Correcta
                      </Chip>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Explicación en {languages.find(l => l.code === selectedLanguage)?.label}
              </label>
              <Textarea
                value={translatedExplanation}
                onValueChange={setTranslatedExplanation}
                placeholder={`Traduce la explicación al ${languages.find(l => l.code === selectedLanguage)?.label.toLowerCase()}`}
                minRows={2}
                size="sm"
              />
            </div>

            <div className="flex justify-end">
              <Button
                color="success"
                onPress={handleSaveTranslation}
                isLoading={isSaving}
                startContent={<MdSave />}
              >
                Guardar Traducción
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranslationCard;
