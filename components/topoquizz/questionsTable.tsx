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

import { Chip, Button, Switch, addToast } from "@heroui/react"

import { QuestionData } from "@/interfaces/topoquizz"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"

import { CiEdit } from "react-icons/ci";
import EditQuestionModal from "./modals/editQuestion"
import NewQuestionModal from "./modals/newQuestion"

interface QuestionsTableProps {
  questionsData:QuestionData[]
  isNewQuestionModalOpen?: boolean
  onCloseNewQuestion?: () => void
  lessonId?: string
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({
  questionsData,
  isNewQuestionModalOpen = false,
  onCloseNewQuestion,
  lessonId = ""
  }) => {

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
        'question',{
            header:()=>'Pregunta',
            cell:info=> info.getValue(),
            footer:info=>info.column.id
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
        'options',{
            header:()=>'Opciones',
            cell:info=> {
              const options = info.getValue()
              const correctIndex = info.row.original.answer
              return options && options.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className={index === correctIndex ? 'bg-green-200 px-2 py-1 rounded' : ''}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              ) : '-'
            },
            footer:info=>info.column.id
          }
      ),
      columnHelper.accessor(
        'explanation',{
            header:()=>'Explicacion',
            cell:info=> info.getValue(),
            footer:info=>info.column.id
          }
      ),
      columnHelper.accessor(
        'enable',{
            header:()=>'Estado',
            cell:(info) => {
              const handleSwitchChange = async (isSelected: boolean) => {
                const questionId = info.row.original.id
                const question = info.row.original.question
                try {
                  const questionRef = doc(db, "questions", questionId)
                  await updateDoc(questionRef, {
                    enable: isSelected
                  })
                  addToast({
                    title: `${isSelected? "Habilitado":"Deshabilitado"}`,
                    description:`Pregunta: ${question} - ha sido ${isSelected? "HABILITADA":"DESHABILITADA"}`
                  });
                  console.log(`Pregunta ${questionId} actualizada a ${isSelected}`)
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
            footer:info=>info.column.id
          }
      ),
      columnHelper.display({
        id: 'action',
        header: () => 'Action',
        cell: info => {
          return (
            <Button
              isIconOnly
              color="warning"
              onClick={() => handleOpenModal(info.row.original)}
            >
              <CiEdit size={30}/>
            </Button>
          )
        },
        footer:info=>info.column.id
      }),

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
  const [tableData, setTableData] = useState(()=>[...questionsData])
  const [sorting, setSorting] = useState<SortingState>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null)


  useEffect(() => {
    setTableData(questionsData)
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
      <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">

        <thead className="bg-gradient-to-r from-amber-500 to-amber-600">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-amber-50 transition-colors duration-150">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* <tfoot className="bg-gray-50">
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
      </table>
      <div className="h-4" />
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => table.setPageIndex(0)}
            isDisabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            size="sm"
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            isDisabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </div>
        <span className="flex items-center gap-1 text-sm text-gray-700">
          <div>Página</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </strong>
        </span>
      </div>

      <EditQuestionModal
        isModalOpenState={isModalOpen}
        handleCloseModalMethod={handleCloseModal}
        selectedQuestion={selectedQuestion}
      />

      <NewQuestionModal
        isModalOpenState={isNewQuestionModalOpen}
        handleCloseModalMethod={onCloseNewQuestion || (() => {})}
        lessonId={lessonId}
      />
    </div>
  );
}

export default QuestionsTable;