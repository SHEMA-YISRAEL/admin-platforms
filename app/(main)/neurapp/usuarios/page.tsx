'use client';

import { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Card, CardBody, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  UserIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import useUsers, { UserListData } from "@/app/hooks/neurapp/useUsers";

export default function UsersPage() {
  const { users, loading, error } = useUsers();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserClick = (user: UserListData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

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
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {info.getValue()} {lastName}
              </span>
              <span className="text-xs text-gray-500">{info.row.original.email}</span>
            </div>
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('categoryId', {
      header: () => <span className="text-xs uppercase tracking-wider">Categoría</span>,
      cell: info => {
        const categoryId = info.getValue();
        const isFree = categoryId === 1 || categoryId === 2;
        const isSubscribed = categoryId === 3;

        return (
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Chip
                size="sm"
                color="success"
                variant="flat"
                startContent={<CheckBadgeIcon className="w-4 h-4" />}
                className="font-semibold"
              >
                Premium
              </Chip>
            ) : isFree ? (
              <Chip
                size="sm"
                color="default"
                variant="flat"
                startContent={<StarIcon className="w-4 h-4" />}
              >
                Free
              </Chip>
            ) : (
              <Chip
                size="sm"
                color="default"
                variant="flat"
              >
                Sin categoría
              </Chip>
            )}
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('dateOfBirth', {
      header: () => <span className="text-xs uppercase tracking-wider">Fecha de Nacimiento</span>,
      cell: info => {
        const date = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {date ? new Date(date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : <span className="text-gray-400">No especificada</span>}
            </span>
          </div>
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
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-700">{timeAgo}</span>
              <span className="text-xs text-gray-400">
                {date.toLocaleDateString('es-ES')}
              </span>
            </div>
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
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const filteredUsersCount = useMemo(() => {
    return table.getFilteredRowModel().rows.length;
  }, [table]);

  return (
    <div className="flex w-full flex-col px-4">
      <div className="mt-4">
        {/* Page Title */}
        <div className="mb-6 2xl:ml-40">
          <h1 className="text-3xl font-bold text-gray-800">Usuarios NeurApp</h1>
          <p className="text-gray-600 mt-2">
            {loading ? 'Cargando...' : `Total de usuarios registrados: ${users.length}`}
          </p>
        </div>

        {/* Buscador */}
        {!loading && !error && (
          <div className="mb-6 2xl:mx-40">
            <Input
              isClearable
              placeholder="Buscar por nombre, apellido o email..."
              startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
              value={globalFilter ?? ''}
              onClear={() => setGlobalFilter('')}
              onValueChange={setGlobalFilter}
              className="max-w-md"
              size="lg"
            />
            {globalFilter && (
              <p className="mt-2 text-sm text-gray-600">
                Se encontraron <span className="font-semibold">{filteredUsersCount}</span> resultados
              </p>
            )}
          </div>
        )}

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
                                      {header.column.getIsSorted() === 'asc' ? (
                                        <ChevronUpIcon className="w-4 h-4" />
                                      ) : header.column.getIsSorted() === 'desc' ? (
                                        <ChevronDownIcon className="w-4 h-4" />
                                      ) : (
                                        <ChevronUpDownIcon className="w-4 h-4" />
                                      )}
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
                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => handleUserClick(row.original)}
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
                      isIconOnly
                    >
                      <ChevronDoubleLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.previousPage()}
                      isDisabled={!table.getCanPreviousPage()}
                      isIconOnly
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
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
                      isIconOnly
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      isDisabled={!table.getCanNextPage()}
                      isIconOnly
                    >
                      <ChevronDoubleRightIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Mostrando{' '}
                    <span className="font-semibold text-gray-900">
                      {table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1}
                      {' '}-{' '}
                      {Math.min(
                        table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                        filteredUsersCount
                      )}
                    </span>
                    {' '}de{' '}
                    <span className="font-semibold text-gray-900">{filteredUsersCount}</span>
                    {' '}usuarios
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de detalles del usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedUser?.name} {selectedUser?.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 font-normal">{selectedUser?.email}</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      ID de Usuario
                    </span>
                    <span className="text-base text-gray-900 font-medium">
                      #{selectedUser?.id}
                    </span>
                  </div>

                  {/* Categoría */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Categoría
                    </span>
                    <div className="flex items-center">
                      {selectedUser?.categoryId === 3 ? (
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          startContent={<CheckBadgeIcon className="w-4 h-4" />}
                          className="font-semibold"
                        >
                          Premium
                        </Chip>
                      ) : selectedUser?.categoryId === 1 || selectedUser?.categoryId === 2 ? (
                        <Chip
                          size="sm"
                          color="default"
                          variant="flat"
                          startContent={<StarIcon className="w-4 h-4" />}
                        >
                          Free
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          color="default"
                          variant="flat"
                        >
                          Sin categoría
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Nombre
                    </span>
                    <span className="text-base text-gray-900">
                      {selectedUser?.name || <span className="text-gray-400">No especificado</span>}
                    </span>
                  </div>

                  {/* Apellido */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Apellido
                    </span>
                    <span className="text-base text-gray-900">
                      {selectedUser?.lastName || <span className="text-gray-400">No especificado</span>}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Correo Electrónico
                    </span>
                    <span className="text-base text-gray-900">
                      {selectedUser?.email || <span className="text-gray-400">No especificado</span>}
                    </span>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Fecha de Nacimiento
                    </span>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-base text-gray-900">
                        {selectedUser?.dateOfBirth ? (
                          new Date(selectedUser.dateOfBirth).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        ) : (
                          <span className="text-gray-400">No especificada</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ID de Categoría */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      ID de Categoría
                    </span>
                    <span className="text-base text-gray-900">
                      {selectedUser?.categoryId ?? <span className="text-gray-400">No asignada</span>}
                    </span>
                  </div>

                  {/* Fecha de Registro */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Fecha de Registro
                    </span>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-base text-gray-900">
                        {selectedUser?.createdAt ? (
                          new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-gray-400">No disponible</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Última Actualización */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Última Actualización
                    </span>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-base text-gray-900">
                        {selectedUser?.updatedAt ? (
                          new Date(selectedUser.updatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-gray-400">No disponible</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={onClose}
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
