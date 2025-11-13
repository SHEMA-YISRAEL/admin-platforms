
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
    // error: errorGettingCoursesData
  } = getCourses()

  const [dataFromServer, setDataFromServer] = useState<ICoursesData[]>([]);

  useEffect(() => {
    if (coursesDataFromFirebase.length > 0) {
      setDataFromServer(coursesDataFromFirebase)
      methodSetSelectedSubject(coursesDataFromFirebase[0])
    }
  }, [coursesDataFromFirebase])

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Materia:</label>
      {
        loadingCourses ? (
          <div className="text-xs text-gray-500">Cargando...</div>
        ) : (
          <Listbox
            value={selectedSubject}
            onChange={methodSetSelectedSubject}
          >
            <ListboxButton
              className={clsx(
                'relative block min-w-[180px] rounded-lg py-1.5 pr-8 pl-3 text-left text-sm bg-gray-50 text-gray-900 border border-gray-300',
                'hover:bg-gray-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            >
              {selectedSubject?.name}
              <ChevronDownIcon
                className="absolute top-2 right-2 size-4 fill-gray-600"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                'w-(--button-width) rounded-lg border border-gray-200 bg-white p-1 mt-1 shadow-xl z-50',
                'transition duration-100 ease-in data-leave:data-closed:opacity-0'
              )}
            >
              {dataFromServer.map((element, index) => (
                <ListboxOption
                  key={index}
                  value={element}
                  className="group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-amber-50 transition-colors"
                >
                  <CheckIcon className="invisible size-4 fill-amber-600 group-data-selected:visible" />
                  <div className="text-sm text-gray-900">{element.name}</div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
        )
      }
      <Button size="sm" color="primary" variant="flat" className="text-xs">
        + Materia
      </Button>
    </div>
  )
}

export default SubjectsList;