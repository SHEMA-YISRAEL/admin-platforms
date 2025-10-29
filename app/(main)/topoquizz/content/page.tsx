'use client'
// import QuestionsTable from "@/components/topoquizz/questionsTable";
import getCourses from "@/lib/firebase/getCourses";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { 
  // Listbox, 
  // ListboxItem, 
  Button 
} from "@heroui/react";
import getLessonsByCourse from "@/lib/firebase/getLessonsByCourse";
import QuestionsComponent from "@/components/topoquizz/questions/questionsComponent";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

import { ICoursesData, ILessonData } from "@/interfaces/topoquizz";

// interface ICustomListBox{

// }

// const CustomListox:React.FC<ICustomListBox> = ()=>{
//   return(
//     <Listbox
//       value={selected} 
//       onChange={setSelected}
//     >
//       <ListboxButton
//         className={clsx(
//           'relative block w-full rounded-lg py-1.5 pr-8 pl-3 text-left text-sm/6 bg-black text-white',
//           'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
//         )}
//       >
//         {selected?.name}
//         <ChevronDownIcon
//           className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white"
//           aria-hidden="true"
//         />
//       </ListboxButton>
//       <ListboxOptions
//         anchor="bottom"
//         transition
//         className={clsx(
//           'w-(--button-width) rounded-xl border border-white/5 bg-black p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
//           'transition duration-100 ease-in data-leave:data-closed:opacity-0'
//         )}
//       >
//         {dataFromServer.map((element, index) => (
//           <ListboxOption
//             key={index}
//             value={element}
//             className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
//           >
//             <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
//             <div className="text-sm/6 text-white">{element.name}</div>
//           </ListboxOption>
//         ))}
//       </ListboxOptions>
//     </Listbox>)
// }


interface ContentPageProps {

}

interface ISubjectListProps {
  // selectedSubject: Set<string>,
  // methodSetSelectedSubject: Dispatch<SetStateAction<Set<string>>>;
  // Correcto
  selectedSubject: ICoursesData | undefined,
  methodSetSelectedSubject: Dispatch<SetStateAction<ICoursesData>>;

}

const SubjectsList: React.FC<ISubjectListProps> = (
  { 
    selectedSubject, 
    methodSetSelectedSubject 
  }
) => {

  const {
    coursesData: coursesDataFromFirebase,
    loading: loadingCourses,
    error: errorGettingCoursesData
  } = getCourses()

  // const [selected, setSelected] = useState<ICoursesData>({
  //   id:'',
  //   enable:false, 
  //   image:'',
  //   name:'',
  //   slug:'',
  //   createdAt: null,
  //   updatedAt: null
  // })
  const [dataFromServer, setDataFromServer] = useState<ICoursesData[]>([]);

  useEffect(() => {
    
    if (coursesDataFromFirebase.length > 0) {
      setDataFromServer(coursesDataFromFirebase)
      methodSetSelectedSubject(coursesDataFromFirebase[0])
    }
  }, [coursesDataFromFirebase])

  
  // const people = [
  //   { id: 1, name: 'Durward Reynolds' },
  //   { id: 2, name: 'Kenton Towne' },
  //   { id: 3, name: 'Therese Wunsch' },
  //   { id: 4, name: 'Benedict Kessler' },
  //   { id: 5, name: 'Katelyn Rohan' },
  // ]

  return (
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-2xl text-center">Materias</div>

        <Button size="sm" color="primary">
          Nueva Materia
        </Button>
        {
          loadingCourses ? <div>Cargando...</div> : 
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
        }
        {/* <Listbox
          // disabledKeys={["edit", "delete"]}
          disallowEmptySelection
          // aria-label="Single selection example"
          selectedKeys={selectedSubject}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => methodSetSelectedSubject(keys as Set<string>)}
        // onAction={(key) => console.log(key)}
        >
          {
            coursesDataFromFirebase.map((element) => {
              return (
                <ListboxItem key={element.id}>{element.name}</ListboxItem>
              )
            })
          }
        </Listbox> */}
      </div>
    </>
  )
}

interface ILessonsListType {
  courseSelected: ICoursesData
  selectedLesson: ILessonData | undefined //Set<string>
  methodSetLessonSelected: Dispatch<SetStateAction<ILessonData | undefined>>
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

  useEffect(() => {
    if (lessonsData.length > 0) {
      console.log(lessonsData)
      // methodSetLessonSelected(new Set([lessonsData[0].slug || String(0)]));
    }
  }, [lessonsData])

  return (
    <>
      <div className="border m-4 rounded-2xl">
        <div className="text-2xl text-center">Lecciones</div>
        <div className="">
          <Button size="sm" color="primary">
            Nueva Leccion
          </Button>
        </div>
        
        {
          loadingLessonsData && courseSelected===null ? "Cargando..." : 
          <>
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
                {lessonsData.map((element, index) => (
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
          </>
        }

        {/* <Listbox
          selectedKeys={selectedLesson}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => methodSetLessonSelected(keys as Set<string>)}
        // onAction={(key) => console.log(key)}
        >
          {
            lessonsData.map((element, index) => {
              return (
                <ListboxItem key={element.slug || index}>
                  {element.name}
                </ListboxItem>
              )
            })
          }
        </Listbox> */}
      </div>


    </>
  )
}

const ContentPage: React.FC<ContentPageProps> = () => {

  // const [courseIdSelected, setCourseIdSelected] = useState(new Set([""]));
  // const [lessonIdSelected, setLessonIdSelected] = useState(new Set([""]));

  const [courseSelected, setCourseSelected] = useState<ICoursesData>({
    id:'',
    enable:false, 
    image:'',
    name:'',
    slug:'',
    createdAt: null,
    updatedAt: null
  });
  const [lessonSelected, setLessonSelected] = useState<ILessonData>();

  return (
    <div className="h-screen w-screen">
      <div className="text-center text-3xl font-bold my-5">Contenido</div>
      <div 
      // className="grid grid-cols-5 grid-rows-1 gap-4 h-screen"
      >
        <div 
        // className="flex flex-col"
        >
          <div 
          // className="flex-1"
          >
            <SubjectsList
              selectedSubject={courseSelected}
              methodSetSelectedSubject={setCourseSelected}
            />
          </div>
          <div 
            // className="grow"
          >

            <LessonsList
              courseSelected={courseSelected} //first element
              selectedLesson={lessonSelected}
              methodSetLessonSelected={setLessonSelected}
            />

          </div>
        </div>
        {/* <div className="col-span-4">
          <QuestionsComponent
            lessonIdSeelected={Array.from(lessonIdSelected)[0] || ''}
          // questionsData={[]}
          />
        </div> */}

        {/* <QuestionsTable
        questionsData={selectedLessonId ? questions : []}
        isNewQuestionModalOpen={isNewQuestionModalOpen}
        onCloseNewQuestion={() => setIsNewQuestionModalOpen(false)}
      /> */}

      </div>
    </div>
  );
}

export default ContentPage;