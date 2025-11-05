import { useState, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"

import { TbPlayerTrackNext, TbPlayerTrackPrev} from "react-icons/tb"
import { MdSkipPrevious, MdSkipNext  } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

import { Chip, Button, Switch, addToast } from "@heroui/react"
import { QuestionData } from "@/interfaces/topoquizz"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"
import { CiEdit } from "react-icons/ci";
import EditQuestionModal from "./modals/editQuestion"
import { Spinner } from "@heroui/react"

interface QuestionsTableProps {
  questionsData: QuestionData[],
  isLoadingDataTable: boolean
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({ questionsData, isLoadingDataTable }) => {

  const difficultyConfig = {
    1: { label: "Fácil", color: "success" as const },
    2: { label: "Medio", color: "warning" as const },
    3: { label: "Difícil", color: "danger" as const }
  }

  const columnHelper = createColumnHelper<QuestionData>()

  const columns = [
    columnHelper.display({
      id: 'number',
      header: () => '#',
      cell: info => info.row.index + 1,
    }),
    columnHelper.accessor(
      'question', {
      header: () => 'Pregunta',
      cell: info => {
        const text = info.getValue()
        return (
          <div className="max-w-md font-medium">
            {text}
          </div>
        )
      },
      footer: info => info.column.id
    }
    ),
    columnHelper.accessor('difficult', {
      header: () => 'Dificultad',
      cell: (info) => {
        const difficultyId = info.getValue() as 1 | 2 | 3
        const config = difficultyConfig[difficultyId]

        return config ? (
          <Chip size="sm" color={config.color}>
            {config.label}
          </Chip>
        ) : null
      },
      footer: info => info.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor(
      'options', {
      header: () => 'Opciones',
      cell: info => {
        const options = info.getValue()
        const correctIndex = info.row.original.answer
        return options && options.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 text-xs min-w-[300px]">
            {options.map((option, index) => (
              <div
                key={index}
                className={`px-2 py-1 rounded border ${
                  index === correctIndex
                    ? 'bg-green-200 border-green-400 font-semibold'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="font-bold">{index + 1}.</span> {option}
              </div>
            ))}
          </div>
        ) : '-'
      },
      footer: info => info.column.id
    }
    ),
    columnHelper.accessor(
      'explanation', {
      header: () => 'Explicacion',
      cell: info => {
        const text = info.getValue()
        return text ? (
          <div className="max-w-xs" title={text}>
            {text}
          </div>
        ) : '-'
      },
      footer: info => info.column.id
    }
    ),
    columnHelper.accessor(
      'enable', {
      header: () => 'Estado',
      cell: (info) => {
        const handleSwitchChange = async (isSelected: boolean) => {
          const questionId = info.row.original.id
          const question = info.row.original.question
          try {
            const questionRef = doc(db, "questions", questionId)
            await updateDoc(questionRef, {
              enable: isSelected
            })
            addToast({
              title: `${isSelected ? "Habilitado" : "Deshabilitado"}`,
              description: `Pregunta: ${question} - ha sido ${isSelected ? "HABILITADA" : "DESHABILITADA"}`
            });
            // console.log(`Pregunta ${questionId} actualizada a ${isSelected}`)
          } catch (error) {
            console.error('Error al actualizar estado:', error)
          }
        }

        return (
          <Switch
            defaultSelected={info.getValue()}
            onValueChange={handleSwitchChange}
          />
        )
      },
      footer: info => info.column.id
    }
    ),
    columnHelper.accessor(
      'updatedAt', {
        header: () => 'Modificado',
        cell: info => {
          const date = info.getValue()
          return date ? (
            <div className="whitespace-nowrap text-xs">
              {date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              })}
              <br/>
              <span className="text-gray-500">
                {date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ) : '-'
        },
        footer: info => info.column.id,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.updatedAt
          const dateB = rowB.original.updatedAt
          if (!dateA) return 1
          if (!dateB) return -1
          return dateA.getTime() - dateB.getTime()
        }
      }
    ),
    columnHelper.display({
      id: 'action',
      header: () => 'Acciones',
      cell: info => {
        return (
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              color="warning"
              onPress={() => handleOpenModal(info.row.original)}
            >
              <CiEdit size={18} />
            </Button>

            <Button
              isIconOnly
              isDisabled
              size="sm"
              color="danger"
              onPress={() => console.log('eliminar')}
            >
              <RiDeleteBin6Line size={18}/>
            </Button>
          </div>
        )
      },
      footer: info => info.column.id
    }),

    columnHelper.display({
      id: 'lastAuthor',
      header: () => 'Ultimo revisor / Autor',
      cell: info => info.getValue(),
    })
  ]

  // const emptyQuestionObject = {
  //   id:'',
  //   lessonId:'',
  //   createdAt:null,
  //   updatedAt:null,

  //   question: "",
  //   difficult: 1,
  //   options: ["", "", "", ""],
  //   answer: 0,
  //   explanation: "",
  //   enable: true
  // }
  const [tableData, setTableData] = useState(
    () => [...questionsData]
  )
  const [sorting, setSorting] = useState<SortingState>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null)
  const [noQuestions, setNoQuestions] = useState(false)

  useEffect(() => {
    setTableData(questionsData)
    if(questionsData.length > 0){
      setNoQuestions(false)
    } else {
      setNoQuestions(true)
    }
    // if(questionsData.length > 0){
    //   setNoQuestions(false)
    // } else {
    //   setNoQuestions(true)
    // }
  }, [questionsData])

  const handleOpenModal = (question: QuestionData) => {
    setSelectedQuestion(question)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedQuestion(null)
  }

  // const handleCreateQuestion = async () => {
  //   if (!lessonId) {
  //     addToast({
  //       title: "Error",
  //       description: "No se ha seleccionado una lección"
  //     })
  //     return
  //   }

  //   try {
  //     await addDoc(collection(db, "questions"), {
  //       question: newQuestion.question,
  //       difficult: newQuestion.difficult,
  //       options: newQuestion.options,
  //       answer: newQuestion.answer,
  //       explanation: newQuestion.explanation,
  //       enable: newQuestion.enable,
  //       lessonId: lessonId,
  //       createdAt: Timestamp.now(),
  //       updatedAt: Timestamp.now()
  //     })

  //     addToast({
  //       title: "Pregunta creada",
  //       description: "La pregunta ha sido creada exitosamente"
  //     })

  //     // Reset form
  //     setNewQuestion(emptyQuestionObject)

  //     onCloseNewQuestion?.()
  //   } catch (error) {
  //     console.error('Error al crear pregunta:', error)
  //     addToast({
  //       title: "Error",
  //       description: "No se pudo crear la pregunta"
  //     })
  //   }
  // }

  // const handleNewOptionChange = (index: number, value: string) => {
  //   const newOptions = [...newQuestion.options]
  //   newOptions[index] = value
  //   setNewQuestion({ ...newQuestion, options: newOptions })
  // }

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="h-full flex flex-col rounded-lg bg-white shadow-md border border-gray-200">
      {
        isLoadingDataTable?(
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" color="warning" />
          </div>
        ) : noQuestions?(
          <div className="flex justify-center items-center h-full text-center font-semibold text-2xl text-gray-400">
            No hay preguntas
          </div>
        ):(
        <>
          {/* Tabla con scroll interno */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full bg-white text-xs">
              <thead className="bg-gradient-to-r from-amber-500 to-amber-600 sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-tight">
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1' : ''}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )
                            }
                              
                            {
                              {
                                asc: ' ▲',
                                desc: ' ▼',
                              }
                              [header.column.getIsSorted() as string] ?? null
                            }
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-amber-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2 text-xs text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación fija en la parte inferior */}
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
                  <MdSkipPrevious/>
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
                  onPress={() => table.setPageIndex(table.getPageCount() - 1)}
                  isDisabled={!table.getCanNextPage()}
                >
                  {<TbPlayerTrackNext />}
                </Button>
              </div>

              <span className="flex items-center gap-1 text-xl text-gray-600 font-bold">
                <div>Pág</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
                </strong>
              </span>
            </div>
          </div>

          <EditQuestionModal
            isModalOpenState={isModalOpen}
            handleCloseModalMethod={handleCloseModal}
            selectedQuestion={selectedQuestion}
          />
        </>
        )
      }
    </div>
  );
}

export default QuestionsTable;