'use client';

import { useState } from 'react';
import {
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Navbar,
  NavbarBrand,
  Button,
  NavbarItem,
  NavbarContent,
} from '@heroui/react';

import {
  FaAngleDown,
  FaLayerGroup,
  FaBook,
  FaUsers,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaFlag,
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { BsTranslate } from 'react-icons/bs';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData } from '@/interfaces/topoquizz';
import useMaterias from '@/app/hooks/neurapp/useMaterias';
import MateriaModal from '@/components/neurapp/MateriaModal';

interface UserMenu {
  userData: UserData | null;
}

const UserMenu: React.FC<UserMenu> = ({ userData }) => {
  const { logout } = useAuth();

  return (
    <>
      <Dropdown placement='bottom-end'>
        <DropdownTrigger>
          <div className='flex cursor-pointer items-center gap-3'>
            <User description={userData?.userName} name={userData?.email} />
            <FaAngleDown />
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label='Profile Actions' variant='flat'>
          <DropdownItem onClick={() => logout()} key='logout' color='danger'>
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

const NavBarCustom = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useAuthContext();
  const { materias, loading: loadingMaterias } = useMaterias();
  const [materiaModalOpen, setMateriaModalOpen] = useState(false);

  return (
    <>
      <Navbar className='bg-black p-5 text-white font-bold'>
        <NavbarBrand>
          <h2 className='text-2xl'>ADMIN PANEL</h2>
        </NavbarBrand>

        <NavbarContent
          className='hidden sm:flex gap-4 text-white'
          justify='center'
        >
          <Dropdown>
            <NavbarItem>
              <DropdownTrigger>
                <Button
                  disableRipple
                  className={`p-0 bg-transparent data-[hover=true]:bg-transparent text-1xl font-bold 
									px-2 ${pathname.includes('/topoquizz') ? 'text-amber-400' : ''}`}
                  endContent={<FaAngleDown />}
                  radius='sm'
                  color='secondary'
                >
                  Topoquizz
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu
              aria-label='topoquizz options'
              itemClasses={{
                base: 'gap-4',
              }}
            >
              {userData?.rol === 'translator' ? (
                <DropdownItem
                  key='traducciones'
                  description='Edicion de las versiones traducidas de las preguntas'
                  startContent={<BsTranslate />}
                  onClick={() => router.push('/topoquizz/translate')}
                >
                  Traducciones
                </DropdownItem>
              ) : (
                <></>
              )}
              {userData?.rol === 'admin' ? (
                <>
                  <DropdownItem
                    key='dashboard'
                    description='Metricas de la aplicacion con información general de la misma'
                    startContent={<MdDashboard />}
                    onClick={() => router.push('/topoquizz/dashboard')}
                  >
                    Dashboard
                  </DropdownItem>
                  <DropdownItem
                    key='contenido'
                    description='Contenido de la Aplicacion, Temas, Lecciones y preguntas'
                    startContent={<FaBook />}
                    onClick={() => router.push('/topoquizz/content')}
                  >
                    Contenido
                  </DropdownItem>
                  <DropdownItem
                    key='reported'
                    description='Gestión de preguntas reportadas por usuarios'
                    startContent={<FaFlag />}
                    onClick={() => router.push('/topoquizz/reported')}
                  >
                    Preguntas Reportadas
                  </DropdownItem>
                </>
              ) : (
                <></>
              )}
            </DropdownMenu>
          </Dropdown>

          {userData?.rol === 'admin' ? (
            <Dropdown>
              <NavbarItem>
                <DropdownTrigger>
                  <Button
                    disableRipple
                    className={`p-0 bg-transparent data-[hover=true]:bg-transparent text-1xl font-bold
											px-2 ${pathname.includes('/neurapp') ? 'text-amber-400' : ''}`}
                    endContent={<FaAngleDown />}
                    radius='sm'
                    color='secondary'
                  >
                    NeurApp
                  </Button>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu
                aria-label='neurapp options'
                itemClasses={{
                  base: 'gap-4',
                }}
              >
                <DropdownItem
                  key='usuarios'
                  description='Gestión de usuarios del sistema'
                  startContent={<FaUsers />}
                  onClick={() => router.push('/neurapp/usuarios')}
                >
                  Usuarios
                </DropdownItem>
                <DropdownItem
                  key='tips'
                  startContent={<FaLayerGroup />}
                  description='Gestión de tips'
                  onClick={() => router.push('/neurapp/tips')}
                >
                  Tips
                </DropdownItem>
                <DropdownItem
                  key='reported'
                  startContent={<FaFlag />}
                  description='Preguntas reportadas por usuarios'
                  onClick={() => router.push('/neurapp/reported-evaluation')}
                >
                  Preguntas Reportadas (Evaluación)
                </DropdownItem>
                <DropdownItem
                  key='nueva-materia'
                  description='Crear una nueva materia'
                  startContent={<FaPlus />}
                  showDivider
                  onClick={() => setMateriaModalOpen(true)}
                >
                  <span className='font-bold'>Agregar nueva materia</span>
                </DropdownItem>
                {loadingMaterias ? (
                  <DropdownItem key='loading' isReadOnly>
                    Cargando materias...
                  </DropdownItem>
                ) : (
                  <>
                    {materias.map((materia) => (
                      <DropdownItem
                        key={materia.slug}
                        className={`pl-8 ${pathname.includes(`/neurapp/${materia.slug}`) ? 'bg-gray-400/30' : ''}`}
                        onClick={() => router.push(`/neurapp/${materia.slug}`)}
                      >
                        <span className='flex items-center gap-2'>
                          {materia.visibility ? (
                            <FaEye className='text-green-500 text-sm' />
                          ) : (
                            <FaEyeSlash className='text-gray-400 text-sm' />
                          )}
                          {materia.title}
                        </span>
                      </DropdownItem>
                    ))}
                  </>
                )}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <></>
          )}
        </NavbarContent>

        <NavbarContent justify='end'>
          <UserMenu userData={userData} />
        </NavbarContent>
      </Navbar>

      {materiaModalOpen && (
        <MateriaModal
          isOpen={materiaModalOpen}
          onClose={() => setMateriaModalOpen(false)}
          materia={{ type: 'create', data: null }}
        />
      )}
    </>
  );
};

export default NavBarCustom;
