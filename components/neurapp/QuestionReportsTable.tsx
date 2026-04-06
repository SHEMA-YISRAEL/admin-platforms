'use client';

import { useState } from 'react';
import { Chip, Button, Spinner, addToast } from '@heroui/react';
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
import { FaCheck, FaTrash } from 'react-icons/fa';
import { neuremyFetch } from '@/lib/neuremy-api';
import {
  QuestionReportData,
  QuestionReportReason,
} from '@/app/hooks/neurapp/useQuestionReports';
import DeleteModal from '../shared/DeleteModal';
import { useDisclosure } from '@heroui/react';

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

interface Props {
  reports: QuestionReportData[];
  isLoading: boolean;
  onReportsChange: (reports: QuestionReportData[]) => void;
}

export default function QuestionReportsTable({
  reports,
  isLoading,
  onReportsChange,
}: Props) {
  const [solvingId, setSolvingId] = useState<string | null>(null);
  const [deletingReport, setDeletingReport] =
    useState<QuestionReportData | null>(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleMarkSolved = async (report: QuestionReportData) => {
    setSolvingId(report.id);
    try {
      const response = await neuremyFetch(`/question-reports/${report.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ solved: true }),
      });
      if (!response.ok) throw new Error('Error al actualizar');
      onReportsChange(
        reports.map((r) => (r.id === report.id ? { ...r, solved: true } : r)),
      );
      addToast({
        title: 'Reporte resuelto',
        description: 'Marcado como resuelto exitosamente',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'No se pudo actualizar el reporte',
      });
    } finally {
      setSolvingId(null);
    }
  };

  const openDeleteModal = (report: QuestionReportData) => {
    setDeletingReport(report);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deletingReport) return;
    try {
      const response = await neuremyFetch(
        `/question-reports/${deletingReport.id}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error('Error al eliminar');
      onReportsChange(reports.filter((r) => r.id !== deletingReport.id));
      addToast({
        title: 'Eliminado',
        description: 'Reporte eliminado exitosamente',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'No se pudo eliminar el reporte',
      });
    }
    onDeleteClose();
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
                <div className='font-semibold text-gray-700'>
                  {lesson.course.title}
                </div>
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
            {text ?? (
              <span className='text-gray-400 italic'>Pregunta eliminada</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('reason', {
      header: () => 'Razón',
      cell: (info) => {
        const reason = info.getValue();
        return (
          <Chip size='sm' color={REASON_COLORS[reason]} variant='flat'>
            {REASON_LABELS[reason]}
          </Chip>
        );
      },
    }),
    columnHelper.accessor('comment', {
      header: () => 'Comentario',
      cell: (info) => {
        const text = info.getValue();
        return text ? (
          <div className='max-w-[200px] text-xs text-gray-600 line-clamp-2'>
            {text}
          </div>
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
            {date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })}
            <br />
            <span className='text-gray-400'>
              {date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        new Date(rowA.original.createdAt).getTime() -
        new Date(rowB.original.createdAt).getTime(),
    }),
    columnHelper.accessor('solved', {
      header: () => 'Estado',
      cell: (info) => (
        <Chip
          size='sm'
          color={info.getValue() ? 'success' : 'danger'}
          variant='flat'
        >
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
            <Button
              isIconOnly
              size='sm'
              color='danger'
              variant='flat'
              onPress={() => openDeleteModal(report)}
              title='Eliminar reporte'
            >
              <FaTrash size={12} />
            </Button>
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
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center gap-1'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{ asc: ' ▲', desc: ' ▼' }[
                              header.column.getIsSorted() as string
                            ] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className='hover:bg-blue-50/50 transition-colors'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className='px-3 py-2 text-xs text-gray-700'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
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
                <Button
                  size='sm'
                  className='p-2 text-2xl'
                  onPress={() => table.setPageIndex(0)}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <TbPlayerTrackPrev />
                </Button>
                <Button
                  size='sm'
                  className='p-2 text-2xl'
                  onPress={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <MdSkipPrevious />
                </Button>
                <Button
                  size='sm'
                  className='p-2 text-2xl'
                  onPress={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  <MdSkipNext />
                </Button>
                <Button
                  size='sm'
                  className='p-2 text-2xl'
                  onPress={() => table.setPageIndex(table.getPageCount() - 1)}
                  isDisabled={!table.getCanNextPage()}
                >
                  <TbPlayerTrackNext />
                </Button>
              </div>
              <span className='flex items-center gap-1 text-xl text-gray-600 font-bold'>
                <div>Pág</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1}/
                  {table.getPageCount()}
                </strong>
              </span>
            </div>
          </div>
        </>
      )}

      <DeleteModal
        onClick={handleDelete}
        onClose={onDeleteClose}
        isOpen={isDeleteOpen}
        dataName=''
        dataType='reporte'
        description='Esta acción no se puede deshacer.'
      />
    </div>
  );
}
