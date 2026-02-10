import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import { TbPlayerTrackNext, TbPlayerTrackPrev } from "react-icons/tb";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";

import { Chip, Button, Spinner, addToast } from "@heroui/react";
import { ReportedQuestionData, QuestionData } from "@/interfaces/topoquizz";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import EditQuestionModal from "./modals/editQuestion";

interface ReportedQuestionsTableProps {
  reportedQuestions: ReportedQuestionData[];
  isLoading: boolean;
}

const ReportedQuestionsTable: React.FC<ReportedQuestionsTableProps> = ({
  reportedQuestions,
  isLoading,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null);
  const [loadingQuestionId, setLoadingQuestionId] = useState<string | null>(null);

  const handleEditQuestion = async (report: ReportedQuestionData) => {
    if (!report.questionId) {
      addToast({
        title: "Error",
        description: "No se encontró el ID de la pregunta asociada",
      });
      return;
    }

    setLoadingQuestionId(report.id);

    try {
      const questionRef = doc(db, "questions", report.questionId);
      const questionSnap = await getDoc(questionRef);

      if (!questionSnap.exists()) {
        addToast({
          title: "Error",
          description: "La pregunta original no fue encontrada en la base de datos",
        });
        return;
      }

      const data = questionSnap.data();
      const questionData: QuestionData = {
        id: questionSnap.id,
        answer: data.answer,
        enable: data.enable,
        lessonId: data.lessonId,
        difficulty: data.difficult ?? data.difficulty,
        translations: data.translations,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
      };

      setSelectedQuestion(questionData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching question:", error);
      addToast({
        title: "Error",
        description: "No se pudo cargar la pregunta para editar",
      });
    } finally {
      setLoadingQuestionId(null);
    }
  };

  const handleMarkSolved = async (reportId: string) => {
    try {
      const reportRef = doc(db, "reportQuestion", reportId);
      await updateDoc(reportRef, { solved: true });
      addToast({
        title: "Reporte resuelto",
        description: "El reporte ha sido marcado como resuelto",
      });
    } catch (error) {
      console.error("Error marking report as solved:", error);
      addToast({
        title: "Error",
        description: "No se pudo marcar el reporte como resuelto",
      });
    }
  };

  const columnHelper = createColumnHelper<ReportedQuestionData>();

  const columns = [
    columnHelper.display({
      id: "number",
      header: () => "#",
      cell: (info) => info.row.index + 1,
    }),
    columnHelper.accessor("question", {
      header: () => "Pregunta",
      cell: (info) => (
        <div className="max-w-xs font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.display({
      id: "context",
      header: () => "Materia / Lección",
      cell: (info) => {
        const { subjectName, lessonName } = info.row.original;
        return (
          <div className="text-xs">
            {subjectName && <div className="font-semibold">{subjectName}</div>}
            {lessonName && <div className="text-gray-500">{lessonName}</div>}
            {!subjectName && !lessonName && "-"}
          </div>
        );
      },
    }),
    columnHelper.accessor("reason", {
      header: () => "Razones",
      cell: (info) => {
        const reasons = info.getValue();
        return reasons && reasons.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {reasons.map((r, i) => (
              <Chip key={i} size="sm" color="warning" variant="flat">
                {r}
              </Chip>
            ))}
          </div>
        ) : (
          "-"
        );
      },
    }),
    columnHelper.accessor("suggestion", {
      header: () => "Sugerencia",
      cell: (info) => {
        const text = info.getValue();
        return text ? (
          <div className="max-w-xs text-xs" title={text}>
            {text}
          </div>
        ) : (
          "-"
        );
      },
    }),
    columnHelper.display({
      id: "reportedBy",
      header: () => "Reportado por",
      cell: (info) => {
        const { displayName, email } = info.row.original;
        return (
          <div className="text-xs">
            {displayName || email || "Anónimo"}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: () => "Fecha",
      cell: (info) => {
        const date = info.getValue();
        return date ? (
          <div className="whitespace-nowrap text-xs">
            {date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
            <br />
            <span className="text-gray-500">
              {date.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ) : (
          "-"
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.createdAt;
        const dateB = rowB.original.createdAt;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.getTime() - dateB.getTime();
      },
    }),
    columnHelper.accessor("solved", {
      header: () => "Estado",
      cell: (info) => (
        <Chip size="sm" color={info.getValue() ? "success" : "danger"}>
          {info.getValue() ? "Resuelto" : "Pendiente"}
        </Chip>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Acciones",
      cell: (info) => {
        const report = info.row.original;
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              color="warning"
              isLoading={loadingQuestionId === report.id}
              onPress={() => handleEditQuestion(report)}
              title="Editar pregunta"
            >
              <CiEdit size={18} />
            </Button>
            {!report.solved && (
              <Button
                isIconOnly
                size="sm"
                color="success"
                onPress={() => handleMarkSolved(report.id)}
                title="Marcar como resuelto"
              >
                <FaCheck size={14} />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: reportedQuestions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner size="lg" color="warning" />
        </div>
      ) : reportedQuestions.length === 0 ? (
        <div className="flex justify-center items-center h-full text-center font-semibold text-2xl text-gray-400">
          No hay preguntas reportadas
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full bg-white text-xs">
              <thead className="bg-gradient-to-r from-red-500 to-red-600 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-tight"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-1"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " ▲",
                              desc: " ▼",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-red-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2 text-xs text-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200">
            <div className="flex items-center justify-end gap-2 px-3 py-2 bg-gray-50">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  className="p-2 text-2xl"
                  onPress={() => table.setPageIndex(0)}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <TbPlayerTrackPrev />
                </Button>
                <Button
                  size="sm"
                  className="p-2 text-2xl"
                  onPress={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <MdSkipPrevious />
                </Button>
                <Button
                  size="sm"
                  className="p-2 text-2xl"
                  onPress={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  <MdSkipNext />
                </Button>
                <Button
                  size="sm"
                  className="p-2 text-2xl"
                  onPress={() =>
                    table.setPageIndex(table.getPageCount() - 1)
                  }
                  isDisabled={!table.getCanNextPage()}
                >
                  <TbPlayerTrackNext />
                </Button>
              </div>

              <span className="flex items-center gap-1 text-xl text-gray-600 font-bold">
                <div>Pág</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1}/
                  {table.getPageCount()}
                </strong>
              </span>
            </div>
          </div>

          <EditQuestionModal
            isModalOpenState={isEditModalOpen}
            handleCloseModalMethod={() => {
              setIsEditModalOpen(false);
              setSelectedQuestion(null);
            }}
            selectedQuestion={selectedQuestion}
          />
        </>
      )}
    </div>
  );
};

export default ReportedQuestionsTable;
