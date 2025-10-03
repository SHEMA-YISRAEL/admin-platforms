import { useState, useReducer, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { Chip, Button, Switch, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem } from "@heroui/react"
import { QuestionData } from "@/interfaces/topoquizz"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/utils/firebase"

import { CiEdit } from "react-icons/ci";
interface QuestionsTableProps {
  questionsData:QuestionData[]
}

const QuestionsTable: React.FC<QuestionsTableProps> = ({questionsData}) => {

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
  
  // const rerender = useReducer(() => ({}), {})[1]

  const [tableData, setTableData] = useState(()=>[...questionsData])
  const [sorting, setSorting] = useState<SortingState>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null)
  const [editedQuestion, setEditedQuestion] = useState({
    question: "",
    difficult: 1,
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    enable: true
  })

  useEffect(() => {
    setTableData(questionsData)
  }, [questionsData])

  const handleOpenModal = (question: QuestionData) => {
    setSelectedQuestion(question)
    setEditedQuestion({
      question: question.question,
      difficult: question.difficult,
      options: [...question.options],
      answer: question.answer,
      explanation: question.explanation,
      enable: question.enable
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedQuestion(null)
  }

  const handleSaveQuestion = async () => {
    if (!selectedQuestion) return

    try {
      const questionRef = doc(db, "questions", selectedQuestion.id)
      await updateDoc(questionRef, {
        question: editedQuestion.question,
        difficult: editedQuestion.difficult,
        options: editedQuestion.options,
        answer: editedQuestion.answer,
        explanation: editedQuestion.explanation,
        enable: editedQuestion.enable
      })

      addToast({
        title: "Pregunta actualizada",
        description: "La pregunta ha sido actualizada exitosamente"
      })

      handleCloseModal()
    } catch (error) {
      console.error('Error al actualizar pregunta:', error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar la pregunta"
      })
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options]
    newOptions[index] = value
    setEditedQuestion({ ...editedQuestion, options: newOptions })
  }

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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Editar Pregunta
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Textarea
                label="Pregunta"
                placeholder="Escribe la pregunta"
                value={editedQuestion.question}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                minRows={2}
              />

              <Select
                label="Dificultad"
                selectedKeys={[editedQuestion.difficult.toString()]}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, difficult: parseInt(e.target.value) })}
              >
                <SelectItem key="1" value="1">Fácil</SelectItem>
                <SelectItem key="2" value="2">Medio</SelectItem>
                <SelectItem key="3" value="3">Difícil</SelectItem>
              </Select>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Opciones</label>
                {editedQuestion.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      label={`Opción ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Chip
                      size="sm"
                      color={editedQuestion.answer === index ? "success" : "default"}
                      className="cursor-pointer"
                      onClick={() => setEditedQuestion({ ...editedQuestion, answer: index })}
                    >
                      {editedQuestion.answer === index ? "Correcta" : "Marcar"}
                    </Chip>
                  </div>
                ))}
              </div>

              <Textarea
                label="Explicación"
                placeholder="Escribe la explicación de la respuesta"
                value={editedQuestion.explanation}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                minRows={3}
              />

              <Switch
                isSelected={editedQuestion.enable}
                onValueChange={(value) => setEditedQuestion({ ...editedQuestion, enable: value })}
              >
                {editedQuestion.enable ? "Habilitada" : "Deshabilitada"}
              </Switch>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleSaveQuestion}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default QuestionsTable;