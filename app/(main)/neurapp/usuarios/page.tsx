'use client';

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
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { TbPlayerTrackNext, TbPlayerTrackPrev } from "react-icons/tb";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import useUsers, { UserListData } from "@/app/hooks/neurapp/useUsers";

export default function UsersPage() {
  const { users, loading, error } = useUsers();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<UserListData>();

  const columns = [
    columnHelper.display({
      id: 'number',
      header: () => <span className="text-xs uppercase tracking-wider">#</span>,
      cell: info => (
        <span className="text-gray-500 font-medium">
          {info.row.index + 1 + (table.getState().pagination.pageIndex * table.getState().pagination.pageSize)}
        </span>
      ),
    }),
    columnHelper.accessor('name', {
      header: () => <span className="text-xs uppercase tracking-wider">Nombre Completo</span>,
      cell: info => {
        const lastName = info.row.original.lastName;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {info.getValue()} {lastName}
            </span>
            <span className="text-xs text-gray-500">{info.row.original.email}</span>
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('categoryId', {
      header: () => <span className="text-xs uppercase tracking-wider">Categoría</span>,
      cell: info => {
        const categoryId = info.getValue();
        return (
          <Chip
            size="sm"
            color={categoryId ? "primary" : "default"}
            variant="flat"
          >
            {categoryId || 'Sin categoría'}
          </Chip>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('dateOfBirth', {
      header: () => <span className="text-xs uppercase tracking-wider">Fecha de Nacimiento</span>,
      cell: info => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-700">
            {date ? new Date(date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : <span className="text-gray-400">No especificada</span>}
          </span>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: () => <span className="text-xs uppercase tracking-wider">Registrado</span>,
      cell: info => {
        const date = new Date(info.getValue());
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        let timeAgo = '';
        if (diffDays === 0) timeAgo = 'Hoy';
        else if (diffDays === 1) timeAgo = 'Ayer';
        else if (diffDays < 7) timeAgo = `Hace ${diffDays} días`;
        else if (diffDays < 30) timeAgo = `Hace ${Math.floor(diffDays / 7)} semanas`;
        else timeAgo = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">{timeAgo}</span>
            <span className="text-xs text-gray-400">
              {date.toLocaleDateString('es-ES')}
            </span>
          </div>
        );
      },
      enableSorting: true,
    }),
  ];

  const table = useReactTable({
    data: users,
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
  });

  return (
    <div className="flex w-full flex-col px-4">
      <div className="mt-4">
        {/* Page Title - Mismo estilo que materias */}
        <div className="mb-6 2xl:ml-40">
          <h1 className="text-3xl font-bold text-gray-800">Usuarios NeurApp</h1>
          <p className="text-gray-600 mt-2">
            {loading ? 'Cargando...' : `Total de usuarios registrados: ${users.length}`}
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-6 2xl:mx-40">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando usuarios...</p>
          ) : error ? (
            <Card className="shadow-lg">
              <CardBody className="gap-4 text-center py-8">
                <h2 className="text-xl font-bold text-gray-800">Error al cargar usuarios</h2>
                <p className="text-red-500">{error}</p>
                <p className="text-sm text-gray-600">
                  Asegúrate de estar autenticado con tu cuenta de admin en el sistema.
                </p>
              </CardBody>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="border-b-2 border-gray-200">
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-left font-semibold text-gray-600 bg-gray-50/50"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={
                                    header.column.getCanSort()
                                      ? 'cursor-pointer select-none flex items-center gap-2 hover:text-gray-900 transition-colors'
                                      : 'flex items-center gap-2'
                                  }
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <span className="text-gray-400">
                                      {{
                                        asc: '↑',
                                        desc: '↓',
                                      }[header.column.getIsSorted() as string] ?? '↕'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className="px-6 py-12 text-center">
                            <p className="text-gray-500">No hay usuarios registrados</p>
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map(row => (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className="px-6 py-4">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.setPageIndex(0)}
                      isDisabled={!table.getCanPreviousPage()}
                    >
                      <MdSkipPrevious size={18} />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.previousPage()}
                      isDisabled={!table.getCanPreviousPage()}
                    >
                      <TbPlayerTrackPrev size={18} />
                    </Button>

                    <div className="px-3 py-1 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.nextPage()}
                      isDisabled={!table.getCanNextPage()}
                    >
                      <TbPlayerTrackNext size={18} />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      isDisabled={!table.getCanNextPage()}
                    >
                      <MdSkipNext size={18} />
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Mostrando{' '}
                    <span className="font-semibold text-gray-900">
                      {table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1}
                      {' '}-{' '}
                      {Math.min(
                        table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                        users.length
                      )}
                    </span>
                    {' '}de{' '}
                    <span className="font-semibold text-gray-900">{users.length}</span>
                    {' '}usuarios
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
