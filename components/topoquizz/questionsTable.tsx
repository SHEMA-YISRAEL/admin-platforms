import { useState, useReducer } from "react"
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  
} from "@tanstack/react-table"

interface QuestionsTableProps {
    data:Question[]
}

type Question = {
    answer:number,
    difficult:number 
    enable:boolean,
    explanation:string,
    options:string[],
    question:string
    createdAt:Date,
}


const QuestionsTable: React.FC<QuestionsTableProps> = ({data}) => {

    const columnHelper = createColumnHelper<Question>()

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
        'answer',{
            header:()=>'Respuesta',
            cell:info=> info.getValue(),
            footer:info=>info.column.id
          }
      ),
      columnHelper.accessor(
        'answer',{
            header:()=>'Opciones',
            cell:info=> info.getValue(), //mostrar lista de opciones
            footer:info=>info.column.id
          }
      )

    ]
  
  const rerender = useReducer(() => ({}), {})[1]
  
  const [tableData, setTableData] = useState(()=>[...data])
  const table = useReactTable({
    tableData,
    columns,
    getCore_RowModel:getCoreRowModel()
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