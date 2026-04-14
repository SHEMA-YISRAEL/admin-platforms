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
  Switch,
} from '@heroui/react';
import useClinicalCases, { ClinicalCaseData } from '@/app/hooks/neurapp/useClinicalCases';
import DeleteModal from '../shared/DeleteModal';
import { neuremyFetch } from '@/lib/neuremy-api';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface FormState {
  answer: number;
  enable: boolean;
  caseText: string;
  questionText: string;
  options: [string, string, string, string];
  explanation: string;
}

const emptyForm = (): FormState => ({
  answer: 0,
  enable: true,
  caseText: '',
  questionText: '',
  options: ['', '', '', ''],
  explanation: '',
});

function caseToForm(c: ClinicalCaseData): FormState {
  const es = c.translations.find((t) => t.locale === 'es');
  return {
    answer: c.answer,
    enable: c.enable,
    caseText: es?.caseText ?? '',
    questionText: es?.questionText ?? '',
    options: [
      es?.options[0] ?? '',
      es?.options[1] ?? '',
      es?.options[2] ?? '',
      es?.options[3] ?? '',
    ] as [string, string, string, string],
    explanation: es?.explanation ?? '',
  };
}

interface ClinicalCaseManagerProps {
  id: string;
  triggerCreate?: number;
}

export default function ClinicalCaseManager({ id, triggerCreate }: ClinicalCaseManagerProps) {
  const { cases, loading, setCases } = useClinicalCases(id);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();

  const [editingCase, setEditingCase] = useState<ClinicalCaseData | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingCase, setDeletingCase] = useState<ClinicalCaseData | null>(null);
  const prevTriggerCreate = useRef<number | undefined>(undefined);

  const handleCreate = () => {
    setEditingCase(null);
    setFormData(emptyForm());
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  useEffect(() => {
    if (prevTriggerCreate.current === undefined) {
      prevTriggerCreate.current = triggerCreate || 0;
      return;
    }
    if (triggerCreate && triggerCreate > 0 && triggerCreate !== prevTriggerCreate.current) {
      prevTriggerCreate.current = triggerCreate;
      handleCreate();
    }
  }, [triggerCreate]);

  const handleEdit = (c: ClinicalCaseData) => {
    setEditingCase(c);
    setFormData(caseToForm(c));
    setErrors({});
    setSuccessMessage(null);
    onOpen();
  };

  const openDeleteModal = (c: ClinicalCaseData) => {
    setDeletingCase(c);
    onOpenDeleteModal();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.caseText.trim()) newErrors.caseText = 'El enunciado del caso es requerido';
    if (!formData.questionText.trim()) newErrors.questionText = 'La pregunta es requerida';
    if (formData.options.some((o) => !o.trim())) newErrors.options = 'Las 4 opciones son requeridas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    answer: formData.answer,
    enable: formData.enable,
    translations: {
      es: {
        caseText: formData.caseText.trim(),
        question: formData.questionText.trim(),
        options: formData.options.map((o) => o.trim()),
        ...(formData.explanation.trim() ? { explanation: formData.explanation.trim() } : {}),
      },
    },
  });

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const payload = buildPayload();
      const path = editingCase
        ? `/clinical-cases/${editingCase.id}`
        : `/lessons/${id}/clinical-cases`;
      const method = editingCase ? 'PATCH' : 'POST';
      const response = await neuremyFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const saved: ClinicalCaseData = await response.json();
      if (editingCase) {
        setCases(cases.map((c) => (c.id === editingCase.id ? saved : c)));
        setSuccessMessage('Caso clínico actualizado exitosamente');
      } else {
        setCases([...cases, saved]);
        setSuccessMessage('Caso clínico creado exitosamente');
      }
      setTimeout(() => setSuccessMessage(null), 3000);
      onClose();
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCase) return;
    try {
      const response = await neuremyFetch(`/clinical-cases/${deletingCase.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar: ${errorText}`);
      }
      setCases(cases.filter((c) => c.id !== deletingCase.id));
      setSuccessMessage('Caso clínico eliminado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error desconocido' });
    }
    onCloseDeleteModal();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options] as [string, string, string, string];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
    if (errors.options) setErrors((prev) => ({ ...prev, options: '' }));
  };

  if (loading)
    return <div className='text-center py-4 text-gray-500'>Cargando casos clínicos...</div>;

  return (
    <div className='h-full flex flex-col mt-4'>
      {successMessage && (
        <div className='flex-shrink-0 mb-3'>
          <Chip color='success' variant='flat'>{successMessage}</Chip>
        </div>
      )}

      {cases.length === 0 ? (
        <Card>
          <CardBody>
            <p className='text-center text-gray-500 py-4'>
              No hay casos clínicos. Agrega uno nuevo.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className='flex-1 overflow-auto rounded-lg bg-white shadow-sm border border-gray-200'>
          <table className='min-w-full bg-white text-xs'>
            <thead className='bg-gradient-to-r from-blue-400 to-blue-500 text-white sticky top-0 z-10'>
              <tr>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold w-10'>#</th>
                <th className='px-3 py-2 text-left uppercase tracking-tight font-semibold'>Caso clínico</th>
                <th className='px-3 py-2 text-left uppercase tracking-tight font-semibold'>Pregunta</th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>Resp. correcta</th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>Habilitado</th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>Rep.</th>
                <th className='px-3 py-2 text-center uppercase tracking-tight font-semibold'>Acciones</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {cases.map((c, index) => {
                const esTranslation = c.translations.find((t) => t.locale === 'es');
                const correctOptionText = esTranslation?.options[c.answer];
                return (
                  <tr key={c.id} className='hover:bg-blue-50/50 transition-colors'>
                    <td className='px-3 py-2 text-center'>
                      <span className='inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold'>
                        {index + 1}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-gray-700 font-medium max-w-[180px]'>
                      <span className='line-clamp-2'>{esTranslation?.caseText ?? '-'}</span>
                    </td>
                    <td className='px-3 py-2 text-gray-700 max-w-[180px]'>
                      <span className='line-clamp-2'>{esTranslation?.questionText ?? '-'}</span>
                    </td>
                    <td className='px-3 py-2 text-center max-w-[120px]'>
                      <span className='text-green-700 font-medium truncate block'>
                        {OPTION_LABELS[c.answer]}. {correctOptionText ?? '-'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <Chip size='sm' color={c.enable ? 'success' : 'default'} variant='flat'>
                        {c.enable ? 'Sí' : 'No'}
                      </Chip>
                    </td>
                    <td className='px-3 py-2 text-center text-gray-500'>
                      {c._count?.reports ?? 0}
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <div className='flex gap-1 justify-center'>
                        <Button
                          size='sm'
                          className='bg-warning-50 text-warning-600 hover:bg-warning-100'
                          variant='flat'
                          onPress={() => handleEdit(c)}
                        >
                          Editar
                        </Button>
                        <Button
                          size='sm'
                          color='danger'
                          variant='flat'
                          onPress={() => openDeleteModal(c)}
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

      {/* Create / Edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='2xl' isDismissable={false} scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='text-gray-800'>
            {editingCase ? 'Editar Caso Clínico' : 'Nuevo Caso Clínico'}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <Chip color='danger' variant='flat' className='mb-2 w-full max-w-full'>
                {errors.general}
              </Chip>
            )}

            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500 font-medium'>Configuración</span>
                <div className='flex items-center gap-3'>
                  <span className='text-xs text-gray-500'>Habilitado</span>
                  <Switch
                    isSelected={formData.enable}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, enable: v }))}
                    size='sm'
                  />
                </div>
              </div>

              <Textarea
                label='Enunciado del caso clínico'
                placeholder='Describe la situación clínica del paciente...'
                value={formData.caseText}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, caseText: e.target.value }));
                  if (errors.caseText) setErrors((prev) => ({ ...prev, caseText: '' }));
                }}
                minRows={4}
                size='sm'
                isRequired
                isInvalid={!!errors.caseText}
                errorMessage={errors.caseText}
              />

              <Textarea
                label='Pregunta'
                placeholder='Escribe la pregunta sobre el caso...'
                value={formData.questionText}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, questionText: e.target.value }));
                  if (errors.questionText) setErrors((prev) => ({ ...prev, questionText: '' }));
                }}
                minRows={2}
                size='sm'
                isRequired
                isInvalid={!!errors.questionText}
                errorMessage={errors.questionText}
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
                      onClick={() => setFormData((prev) => ({ ...prev, answer: i }))}
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
                        formData.answer === i ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                    <Input
                      placeholder={`Opción ${label}`}
                      value={formData.options[i]}
                      onChange={(e) => updateOption(i, e.target.value)}
                      size='sm'
                      isRequired
                      className={`flex-1 ${formData.answer === i ? 'ring-1 ring-blue-200 rounded-xl' : ''}`}
                    />
                  </div>
                ))}
                {errors.options && (
                  <p className='text-tiny text-danger'>{errors.options}</p>
                )}
              </div>

              <Textarea
                label='Explicación (opcional)'
                placeholder='Explica por qué esta es la respuesta correcta...'
                value={formData.explanation}
                onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                minRows={2}
                size='sm'
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onClose} isDisabled={saving}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleSave} isLoading={saving}>
              {editingCase ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteModal
        onClick={handleDelete}
        onClose={onCloseDeleteModal}
        isOpen={isOpenDeleteModal}
        dataName=''
        dataType='caso clínico'
      />
    </div>
  );
}
