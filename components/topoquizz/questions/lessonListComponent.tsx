
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

  useEffect(() => {
    setLessonsDataFromServer([]);
    methodSetLessonSelected(emptyLesson);
  }, [courseSelected.id]);

  useEffect(() => {
    console.log(lessonsData)
    if (lessonsData.length > 0) {
      setLessonsDataFromServer(lessonsData);
      methodSetLessonSelected(lessonsData[0]);
    }
  }, [lessonsData])

  return (
    <>
      <div className="flex m-4 rounded-2xl gap-2 justify-start">
        <div className="text-2xl text-center">Lecciones</div>
        {
          loadingLessonsData? "Cargando..." : lessonsData.length > 0?
          <div className="w-1/2">
            <Listbox
              value={selectedLesson} 
              onChange={methodSetLessonSelected}
            >
              <ListboxButton
                className={clsx(
                  'relative block w-full rounded-lg py-1.5 pr-8 pl-3 text-left text-sm/6 bg-black text-white',
                  'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                )}
              >
                {selectedLesson?.name}
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
                {lessonsDataFromServer.map((element, index) => (
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
          </div>:<></>
        }
        <div className="">
          <Button size="sm" color="primary">
            Nueva Leccion
          </Button>
        </div>
      </div>
    </>
  )
}

export default LessonsList;