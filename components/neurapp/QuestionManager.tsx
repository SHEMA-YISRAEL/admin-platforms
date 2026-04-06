'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
  Button,
  Textarea,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Select,
  SelectItem,
  Switch,
  Tabs,
  Tab,
} from '@heroui/react';
import useQuestions, {
  QuestionData,
  QuestionTranslation,
} from '@/app/hooks/neurapp/useQuestions';
import DeleteModal from '../shared/DeleteModal';
import { neuremyFetch } from '@/lib/neuremy-api';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Fácil' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HARD', label: 'Difícil' },
];

const LOCALES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type LocaleKey = 'es' | 'en' | 'pt';

interface TranslationForm {
  question: string;
  options: [string, string, string, string];
  explanation: string;
}

interface FormState {
  answer: number;
  difficulty: Difficulty;
  enable: boolean;
  translations: Record<LocaleKey, TranslationForm>;
}

const emptyTranslation = (): TranslationForm => ({
  question: '',
  options: ['', '', '', ''],
  explanation: '',
});

const emptyForm = (): FormState => ({
  answer: 0,
  difficulty: 'MEDIUM',
  enable: true,
  translations: {
    es: emptyTranslation(),
    en: emptyTranslation(),
    pt: emptyTranslation(),
  },
});

function translationToForm(t: QuestionTranslation): TranslationForm {
  return {
    question: t.questionText,
    options: [
      t.options[0] ?? '',
      t.options[1] ?? '',
      t.options[2] ?? '',
      t.options[3] ?? '',
    ] as [string, string, string, string],
    explanation: t.explanation ?? '',
  };
}

interface QuestionManagerProps {
  id: string;
  triggerCreate?: number;
}

export default function QuestionManager({
  id,
  triggerCreate,
}: QuestionManagerProps) {
  const { questions, loading, setQuestions } = useQuestions(id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();

  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(
    null,
  );
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [activeLocale, setActiveLocale] = useState<string>('es');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionData | null>(
    null,
  );
  const prevTriggerCreate = useRef<number | undefined>(undefined);

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData(emptyForm());
    setActiveLocale('es');
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  useEffect(() => {
    if (prevTriggerCreate.current === undefined) {
      prevTriggerCreate.current = triggerCreate || 0;
      return;
    }
    if (
      triggerCreate &&
      triggerCreate > 0 &&
      triggerCreate !== prevTriggerCreate.current
    ) {
      prevTriggerCreate.current = triggerCreate;
      handleCreate();
    }
  }, [triggerCreate]);

  const handleEdit = (question: QuestionData) => {
    setEditingQuestion(question);
    const translations: Record<LocaleKey, TranslationForm> = {
      es: emptyTranslation(),
      en: emptyTranslation(),
      pt: emptyTranslation(),
    };
    for (const t of question.translations) {
      if (t.locale === 'es' || t.locale === 'en' || t.locale === 'pt') {
        translations[t.locale] = translationToForm(t);
      }
    }
    setFormData({
      answer: question.answer,
      difficulty: question.difficulty,
      enable: question.enable,
      translations,
    });
    setActiveLocale('es');
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const openDeleteModal = (question: QuestionData) => {
    setDeletingQuestion(question);
    onOpenDeleteModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const es = formData.translations.es;
    if (!es.question.trim())
      newErrors.question_es = 'La pregunta en español es requerida';
    if (es.options.some((o) => !o.trim()))
      newErrors.options_es = 'Las 4 opciones en español son requeridas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const translations: Record<
      string,
      { question: string; options: string[]; explanation?: string }
    > = {};
    for (const locale of ['es', 'en', 'pt'] as LocaleKey[]) {
      const t = formData.translations[locale];
      if (t.question.trim() && t.options.every((o) => o.trim())) {
        translations[locale] = {
          question: t.question.trim(),
          options: t.options.map((o) => o.trim()),
          ...(t.explanation.trim()
            ? { explanation: t.explanation.trim() }
            : {}),
        };
      }
    }
    return {
      answer: formData.answer,
      difficulty: formData.difficulty,
      enable: formData.enable,
      translations,
    };
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload = buildPayload();
      const path = editingQuestion
        ? `/questions/${editingQuestion.id}`
        : `/lessons/${id}/questions`;
      const method = editingQuestion ? 'PATCH' : 'POST';
      const response = await neuremyFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const saved: QuestionData = await response.json();
      if (editingQuestion) {
        setQuestions(
          questions.map((q) => (q.id === editingQuestion.id ? saved : q)),
        );
        setSuccessMessage('Pregunta actualizada exitosamente');
      } else {
        setQuestions([...questions, saved]);
        setSuccessMessage('Pregunta creada exitosamente');
      }
      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuestion) return;
    try {
      const response = await neuremyFetch(`/questions/${deletingQuestion.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar: ${errorText}`);
      }
      setQuestions(questions.filter((q) => q.id !== deletingQuestion.id));
      setSuccessMessage('Pregunta eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
    onCloseDeleteModal();
  };

  const difficultyColor = (d: Difficulty) => {
    if (d === 'EASY') return 'success' as const;
    if (d === 'MEDIUM') return 'warning' as const;
    return 'danger' as const;
  };

  const difficultyLabel = (d: Difficulty) => {
    if (d === 'EASY') return 'Fácil';
    if (d === 'MEDIUM') return 'Media';
    return 'Difícil';
  };

  const updateTranslation = (
    locale: LocaleKey,
    field: keyof TranslationForm,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], [field]: value },
      },
    }));
  };

  const updateOption = (locale: LocaleKey, index: number, value: string) => {
    const newOptions = [...formData.translations[locale].options] as [
      string,
      string,
      string,
      string,
    ];
    newOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], options: newOptions },
      },
    }));
    if (locale === 'es' && errors.options_es)
      setErrors((prev) => ({ ...prev, options_es: '' }));
  };

  if (loading)
    return (
      <div className='text-center py-4 text-gray-500'>
        Cargando preguntas...
      </div>
    );

  return (
    <div className='h-full flex flex-col mt-4'>
      {successMessage && (
        <div className='flex-shrink-0 mb-3'>
          <Chip color='success' variant='flat'>
            {successMessage}
          </Chip>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardBody>
            <p className='text-center text-gray-500 py-4'>
              No hay preguntas de evaluación. Agrega una nueva pregunta.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className='flex-1 overflow-auto rounded-lg bg-white shadow-sm border border-gray-200'>
          <table className='min-w-full bg-white text-xs'>
            <thead className='bg-gradient-to-r from-blue-400 to-blue-500 text-white sticky top-0 z-10'>
              <tr>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold w-10'>
                  #
                </th>
                <th className='px-3 py-2 text-left uppercase tracking-tight font-semibold'>
                  Pregunta
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Dificultad
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Resp. correcta
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Idiomas
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Habilitada
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Rep.
                </th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {questions.map((question, index) => {
                const esTranslation = question.translations.find(
                  (t) => t.locale === 'es',
                );
                const correctOptionText =
                  esTranslation?.options[question.answer];
                const availableLocales = question.translations.map((t) =>
                  t.locale.toUpperCase(),
                );
                return (
                  <tr
                    key={question.id}
                    className='hover:bg-blue-50/50 transition-colors'
                  >
                    <td className='px-3 py-2 text-center'>
                      <span className='inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold'>
                        {index + 1}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-gray-700 font-medium max-w-xs'>
                      <span className='line-clamp-2'>
                        {esTranslation?.questionText ?? '-'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <Chip
                        size='sm'
                        color={difficultyColor(question.difficulty)}
                        variant='flat'
                      >
                        {difficultyLabel(question.difficulty)}
                      </Chip>
                    </td>
                    <td className='px-3 py-2 text-center max-w-[120px]'>
                      <span className='text-green-700 font-medium truncate block'>
                        {OPTION_LABELS[question.answer]}.{' '}
                        {correctOptionText ?? '-'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <div className='flex gap-1 justify-center flex-wrap'>
                        {availableLocales.map((l) => (
                          <Chip
                            key={l}
                            size='sm'
                            variant='flat'
                            className='text-[10px]'
                          >
                            {l}
                          </Chip>
                        ))}
                      </div>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <Chip
                        size='sm'
                        color={question.enable ? 'success' : 'default'}
                        variant='flat'
                      >
                        {question.enable ? 'Sí' : 'No'}
                      </Chip>
                    </td>
                    <td className='px-3 py-2 text-center text-gray-500'>
                      {question._count?.reports ?? 0}
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <div className='flex gap-1 justify-center'>
                        <Button
                          size='sm'
                          className='bg-warning-50 text-warning-600 hover:bg-warning-100'
                          variant='flat'
                          onPress={() => handleEdit(question)}
                        >
                          Editar
                        </Button>
                        <Button
                          size='sm'
                          color='danger'
                          variant='flat'
                          onPress={() => openDeleteModal(question)}
                        >
                          Borrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='2xl'
        isDismissable={false}
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalHeader className='text-gray-800'>
            {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <Chip
                color='danger'
                variant='flat'
                className='mb-2 w-full max-w-full'
              >
                {errors.general}
              </Chip>
            )}

            {/* Metadata row */}
            <div className='flex gap-4 items-center'>
              <Select
                label='Dificultad'
                selectedKeys={[formData.difficulty]}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] as Difficulty;
                  setFormData((prev) => ({ ...prev, difficulty: v }));
                }}
                className='flex-1'
                isRequired
                size='sm'
              >
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value}>{d.label}</SelectItem>
                ))}
              </Select>
              <div className='flex flex-col items-center gap-1 shrink-0'>
                <span className='text-xs text-gray-500'>Habilitada</span>
                <Switch
                  isSelected={formData.enable}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, enable: v }))
                  }
                  size='sm'
                />
              </div>
            </div>

            {/* Language tabs */}
            <div className='mt-1'>
              <Tabs
                selectedKey={activeLocale}
                onSelectionChange={(k) => setActiveLocale(k as string)}
                size='sm'
                color='primary'
                variant='underlined'
              >
                {LOCALES.map((locale) => {
                  const t = formData.translations[locale.value as LocaleKey];
                  const isFilled =
                    t.question.trim() && t.options.every((o) => o.trim());
                  return (
                    <Tab
                      key={locale.value}
                      title={
                        <span className='flex items-center gap-1'>
                          {locale.label}
                          {isFilled && (
                            <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block' />
                          )}
                        </span>
                      }
                    >
                      <div className='flex flex-col gap-3 pt-2'>
                        <Textarea
                          label='Pregunta'
                          placeholder='Escribe la pregunta...'
                          value={
                            formData.translations[locale.value as LocaleKey]
                              .question
                          }
                          onChange={(e) => {
                            updateTranslation(
                              locale.value as LocaleKey,
                              'question',
                              e.target.value,
                            );
                            if (locale.value === 'es' && errors.question_es) {
                              setErrors((prev) => ({
                                ...prev,
                                question_es: '',
                              }));
                            }
                          }}
                          minRows={2}
                          size='sm'
                          isRequired={locale.value === 'es'}
                          isInvalid={
                            locale.value === 'es' && !!errors.question_es
                          }
                          errorMessage={
                            locale.value === 'es'
                              ? errors.question_es
                              : undefined
                          }
                        />

                        <div className='flex flex-col gap-2'>
                          <span className='text-xs font-medium text-gray-600'>
                            Opciones
                            <span className='ml-1 text-gray-400 font-normal'>
                              — haz click en el círculo para marcar la correcta
                            </span>
                          </span>
                          {OPTION_LABELS.map((label, i) => (
                            <div key={i} className='flex items-center gap-2'>
                              <button
                                type='button'
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    answer: i,
                                  }))
                                }
                                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                  formData.answer === i
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300'
                                }`}
                                title={`Marcar opción ${label} como correcta`}
                              >
                                {formData.answer === i && (
                                  <span className='w-2 h-2 rounded-full bg-blue-500 block' />
                                )}
                              </button>
                              <span
                                className={`text-xs font-bold w-4 shrink-0 ${
                                  formData.answer === i
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {label}
                              </span>
                              <Input
                                placeholder={`Opción ${label}`}
                                value={
                                  formData.translations[
                                    locale.value as LocaleKey
                                  ].options[i]
                                }
                                onChange={(e) =>
                                  updateOption(
                                    locale.value as LocaleKey,
                                    i,
                                    e.target.value,
                                  )
                                }
                                size='sm'
                                isRequired={locale.value === 'es'}
                                className={`flex-1 ${formData.answer === i ? 'ring-1 ring-blue-200 rounded-xl' : ''}`}
                              />
                            </div>
                          ))}
                          {locale.value === 'es' && errors.options_es && (
                            <p className='text-tiny text-danger'>
                              {errors.options_es}
                            </p>
                          )}
                        </div>

                        <Textarea
                          label='Explicación (opcional)'
                          placeholder='Explica por qué esta es la respuesta correcta...'
                          value={
                            formData.translations[locale.value as LocaleKey]
                              .explanation
                          }
                          onChange={(e) =>
                            updateTranslation(
                              locale.value as LocaleKey,
                              'explanation',
                              e.target.value,
                            )
                          }
                          minRows={2}
                          size='sm'
                        />
                      </div>
                    </Tab>
                  );
                })}
              </Tabs>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color='danger'
              variant='light'
              onPress={onClose}
              isDisabled={saving}
            >
              Cancelar
            </Button>
            <Button color='primary' onPress={handleSave} isLoading={saving}>
              {editingQuestion ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteModal
        onClick={handleDelete}
        onClose={onCloseDeleteModal}
        isOpen={isOpenDeleteModal}
        dataName=''
        dataType='pregunta'
      />
    </div>
  );
}
