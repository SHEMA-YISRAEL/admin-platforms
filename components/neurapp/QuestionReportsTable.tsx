'use client';

import { useState } from 'react';
import {
  Chip,
  Button,
  Spinner,
  addToast,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  Select,
  SelectItem,
  Switch,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md';
import { FaCheck, FaEdit } from 'react-icons/fa';
import { neuremyFetch } from '@/lib/neuremy-api';
import {
  QuestionReportData,
  QuestionReportReason,
} from '@/app/hooks/neurapp/useQuestionReports';

const REASON_LABELS: Record<QuestionReportReason, string> = {
  WRONG_ANSWER: 'Respuesta incorrecta',
  SPELLING_ERROR: 'Error ortográfico',
  OUTDATED_TERM: 'Término desactualizado',
  OTHER: 'Otro',
};

const REASON_COLORS: Record<
  QuestionReportReason,
  'danger' | 'warning' | 'secondary' | 'default'
> = {
  WRONG_ANSWER: 'danger',
  SPELLING_ERROR: 'warning',
  OUTDATED_TERM: 'secondary',
  OTHER: 'default',
};

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
  translations: { es: emptyTranslation(), en: emptyTranslation(), pt: emptyTranslation() },
});

interface Props {
  reports: QuestionReportData[];
  isLoading: boolean;
  onReportsChange: (reports: QuestionReportData[]) => void;
}

export default function QuestionReportsTable({ reports, isLoading, onReportsChange }: Props) {
  const [solvingId, setSolvingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Edit modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [activeLocale, setActiveLocale] = useState<string>('es');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleMarkSolved = async (report: QuestionReportData) => {
    setSolvingId(report.id);
    try {
      const response = await neuremyFetch(`/question-reports/${report.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ solved: true }),
      });
      if (!response.ok) throw new Error();
      onReportsChange(reports.map((r) => (r.id === report.id ? { ...r, solved: true } : r)));
      addToast({ title: 'Reporte resuelto', description: 'Marcado como resuelto exitosamente' });
    } catch {
      addToast({ title: 'Error', description: 'No se pudo actualizar el reporte' });
    } finally {
      setSolvingId(null);
    }
  };

  const handleOpenEdit = async (questionId: string) => {
    setEditingQuestionId(questionId);
    setErrors({});
    setActiveLocale('es');
    setLoadingQuestion(true);
    onOpen();
    try {
      const res = await neuremyFetch(`/questions/${questionId}`);
      if (!res.ok) throw new Error();
      const q = await res.json();
      const translations: Record<LocaleKey, TranslationForm> = {
        es: emptyTranslation(),
        en: emptyTranslation(),
        pt: emptyTranslation(),
      };
      for (const t of q.translations ?? []) {
        const locale = t.locale as LocaleKey;
        if (locale === 'es' || locale === 'en' || locale === 'pt') {
          translations[locale] = {
            question: t.questionText ?? '',
            options: [
              t.options?.[0] ?? '',
              t.options?.[1] ?? '',
              t.options?.[2] ?? '',
              t.options?.[3] ?? '',
            ] as [string, string, string, string],
            explanation: t.explanation ?? '',
          };
        }
      }
      setFormData({ answer: q.answer ?? 0, difficulty: q.difficulty ?? 'MEDIUM', enable: q.enable ?? true, translations });
    } catch {
      addToast({ title: 'Error', description: 'No se pudo cargar la pregunta' });
      onClose();
    } finally {
      setLoadingQuestion(false);
    }
  };

  const updateTranslation = (locale: LocaleKey, field: keyof TranslationForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } },
    }));
  };

  const updateOption = (locale: LocaleKey, index: number, value: string) => {
    const newOptions = [...formData.translations[locale].options] as [string, string, string, string];
    newOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], options: newOptions } },
    }));
  };

  const handleSave = async () => {
    const es = formData.translations.es;
    const newErrors: Record<string, string> = {};
    if (!es.question.trim()) newErrors.question_es = 'La pregunta en español es requerida';
    if (es.options.some((o) => !o.trim())) newErrors.options_es = 'Las 4 opciones en español son requeridas';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const translations: Record<string, object> = {};
    for (const locale of ['es', 'en', 'pt'] as LocaleKey[]) {
      const t = formData.translations[locale];
      if (t.question.trim() && t.options.every((o) => o.trim())) {
        translations[locale] = {
          question: t.question.trim(),
          options: t.options.map((o) => o.trim()),
          ...(t.explanation.trim() ? { explanation: t.explanation.trim() } : {}),
        };
      }
    }

    setSaving(true);
    try {
      const res = await neuremyFetch(`/questions/${editingQuestionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ answer: formData.answer, difficulty: formData.difficulty, enable: formData.enable, translations }),
      });
      if (!res.ok) throw new Error();
      addToast({ title: 'Pregunta actualizada', description: 'Los cambios se guardaron exitosamente' });
      onClose();
    } catch {
      setErrors({ general: 'No se pudo guardar la pregunta' });
    } finally {
      setSaving(false);
    }
  };

  const columnHelper = createColumnHelper<QuestionReportData>();

  const columns = [
    columnHelper.display({
      id: 'number',
      header: () => '#',
      cell: (info) => (
        <span className='inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold'>
          {info.row.index + 1}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'context',
      header: () => 'Materia / Lección',
      cell: (info) => {
        const lesson = info.row.original.question?.lesson;
        return (
          <div className='text-xs min-w-[120px]'>
            {lesson ? (
              <>
                <div className='font-semibold text-gray-700'>{lesson.course.title}</div>
                <div className='text-gray-400'>{lesson.title}</div>
              </>
            ) : (
              <span className='text-gray-400'>-</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'question',
      header: () => 'Pregunta',
      cell: (info) => {
        const text = info.row.original.question?.translations[0]?.questionText;
        return (
          <div className='max-w-xs font-medium line-clamp-2'>
            {text ?? <span className='text-gray-400 italic'>Pregunta eliminada</span>}
          </div>
        );
      },
    }),
    columnHelper.accessor('reason', {
      header: () => 'Razón',
      cell: (info) => (
        <Chip size='sm' color={REASON_COLORS[info.getValue()]} variant='flat'>
          {REASON_LABELS[info.getValue()]}
        </Chip>
      ),
    }),
    columnHelper.accessor('comment', {
      header: () => 'Comentario',
      cell: (info) => {
        const text = info.getValue();
        return text ? (
          <div className='max-w-[200px] text-xs text-gray-600 line-clamp-2'>{text}</div>
        ) : (
          <span className='text-gray-400'>-</span>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      header: () => 'Fecha',
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className='whitespace-nowrap text-xs'>
            {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            <br />
            <span className='text-gray-400'>
              {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        new Date(rowA.original.createdAt).getTime() - new Date(rowB.original.createdAt).getTime(),
    }),
    columnHelper.accessor('solved', {
      header: () => 'Estado',
      cell: (info) => (
        <Chip size='sm' color={info.getValue() ? 'success' : 'danger'} variant='flat'>
          {info.getValue() ? 'Resuelto' : 'Pendiente'}
        </Chip>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Acciones',
      cell: (info) => {
        const report = info.row.original;
        return (
          <div className='flex gap-2'>
            {!report.solved && (
              <Button
                isIconOnly
                size='sm'
                color='success'
                variant='flat'
                isLoading={solvingId === report.id}
                onPress={() => handleMarkSolved(report)}
                title='Marcar como resuelto'
              >
                <FaCheck size={12} />
              </Button>
            )}
            {report.question && (
              <Button
                isIconOnly
                size='sm'
                color='warning'
                variant='flat'
                onPress={() => handleOpenEdit(report.question!.id)}
                title='Editar pregunta'
              >
                <FaEdit size={12} />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full rounded-lg bg-white shadow-md border border-gray-200'>
        <Spinner size='lg' color='primary' />
      </div>
    );
  }

  return (
    <>
      <div className='h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200'>
        {reports.length === 0 ? (
          <div className='flex justify-center items-center h-full text-center font-semibold text-2xl text-gray-400'>
            No hay reportes
          </div>
        ) : (
          <>
            <div className='flex-1 overflow-auto'>
              <table className='min-w-full bg-white text-xs'>
                <thead className='bg-gradient-to-r from-blue-400 to-blue-500 sticky top-0 z-10'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-tight'
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1' : ''}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='hover:bg-blue-50/50 transition-colors'>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='px-3 py-2 text-xs text-gray-700'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='flex-shrink-0 border-t border-gray-200'>
              <div className='flex items-center justify-end gap-2 px-3 py-2 bg-gray-50'>
                <div className='flex items-center gap-1'>
                  <Button size='sm' className='p-2 text-2xl' onPress={() => table.setPageIndex(0)} isDisabled={!table.getCanPreviousPage()}>
                    <TbPlayerTrackPrev />
                  </Button>
                  <Button size='sm' className='p-2 text-2xl' onPress={() => table.previousPage()} isDisabled={!table.getCanPreviousPage()}>
                    <MdSkipPrevious />
                  </Button>
                  <Button size='sm' className='p-2 text-2xl' onPress={() => table.nextPage()} isDisabled={!table.getCanNextPage()}>
                    <MdSkipNext />
                  </Button>
                  <Button size='sm' className='p-2 text-2xl' onPress={() => table.setPageIndex(table.getPageCount() - 1)} isDisabled={!table.getCanNextPage()}>
                    <TbPlayerTrackNext />
                  </Button>
                </div>
                <span className='flex items-center gap-1 text-xl text-gray-600 font-bold'>
                  <div>Pág</div>
                  <strong>{table.getState().pagination.pageIndex + 1}/{table.getPageCount()}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit question modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='2xl' isDismissable={false} scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='text-gray-800'>Editar Pregunta</ModalHeader>
          <ModalBody>
            {loadingQuestion ? (
              <div className='flex justify-center py-8'><Spinner color='primary' /></div>
            ) : (
              <>
                {errors.general && (
                  <Chip color='danger' variant='flat' className='mb-2 w-full max-w-full'>{errors.general}</Chip>
                )}

                <div className='flex gap-4 items-center'>
                  <Select
                    label='Dificultad'
                    selectedKeys={[formData.difficulty]}
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0] as Difficulty;
                      setFormData((prev) => ({ ...prev, difficulty: v }));
                    }}
                    className='flex-1'
                    size='sm'
                  >
                    {DIFFICULTIES.map((d) => <SelectItem key={d.value}>{d.label}</SelectItem>)}
                  </Select>
                  <div className='flex flex-col items-center gap-1 shrink-0'>
                    <span className='text-xs text-gray-500'>Habilitada</span>
                    <Switch
                      isSelected={formData.enable}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, enable: v }))}
                      size='sm'
                    />
                  </div>
                </div>

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
                      const isFilled = t.question.trim() && t.options.every((o) => o.trim());
                      return (
                        <Tab
                          key={locale.value}
                          title={
                            <span className='flex items-center gap-1'>
                              {locale.label}
                              {isFilled && <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block' />}
                            </span>
                          }
                        >
                          <div className='flex flex-col gap-3 pt-2'>
                            <Textarea
                              label='Pregunta'
                              placeholder='Escribe la pregunta...'
                              value={formData.translations[locale.value as LocaleKey].question}
                              onChange={(e) => updateTranslation(locale.value as LocaleKey, 'question', e.target.value)}
                              minRows={2}
                              size='sm'
                              isRequired={locale.value === 'es'}
                              isInvalid={locale.value === 'es' && !!errors.question_es}
                              errorMessage={locale.value === 'es' ? errors.question_es : undefined}
                            />

                            <div className='flex flex-col gap-2'>
                              <span className='text-xs font-medium text-gray-600'>
                                Opciones
                                <span className='ml-1 text-gray-400 font-normal'>— haz click en el círculo para marcar la correcta</span>
                              </span>
                              {OPTION_LABELS.map((label, i) => (
                                <div key={i} className='flex items-center gap-2'>
                                  <button
                                    type='button'
                                    onClick={() => setFormData((prev) => ({ ...prev, answer: i }))}
                                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                      formData.answer === i ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                                    }`}
                                  >
                                    {formData.answer === i && <span className='w-2 h-2 rounded-full bg-blue-500 block' />}
                                  </button>
                                  <span className={`text-xs font-bold w-4 shrink-0 ${formData.answer === i ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {label}
                                  </span>
                                  <Input
                                    placeholder={`Opción ${label}`}
                                    value={formData.translations[locale.value as LocaleKey].options[i]}
                                    onChange={(e) => updateOption(locale.value as LocaleKey, i, e.target.value)}
                                    size='sm'
                                    isRequired={locale.value === 'es'}
                                    className={`flex-1 ${formData.answer === i ? 'ring-1 ring-blue-200 rounded-xl' : ''}`}
                                  />
                                </div>
                              ))}
                              {locale.value === 'es' && errors.options_es && (
                                <p className='text-tiny text-danger'>{errors.options_es}</p>
                              )}
                            </div>

                            <Textarea
                              label='Explicación (opcional)'
                              placeholder='Explica por qué esta es la respuesta correcta...'
                              value={formData.translations[locale.value as LocaleKey].explanation}
                              onChange={(e) => updateTranslation(locale.value as LocaleKey, 'explanation', e.target.value)}
                              minRows={2}
                              size='sm'
                            />
                          </div>
                        </Tab>
                      );
                    })}
                  </Tabs>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onClose} isDisabled={saving}>Cancelar</Button>
            <Button color='primary' onPress={handleSave} isLoading={saving} isDisabled={loadingQuestion}>Actualizar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
