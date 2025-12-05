'use client'

import {
	User,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Navbar, NavbarBrand, Button, NavbarItem, NavbarContent
} from "@heroui/react";

import Link from "next/link";

import { FaAngleDown } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BsTranslate } from "react-icons/bs";
import { FaBook } from "react-icons/fa";
import { BiSolidBookContent } from "react-icons/bi";

import { usePathname, useRouter} from 'next/navigation'
import { useAuth } from "@/app/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserData } from "@/interfaces/topoquizz";
import useMaterias from "@/app/hooks/neurapp/useMaterias";
// import { usePermissions } from "@/app/hooks/usePermissions";


// const checkTranslatePermission = (permissions?: UserPermissions) : boolean =>{
// 	if(!permissions) return false
// 	return hasPermission(permissions, 'translateEnglish')
// }

interface UserMenu{

	userData:UserData|null
}

const UserMenu: React.FC<UserMenu> = ( {userData}) =>{

	const { logout } = useAuth()
	
	return(
		<>
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
						<div className="flex cursor-pointer items-center gap-3">
							
							<User
								// avatarProps={
								// 	{
								// 		src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
								// 	}
								// }
								description={userData?.userName}
								name={userData?.email}
							/>
							<FaAngleDown/>
						</div>
				</DropdownTrigger>
				<DropdownMenu aria-label="Profile Actions" variant="flat">
          {/* <DropdownItem key="help_and_feedback">Permisos</DropdownItem> */}
          <DropdownItem onClick={()=>logout()} key="logout" color="danger">
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
			</Dropdown>
		</>
	)
}

const NavBarCustom = () => {

	const pathname = usePathname()
	const router = useRouter()
	const { userData } = useAuthContext();

	// Solo cargar materias si el usuario es admin
	const shouldLoadMaterias = userData?.rol === "admin";
	const { materias, loading: loadingMaterias } = useMaterias();

	return (
		<Navbar className="bg-black p-5 text-white font-bold">
			<NavbarBrand>
				<h2 className="text-2xl">ADMIN PANEL</h2>
			</NavbarBrand>
			
			<NavbarContent className="hidden sm:flex gap-4 text-white" justify="center">
				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								disableRipple
								className={`p-0 bg-transparent data-[hover=true]:bg-transparent text-1xl font-bold 
									px-2 ${pathname.includes('/topoquizz')?"text-amber-400":""}`}
								endContent={<FaAngleDown/>}
								radius="sm"
								color="secondary"
							>
								Topoquizz
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
            aria-label="topoquizz options"
            itemClasses={{
              base: "gap-4",
            }}
          >
						{
							(userData?.rol==="translator")?(<DropdownItem
									key="traducciones"
									description="Edicion de las versiones traducidas de las preguntas"
									startContent={<BsTranslate />}
									onClick={()=> router.push('/topoquizz/translate')}
								>
								Traducciones
							</DropdownItem>):<></>
						}
						{
							(userData?.rol==="admin")?<>
								<DropdownItem
									key="dashboard"
									description="Metricas de la aplicacion con información general de la misma"
									startContent={<MdDashboard/>}
									onClick={() => router.push('/topoquizz/dashboard')}
								>
									Dashboard
								</DropdownItem>
								<DropdownItem
									key="contenido"
									description="Contenido de la Aplicacion, Temas, Lecciones y preguntas"
									startContent={<FaBook/>}
									onClick={()=> router.push('/topoquizz/content')}
								>
									Contenido
								</DropdownItem>
							</>:<></>
            }
          </DropdownMenu>
				</Dropdown>

				{
					userData?.rol === "admin" ? (
						<Dropdown>
							<NavbarItem>
								<DropdownTrigger>
									<Button
										disableRipple
										className={`p-0 bg-transparent data-[hover=true]:bg-transparent text-1xl font-bold
											px-2 ${pathname.includes('/neurapp') ? "text-amber-400" : ""}`}
										endContent={<FaAngleDown />}
										radius="sm"
										color="secondary"
									>
										NeurApp
									</Button>
								</DropdownTrigger>
							</NavbarItem>
							<DropdownMenu
								aria-label="neurapp options"
								itemClasses={{
									base: "gap-4",
								}}
							>
								<DropdownItem
									key="materias-header"
									description="Seleccionar materia"
									startContent={<FaBook />}
									showDivider
									isReadOnly
									className="cursor-default opacity-100"
								>
									<span className="font-bold">Materias</span>
								</DropdownItem>
								{loadingMaterias ? (
									<DropdownItem key="loading" isReadOnly>
										Cargando materias...
									</DropdownItem>
								) : (
									<>
										{materias.map((materia) => (
											<DropdownItem
												key={materia.slug}
												className="pl-8"
												onClick={() => router.push(`/neurapp/${materia.slug}`)}
											>
												{materia.title}
											</DropdownItem>
										))}
									</>
								)}
								<DropdownItem
									key="contenido"
									description="Gestión de contenido de NeurApp"
									startContent={<BiSolidBookContent />}
									onClick={() => router.push('/neurapp/content')}
									showDivider
									className="mt-2"
								>
									Contenido
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					) : <></>
				}

			</NavbarContent>

			<NavbarContent justify="end">
				<UserMenu userData={userData} />
			</NavbarContent>
		</Navbar>
	);
}

export default NavBarCustom;