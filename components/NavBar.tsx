'use client'

import { Button } from "@heroui/react";
import Link from "next/link";

import { usePathname } from 'next/navigation'

interface NavBarProps {
    
}
 
const NavBar: React.FC<NavBarProps> = () => {
    const pathname = usePathname()
    console.log('pathname', pathname)
    const routes = [
        {
            label: "TopoQuizz",
            path:'/topoquizz'
        },
        {
            label: "NeurApp",
            path:'/neurapp'
        }
    ]

    return (
        <div className="bg-black p-5 text-white font-bold flex justify-between">
            <section className="grid content-center">
                <h2 className="">ADMIN PANEL</h2>
            </section>
            <section className="flex flex-row gap-5">
                {
                    routes.map((element, index)=>{
                        return <p 
                            className={`grid content-center ${pathname.includes(element.path)?"text-yellow-300":""}`} 
                            key={index}>
                            <Link href={element.path}>
                                {element.label}
                            </Link>
                        </p>
                    })
                }
                <Button color="danger">Cerrar Sesion</Button>
            </section>
        </div>
    );
}
 
export default NavBar;