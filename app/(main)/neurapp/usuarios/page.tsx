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
              placeholder="Buscar por nombre"
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
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-gradient-to-t from-gray-400/80 to-purple-100/20 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {/* Header con diseño mejorado */}
              <ModalHeader className="flex flex-col gap-0 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-100 to-pink-100 pb-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {selectedUser?.categoryId === 3 && (
                        <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                          <CheckBadgeIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedUser?.name} {selectedUser?.lastName}
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">{selectedUser?.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">ID: #{selectedUser?.id}</span>
                      <span className="text-gray-300">•</span>
                      {selectedUser?.categoryId === 3 ? (
                        <Chip
                          size="sm"
                          color="success"
                          variant="flat"
                          startContent={<CheckBadgeIcon className="w-3.5 h-3.5" />}
                          className="font-semibold"
                        >
                          Usuario Premium
                        </Chip>
                      ) : selectedUser?.categoryId === 1 || selectedUser?.categoryId === 2 ? (
                        <Chip
                          size="sm"
                          color="default"
                          variant="flat"
                          startContent={<StarIcon className="w-3.5 h-3.5" />}
                        >
                          Usuario Free
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          color="warning"
                          variant="flat"
                        >
                          Sin categoría
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </ModalHeader>

              {/* Body con cards para cada sección */}
              <ModalBody className="py-3 bg-gray-50/50">
                <div className="space-y-2">
                  {/* Información Personal */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Nombre
                        </span>
                        <span className="text-base text-gray-900 font-medium block">
                          {selectedUser?.name || <span className="text-gray-400">No especificado</span>}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Apellido
                        </span>
                        <span className="text-base text-gray-900 font-medium block">
                          {selectedUser?.lastName || <span className="text-gray-400">No especificado</span>}
                        </span>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Correo Electrónico
                        </span>
                        <span className="text-base text-gray-900 font-medium block break-all">
                          {selectedUser?.email || <span className="text-gray-400">No especificado</span>}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Fecha de Nacimiento
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-base text-gray-900 font-medium">
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
                    </div>
                  </div>

                  {/* Información de Cuenta */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-purple-600" />
                      Información de Cuenta
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Categoría de Usuario
                        </span>
                        <div className="flex items-center">
                          {selectedUser?.categoryId === 3 ? (
                            <Chip
                              size="md"
                              color="success"
                              variant="flat"
                              startContent={<CheckBadgeIcon className="w-4 h-4" />}
                              className="font-semibold"
                            >
                              Premium
                            </Chip>
                          ) : selectedUser?.categoryId === 1 || selectedUser?.categoryId === 2 ? (
                            <Chip
                              size="md"
                              color="default"
                              variant="flat"
                              startContent={<StarIcon className="w-4 h-4" />}
                            >
                              Free
                            </Chip>
                          ) : (
                            <Chip
                              size="md"
                              color="warning"
                              variant="flat"
                            >
                              Sin categoría
                            </Chip>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          ID de Categoría
                        </span>
                        <span className="text-base text-gray-900 font-medium">
                          {selectedUser?.categoryId ?? <span className="text-gray-400">No asignada</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de Actividad */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-indigo-600" />
                      Actividad
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Fecha de Registro
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base text-gray-900 font-medium">
                              {selectedUser?.createdAt ? (
                                new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })
                              ) : (
                                <span className="text-gray-400">No disponible</span>
                              )}
                            </span>
                            {selectedUser?.createdAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(selectedUser.createdAt).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                          Última Actualización
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base text-gray-900 font-medium">
                              {selectedUser?.updatedAt ? (
                                new Date(selectedUser.updatedAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })
                              ) : (
                                <span className="text-gray-400">No disponible</span>
                              )}
                            </span>
                            {selectedUser?.updatedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(selectedUser.updatedAt).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>

              {/* Footer mejorado */}
              <ModalFooter className="border-t border-gray-100 bg-gray-50/50">
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  className="font-medium"
                >
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  variant="shadow"
                  onPress={onClose}
                  className="font-medium"
                >
                  Aceptar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
