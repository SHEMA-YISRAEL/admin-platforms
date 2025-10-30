
import getCourses from "@/lib/firebase/getCourses";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@heroui/react";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { ICoursesData } from "@/interfaces/topoquizz";

interface ISubjectListProps {
  selectedSubject: ICoursesData | undefined,
  methodSetSelectedSubject: Dispatch<SetStateAction<ICoursesData>>;
}

const SubjectsList: React.FC<ISubjectListProps> = ({ selectedSubject, methodSetSelectedSubject }) => {
  const {
    coursesData: coursesDataFromFirebase,
    loading: loadingCourses,
    error: errorGettingCoursesData
  } = getCourses()

  const [dataFromServer, setDataFromServer] = useState<ICoursesData[]>([]);

  useEffect(() => {
    if (coursesDataFromFirebase.length > 0) {
      setDataFromServer(coursesDataFromFirebase)
      methodSetSelectedSubject(coursesDataFromFirebase[0])
    }
  }, [coursesDataFromFirebase])

  return (
    <>
      <div className="m-4 rounded-2xl p-1">
        
        <div className="flex gap-2 justify-end">
          <div className="text-2xl text-center ">Materias</div>
          {
            loadingCourses ? <div>Cargando...</div> : 
            <div className="w-1/2">
              <Listbox
                value={selectedSubject} 
                onChange={methodSetSelectedSubject}
              >
                <ListboxButton
                  className={clsx(
                    'relative block w-full rounded-lg py-1.5 pr-8 pl-3 text-left text-sm/6 bg-black text-white',
                    'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                  )}
                >
                  {selectedSubject?.name}
                  <ChevronDownIcon
                    className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white"
                    aria-hidden="true"
                  />
                </ListboxButton>
                <ListboxOptions
                  anchor="bottom"
                  transition
                  className={clsx(
                    'w-(--button-width) rounded-xl border border-white/5 bg-black p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                    'transition duration-100 ease-in data-leave:data-closed:opacity-0'
                  )}
                >
                  {dataFromServer.map((element, index) => (
                    <ListboxOption
                      key={index}
                      value={element}
                      className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                    >
                      <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                      <div className="text-sm/6 text-white">{element.name}</div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Listbox>
            </div>
          }
          <Button size="sm" color="primary">
            Nueva Materia
          </Button>
        </div>
      </div>
    </>
  )
}

export default SubjectsList;