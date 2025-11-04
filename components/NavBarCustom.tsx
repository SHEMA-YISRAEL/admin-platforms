'use client'

import { 
	User, 
	Dropdown,
	DropdownTrigger, 
	DropdownMenu, 
	DropdownItem,
	Navbar, NavbarBrand, Button, NavbarItem, NavbarContent, Avatar
} from "@heroui/react";


import Link from "next/link";

import { FaAngleDown, FaBook} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import { usePathname, useRouter} from 'next/navigation'

interface NavBarProps {

}

const UserMenu = () =>{

	return(
		<>
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
						<div className="flex cursor-pointer items-center gap-3">
							<User
								avatarProps={{
									src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
								}}
								description="Pasante"
								name="Valeria Claros"
							/>
							<FaAngleDown/>
						</div>
				</DropdownTrigger>
				<DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem key="help_and_feedback">Permisos</DropdownItem>
          <DropdownItem key="logout" color="danger">
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
			</Dropdown>
		</>
	)
}

const NavBarCustom: React.FC<NavBarProps> = () => {
	const pathname = usePathname()
	const router = useRouter()
	// console.log('pathname', pathname)
	// const routes = [
	// 	{
	// 		label: "TopoQuizz",
	// 		path: '/topoquizz'
	// 	},
	// 	{
	// 		label: "NeurApp",
	// 		path: '/neurapp'
	// 	}
	// ]

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
            <DropdownItem
              key="dashboard"
              description="Metricas de la aplicacion con informción general de la misma"
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
          </DropdownMenu>
				</Dropdown>

				<NavbarItem>
          <Link aria-current="page" color="secondary" href="/neurapp" 
						className={`${pathname.includes('/neurapp')?"text-amber-400":""}`}
					>
            NeurApp
          </Link>
        </NavbarItem>
			</NavbarContent>

			<NavbarContent justify="end">
				<UserMenu/>
			</NavbarContent>
		</Navbar>
	);
}

export default NavBarCustom;