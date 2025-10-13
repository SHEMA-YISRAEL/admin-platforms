'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideBarProps {

}

const SideBar: React.FC<SideBarProps> = () => {

  const pathname = usePathname()
  const actualApp = pathname.split('/')[1]
  const items = [
    {
      path: 'dashboard',
      label: 'Dashboard',
      icon: null
    },
    {
      path: 'content',
      label: 'Contenido',
      icon: null
    }
  ]
  return (
    <>
      <div className="bg-blue-700 text-white font-bold">
        <ul>
          {
            items.map((element, index) => {
              console.log(`${actualApp}/${element.path}`)
              return (
                <li key={index} >
                  <Link
                    className="cursor-pointer"
                    href={`/${actualApp}/${element.path}`}>
                    {element.label}
                  </Link>
                </li>
              )
            })
          }
        </ul>

      </div>

    </>
  );
}

export default SideBar;