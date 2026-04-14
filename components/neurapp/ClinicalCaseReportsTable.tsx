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
  ClinicalCaseReportData,
  ClinicalCaseReportReason,
} from '@/app/hooks/neurapp/useClinicalCaseReports';

const REASON_LABELS: Record<ClinicalCaseReportReason, string> = {
  WRONG_ANSWER: 'Respuesta incorrecta',
  SPELLING_ERROR: 'Error ortográfico',
  OUTDATED_TERM: 'Término desactualizado',
  OTHER: 'Otro',
};

const REASON_COLORS: Record<
  ClinicalCaseReportReason,
  'danger' | 'warning' | 'secondary' | 'default'
> = {
  WRONG_ANSWER: 'danger',
  SPELLING_ERROR: 'warning',
  OUTDATED_TERM: 'secondary',
  OTHER: 'default',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface CaseFormState {
  answer: number;
  enable: boolean;
  caseText: string;
  questionText: string;
  options: [string, string, string, string];
  explanation: string;
}

const emptyForm = (): CaseFormState => ({
  answer: 0,
  enable: true,
  caseText: '',
  questionText: '',
  options: ['', '', '', ''],
  explanation: '',
});

interface Props {
  reports: ClinicalCaseReportData[];
  isLoading: boolean;
  onReportsChange: (reports: ClinicalCaseReportData[]) => void;
}

export default function ClinicalCaseReportsTable({ reports, isLoading, onReportsChange }: Props) {
  const [solvingId, setSolvingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Edit modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CaseFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCase, setLoadingCase] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleMarkSolved = async (report: ClinicalCaseReportData) => {
    setSolvingId(report.id);
    try {
      const response = await neuremyFetch(`/clinical-case-reports/${report.id}`, {
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

  const handleOpenEdit = async (caseId: string) => {
    setEditingCaseId(caseId);
    setErrors({});
    setLoadingCase(true);
    onOpen();
    try {
      const res = await neuremyFetch(`/clinical-cases/${caseId}`);
      if (!res.ok) throw new Error();
      const c = await res.json();
      const esTranslation = (c.translations ?? []).find(
        (t: { locale: string }) => t.locale === 'es',
      ) ?? {};
      setFormData({
        answer: c.answer ?? 0,
        enable: c.enable ?? true,
        caseText: esTranslation.caseText ?? '',
        questionText: esTranslation.questionText ?? '',
        options: [
          esTranslation.options?.[0] ?? '',
          esTranslation.options?.[1] ?? '',
          esTranslation.options?.[2] ?? '',
          esTranslation.options?.[3] ?? '',
        ] as [string, string, string, string],
        explanation: esTranslation.explanation ?? '',
      });
    } catch {
      addToast({ title: 'Error', description: 'No se pudo cargar el caso clínico' });
      onClose();
    } finally {
      setLoadingCase(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options] as [string, string, string, string];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.caseText.trim()) newErrors.caseText = 'El enunciado del caso es requerido';
    if (!formData.questionText.trim()) newErrors.questionText = 'La pregunta es requerida';
    if (formData.options.some((o) => !o.trim())) newErrors.options = 'Las 4 opciones son requeridas';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const res = await neuremyFetch(`/clinical-cases/${editingCaseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
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
        }),
      });
      if (!res.ok) throw new Error();
      addToast({ title: 'Caso clínico actualizado', description: 'Los cambios se guardaron exitosamente' });
      onClose();
    } catch {
      setErrors({ general: 'No se pudo guardar el caso clínico' });
    } finally {
      setSaving(false);
    }
  };

  const columnHelper = createColumnHelper<ClinicalCaseReportData>();

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
        const lesson = info.row.original.case?.lesson;
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
      id: 'caseText',
      header: () => 'Caso clínico',
      cell: (info) => {
        const text = info.row.original.case?.translations[0]?.caseText;
        return (
          <div className='max-w-xs font-medium line-clamp-2'>
            {text ?? <span className='text-gray-400 italic'>Caso eliminado</span>}
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
            {report.case && !report.solved && (
              <Button
                isIconOnly
                size='sm'
                color='warning'
                variant='flat'
                onPress={() => handleOpenEdit(report.case!.id)}
                title='Editar caso clínico'
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

      {/* Edit clinical case modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='2xl' isDismissable={false} scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader className='text-gray-800'>Editar Caso Clínico</ModalHeader>
          <ModalBody>
            {loadingCase ? (
              <div className='flex justify-center py-8'><Spinner color='primary' /></div>
            ) : (
              <>
                {errors.general && (
                  <Chip color='danger' variant='flat' className='mb-2 w-full max-w-full'>{errors.general}</Chip>
                )}

                <div className='flex gap-4 items-center mb-2'>
                  <Select
                    label='Respuesta correcta'
                    selectedKeys={[String(formData.answer)]}
                    onSelectionChange={(keys) => {
                      const v = Number(Array.from(keys)[0]);
                      setFormData((prev) => ({ ...prev, answer: v }));
                    }}
                    className='flex-1'
                    size='sm'
                  >
                    {OPTION_LABELS.map((label, i) => (
                      <SelectItem key={String(i)}>{`Opción ${label}`}</SelectItem>
                    ))}
                  </Select>
                  <div className='flex flex-col items-center gap-1 shrink-0'>
                    <span className='text-xs text-gray-500'>Habilitado</span>
                    <Switch
                      isSelected={formData.enable}
                      onValueChange={(v) => setFormData((prev) => ({ ...prev, enable: v }))}
                      size='sm'
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  <Textarea
                    label='Enunciado del caso clínico'
                    placeholder='Describe el caso clínico...'
                    value={formData.caseText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, caseText: e.target.value }))}
                    minRows={3}
                    size='sm'
                    isRequired
                    isInvalid={!!errors.caseText}
                    errorMessage={errors.caseText}
                  />

                  <Textarea
                    label='Pregunta'
                    placeholder='Escribe la pregunta...'
                    value={formData.questionText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, questionText: e.target.value }))}
                    minRows={2}
                    size='sm'
                    isRequired
                    isInvalid={!!errors.questionText}
                    errorMessage={errors.questionText}
                  />

                  <div className='flex flex-col gap-2'>
                    <span className='text-xs font-medium text-gray-600'>
                      Opciones
                      <span className='ml-1 text-gray-400 font-normal'>— selecciona la correcta arriba</span>
                    </span>
                    {OPTION_LABELS.map((label, i) => (
                      <div key={i} className='flex items-center gap-2'>
                        <span className={`text-xs font-bold w-4 shrink-0 ${formData.answer === i ? 'text-blue-600' : 'text-gray-400'}`}>
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
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onPress={onClose} isDisabled={saving}>Cancelar</Button>
            <Button color='primary' onPress={handleSave} isLoading={saving} isDisabled={loadingCase}>Actualizar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
