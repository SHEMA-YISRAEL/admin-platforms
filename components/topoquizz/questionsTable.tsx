import { useState, useReducer, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Chip, Button, Switch } from "@heroui/react"
import { QuestionData } from "@/interfaces/topoquizz"

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
        footer: info => info.column.id
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
            header:()=>'Activa',
            cell:info=> {return <Switch defaultSelected/>},
            footer:info=>info.column.id
          }
      ),
      columnHelper.display({
        id: 'action',
        header: () => 'Action',
        cell: info => { return <Button isIconOnly color="warning"> <CiEdit /></Button>},
        footer:info=>info.column.id
      }),

    ]
  
  // const rerender = useReducer(() => ({}), {})[1]

  const [tableData, setTableData] = useState(()=>[...questionsData])

  useEffect(() => {
    setTableData(questionsData)
  }, [questionsData])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
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
    </div>
  );
}
 
export default QuestionsTable;