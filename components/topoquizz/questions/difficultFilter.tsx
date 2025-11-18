
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"
import { IDifficult } from '@/types/Topoqizz'
import clsx from "clsx"
import { Dispatch, SetStateAction } from 'react'

interface DifficultFilterProps {
  difficultLevels: IDifficult[]
  levelSelected:IDifficult
  methodSetLevelSelected: Dispatch<SetStateAction<IDifficult>>
}
 
const DifficultFilter: React.FC<DifficultFilterProps> = ({difficultLevels, levelSelected, methodSetLevelSelected}) => {


  return (
    <div>
      <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Dificultad:</label>
      {
        // loadingLessonsData ? (
        //   <div className="text-xs text-gray-500">Cargando...</div>
        // ) : lessonsData.length > 0 ? (
        <Listbox
          value={levelSelected}
          onChange={methodSetLevelSelected}
        >
          <ListboxButton
            className={clsx(
              'relative block min-w-[180px] rounded-lg py-1.5 pr-8 pl-3 text-left text-sm bg-gray-50 text-gray-900 border border-gray-300',
              'hover:bg-gray-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          >
            {levelSelected?.label || 'Seleccionar...'}
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
              difficultLevels.map((element, index:number) => {
                
                return <ListboxOption
                  key={index}
                  value={element}
                  className="group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-amber-50 transition-colors"
                >
                  <CheckIcon className="invisible size-4 fill-amber-600 group-data-selected:visible" />
                  <div className="text-sm text-gray-900">{element.identifier} {element.label}</div>
                </ListboxOption>
              })
            }
          </ListboxOptions>
        </Listbox> 
      }
      </div>
    </div>
  )
}
 
export default DifficultFilter;