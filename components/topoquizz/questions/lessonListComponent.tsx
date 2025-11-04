
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@heroui/react";
import getLessonsByCourse from "@/lib/firebase/getLessonsByCourse";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";
import { emptyLesson } from "@/utils/topoquizz";


interface ILessonsListType {
  courseSelected: ICoursesData
  selectedLesson: ILessonData | undefined //Set<string>
  methodSetLessonSelected: Dispatch<SetStateAction<ILessonData>>
}

const LessonsList: React.FC<ILessonsListType> = ({ 
  courseSelected, 
  selectedLesson, 
  methodSetLessonSelected }) => {
  
  const {
    data: lessonsData,
    loading: loadingLessonsData,
    error 
  } = getLessonsByCourse(courseSelected.id) //courseSelected:string

  const [lessonsDataFromServer, setLessonsDataFromServer] = useState<ILessonData[]>([]);

  let idLesson:number= 0

  useEffect(() => {
    setLessonsDataFromServer([]);
    methodSetLessonSelected(emptyLesson);
  }, [courseSelected.id]);

  useEffect(() => {
    // console.log(lessonsData)
    if (lessonsData.length > 0) {
      setLessonsDataFromServer(lessonsData);
      methodSetLessonSelected(lessonsData[0]);
    }
  }, [lessonsData])

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Lección:</label>
      {
        loadingLessonsData ? (
          <div className="text-xs text-gray-500">Cargando...</div>
        ) : lessonsData.length > 0 ? (
          <Listbox
            value={selectedLesson}
            onChange={methodSetLessonSelected}
          >
            <ListboxButton
              className={clsx(
                'relative block min-w-[180px] rounded-lg py-1.5 pr-8 pl-3 text-left text-sm bg-gray-50 text-gray-900 border border-gray-300',
                'hover:bg-gray-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            >
              {selectedLesson?.name || 'Seleccionar...'}
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
              {
                lessonsDataFromServer.map((element, index) => {
                  idLesson+=1
                  return <ListboxOption
                    key={index}
                    value={element}
                    className="group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-amber-50 transition-colors"
                  >
                    <CheckIcon className="invisible size-4 fill-amber-600 group-data-selected:visible" />
                    <div className="text-sm text-gray-900">{`L${idLesson}`}-{element.name}</div>
                  </ListboxOption>
                })
              }
            </ListboxOptions>
          </Listbox>
        ) : (
          <div className="text-xs text-gray-400 italic">Sin lecciones</div>
        )
      }
      <Button size="sm" color="primary" variant="flat" className="text-xs">
        + Lección
      </Button>
    </div>
  )
}

export default LessonsList;