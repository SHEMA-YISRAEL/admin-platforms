'use client'

import { useState } from "react";
import { User, Listbox, ListboxItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@heroui/react";
import Link from "next/link";
import { FaAngleDown, FaAngleUp} from "react-icons/fa";

import { usePathname } from 'next/navigation'

interface NavBarProps {

}

const UserMenu = () =>{
	// const [isDown, setIsDown] = useState(false)

	return(
		<>
			<Dropdown placement="bottom-end">
				<DropdownTrigger
					// className="flex items-center cursor-pointer gap-2 relative" 
					// onClick={()=> setIsDown(!isDown)}
				>
						<User
							avatarProps={{
								src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
							}}
							description="Pasante"
							name="Valeria Claros"
						/>
						{/* {
							isDown? <FaAngleDown/> : <FaAngleUp/> 
						}
						{
							!isDown?
								<div className="absolute bg-black -bottom-35 left-0 w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200">
									<Listbox aria-label="Actions" onAction={(key) => alert(key)}>
										<ListboxItem key="new">Ver perfil</ListboxItem>
										<ListboxItem key="copy">Mensajes</ListboxItem>
										<ListboxItem key="logout" className="text-danger" color="danger">
											Cerrar sesión
										</ListboxItem>
									</Listbox> 
								</div>: <></> 
						} */}
				</DropdownTrigger>
				<DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
          <DropdownItem key="logout" color="danger">
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
			</Dropdown>
		</>
	)
}


const NavBar: React.FC<NavBarProps> = () => {
	const pathname = usePathname()
	console.log('pathname', pathname)
	const routes = [
		{
			label: "TopoQuizz",
			path: '/topoquizz'
		},
		{
			label: "NeurApp",
			path: '/neurapp'
		}
	]

	return (
		<div className="bg-black p-5 text-white font-bold flex justify-between">
			<section className="grid content-center">
				<h2 className="">ADMIN PANEL</h2>
			</section>
			<section className="flex flex-row gap-5">
				{
					routes.map((element, index) => {
						return <p
							className={`grid content-center ${pathname.includes(element.path) ? "text-yellow-300" : ""}`}
							key={index}>
							<Link href={element.path}>
								{element.label}
							</Link>
						</p>
					})
				}
				{/* <Button color="danger">Cerrar Sesion</Button> */}
				<UserMenu/>
				
			</section>
		</div>
	);
}

export default NavBar;