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
import { BsTranslate } from "react-icons/bs";

import { usePathname, useRouter} from 'next/navigation'
import { useAuth } from "@/app/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserPermissions } from "@/interfaces/topoquizz";
import { hasPermission } from "@/lib/firebase/auth";
import { usePermissions } from "@/app/hooks/usePermissions";

interface NavBarProps {

}

// const checkTranslatePermission = (permissions?: UserPermissions) : boolean =>{
// 	if(!permissions) return false
// 	return hasPermission(permissions, 'translateEnglish')
// }

const UserMenu = () =>{

	const { logout } = useAuth()
	
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
          <DropdownItem onClick={()=>logout()} key="logout" color="danger">
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
			</Dropdown>
		</>
	)
}

const NavBarCustom: React.FC<NavBarProps> = () => {
	const { userData } = useAuthContext();
	const pathname = usePathname()
	const router = useRouter()
	
	const {translateEnglish} = usePermissions()

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
            {/* <DropdownItem
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
            </DropdownItem> */}

						<DropdownItem
              key="traducciones"
              description="Edicion de las versiones traducidas de las preguntas"
              startContent={<BsTranslate />}
							onClick={()=> router.push('/topoquizz/translate')}
            >
              Traducciones
            </DropdownItem>
          </DropdownMenu>
				</Dropdown>
				
				{
					translateEnglish?
						<NavbarItem>
							<Link aria-current="page" color="secondary" href="/neurapp" 
								className={`${pathname.includes('/neurapp')?"text-amber-400":""}`}
							>
								NeurApp
							</Link>
						</NavbarItem> :<></>
				}

			</NavbarContent>

			<NavbarContent justify="end">
				<UserMenu/>
			</NavbarContent>
		</Navbar>
	);
}

export default NavBarCustom;