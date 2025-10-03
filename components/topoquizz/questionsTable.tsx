import { useState, useReducer, useEffect } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,

} from "@tanstack/react-table"

import { QuestionData } from "@/interfaces/topoquizz"
interface QuestionsTableProps {
    questionsData:QuestionData[]
}

// type Question = {
//     answer:number,
//     difficult:number 
//     enable:boolean,
//     explanation:string,
//     options:string[],
//     question:string
//     createdAt:Date,
// }


const QuestionsTable: React.FC<QuestionsTableProps> = ({questionsData}) => {

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
      columnHelper.accessor(
        'difficult',{
          header:()=>'Dificultad',
          cell:info=> info.getValue(),
          footer:info=>info.column.id
        }
      ),
      columnHelper.accessor(
        'correctAnswer',{
            header:()=>'Respuesta',
            cell:info=> info.getValue(),
            footer:info=>info.column.id
          }
      ),
      columnHelper.accessor(
        'options',{
            header:()=>'Opciones',
            cell:info=> info.getValue()?.join(', ') || '-',
            footer:info=>info.column.id
          }
      ),
      columnHelper.accessor(
        'enable',{
            header:()=>'Activa',
            cell:info=> info.getValue() ? 'Sí' : 'No',
            footer:info=>info.column.id
          }
      )

    ]
  
  const rerender = useReducer(() => ({}), {})[1]

  const [tableData, setTableData] = useState(()=>[...questionsData])

  useEffect(() => {
    setTableData(questionsData)
  }, [questionsData])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
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
      <button onClick={() => rerender()} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md">
        Rerender
      </button>
    </div>
  );
}
 
export default QuestionsTable;