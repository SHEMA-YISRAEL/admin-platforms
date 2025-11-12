import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { AVAILABLE_LANGUAGES, LanguageCode } from '@/types/languages';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const selectedLang = AVAILABLE_LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Idioma:</label>
      <Listbox value={selectedLanguage} onChange={onLanguageChange}>
        <ListboxButton
          className={clsx(
            'relative block min-w-[150px] rounded-lg py-1.5 pr-8 pl-3 text-left text-sm bg-gray-50 text-gray-900 border border-gray-300',
            'hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-amber-500'
          )}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{selectedLang?.flag}</span>
            <span>{selectedLang?.name}</span>
          </span>
          <ChevronDownIcon
            className="absolute top-2 right-2 size-4 fill-gray-600"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'w-[var(--button-width)] rounded-lg border border-gray-200 bg-white p-1 mt-1 shadow-xl z-50',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
          )}
        >
          {AVAILABLE_LANGUAGES.map((language) => (
            <ListboxOption
              key={language.code}
              value={language.code}
              className="group flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-amber-50 transition-colors"
            >
              <CheckIcon className="invisible size-4 fill-amber-600 group-data-[selected]:visible" />
              <span className="text-lg">{language.flag}</span>
              <div className="text-sm text-gray-900">{language.name}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default LanguageSelector;
