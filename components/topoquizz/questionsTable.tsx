import { useState, useReducer } from "react"
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
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
      <div className="p-2">
      <table>
        
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
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
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
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
        </tfoot>
      </table>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  );
}
 
export default QuestionsTable;