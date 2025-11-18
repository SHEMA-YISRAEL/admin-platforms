import { useState, useMemo, useEffect } from "react";
import { QuestionData, DataQuestionTranslated } from "@/interfaces/topoquizz";
import { Button, Chip, Textarea, addToast } from "@heroui/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { MdTranslate, MdSave } from "react-icons/md";
import { LanguageCode } from "@/types/languages";
import { usePermissions } from "@/app/hooks/usePermissions";

interface TranslationCardProps {
  question: QuestionData;
  questionNumber: number;
}

const ALL_LANGUAGES = [
  { code: 'en' as const, label: 'Inglés', flag: '🇬🇧' },
  { code: 'pt' as const, label: 'Portugués', flag: '🇧🇷' },
  { code: 'de' as const, label: 'Alemán', flag: '🇩🇪' },
  { code: 'ko' as const, label: 'Coreano', flag: '🇰🇷' }
];

const TranslationCard: React.FC<TranslationCardProps> = ({ question, questionNumber }) => {
  const { translateEnglish, translateGerman, translateKorean, translatePortuguese} = usePermissions()

  // Mapeo de permisos por idioma
  const languagePermissions = useMemo(() => ({
    en: translateEnglish,
    de: translateGerman,
    ko: translateKorean,
    pt: translatePortuguese
  }), [translateEnglish, translateGerman, translateKorean, translatePortuguese]);

  // Filtrar idiomas según permisos específicos del hook usePermissions
  const allowedLanguages = useMemo(() => {
    return ALL_LANGUAGES.filter(lang => languagePermissions[lang.code]);
  }, [languagePermissions]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    allowedLanguages[0]?.code || 'en'
  );

  // Actualizar el idioma seleccionado si cambian los permisos
  useEffect(() => {
    if (allowedLanguages.length > 0 && !allowedLanguages.find(l => l.code === selectedLanguage)) {
      setSelectedLanguage(allowedLanguages[0].code);
    }
  }, [allowedLanguages, selectedLanguage]);
  const [isSaving, setIsSaving] = useState(false);

  // Obtener la traducción existente para el idioma seleccionado
  const existingTranslation = question.translations?.[selectedLanguage];

  const [translatedQuestion, setTranslatedQuestion] = useState(existingTranslation?.question || '');

  const [translatedOptions, setTranslatedOptions] = useState<string[]>(
    existingTranslation?.options || ['', '', '', '']
  );
  const [translatedExplanation, setTranslatedExplanation] = useState(existingTranslation?.explanation || '');

  // Actualizar los campos cuando cambia el idioma seleccionado
  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    const translation = question.translations?.[lang];
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
      // Crear el objeto de traducción para el idioma seleccionado
      const newTranslation: DataQuestionTranslated = {
        question: translatedQuestion,
        options: translatedOptions,
        explanation: translatedExplanation
      };

      // Actualizar solo el idioma específico en el objeto translations
      const updatedTranslations = {
        ...question.translations,
        [selectedLanguage]: newTranslation
      };

      const questionRef = doc(db, "questions", question.id);
      await updateDoc(questionRef, {
        translations: updatedTranslations
      });

      addToast({
        title: "Traducción guardada",
        description: `Traducción al ${allowedLanguages.find(l => l.code === selectedLanguage)?.label} guardada exitosamente`
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
  const translationsCount = question.translations
    ? Object.keys(question.translations).filter(key => key !== 'es').length
    : 0;
  const hasTranslations = translationsCount > 0;

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
            <p className="text-sm font-medium text-gray-800 line-clamp-2">{question.translations?.es?.question || 'Sin pregunta'}</p>
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
        <div className="flex border-t border-gray-200">
          {/* Columna izquierda: Pregunta original */}
          <div className="w-1/2 p-6 border-r border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                📖 Pregunta Original (Español)
              </h4>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-base font-medium text-gray-900 leading-relaxed">
                  {question.translations?.es?.question || 'Sin pregunta en español'}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Opciones:</h5>
                <div className="grid grid-cols-1 gap-2">
                  {(question.translations?.es?.options || []).map((option, index) => (
                    <div
                      key={index}
                      className={`text-sm px-4 py-2 rounded-lg transition-all ${
                        index === question.answer
                          ? 'bg-green-50 border-2 border-green-400 font-semibold text-green-900 shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-800'
                      }`}
                    >
                      <span className="font-bold text-base mr-2">{index + 1}.</span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              {question.translations?.es?.explanation && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    💡 Explicación:
                  </h5>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {question.translations.es.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Formulario de traducción */}
          <div className="w-1/2 p-4">
            {/* Selector de idioma */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {allowedLanguages.length === 0 ? (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  ⚠️ No tienes permisos para traducir a ningún idioma. Contacta al administrador.
                </div>
              ) : (
                allowedLanguages.map((lang) => (
                  <Button
                    key={lang.code}
                    size="sm"
                    color={selectedLanguage === lang.code ? 'warning' : 'default'}
                    variant={selectedLanguage === lang.code ? 'solid' : 'flat'}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    {lang.flag} {lang.label}
                  </Button>
                ))
              )}
            </div>

            {/* Formulario de traducción */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Pregunta en {allowedLanguages.find(l => l.code === selectedLanguage)?.label}
                </label>
                <Textarea
                  value={translatedQuestion}
                  onValueChange={setTranslatedQuestion}
                  placeholder={`Traduce la pregunta al ${allowedLanguages.find(l => l.code === selectedLanguage)?.label?.toLowerCase()}`}
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
                  Explicación en {allowedLanguages.find(l => l.code === selectedLanguage)?.label}
                </label>
                <Textarea
                  value={translatedExplanation}
                  onValueChange={setTranslatedExplanation}
                  placeholder={`Traduce la explicación al ${allowedLanguages.find(l => l.code === selectedLanguage)?.label?.toLowerCase()}`}
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
        </div>
      )}
    </div>
  );
}

export default TranslationCard;
