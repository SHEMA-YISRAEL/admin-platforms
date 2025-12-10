
import { ICoursesData, ILessonData, TitleTopicsInter } from "@/interfaces/topoquizz";
import { LanguageCode } from "@/types/languages";

/**
 * Obtiene el nombre traducido de un curso o lección
 * @param translations - El objeto de traducciones
 * @param language - El código del idioma (por defecto 'es')
 * @returns El nombre traducido o un string vacío si no existe
 */
export const getTranslatedName = (
  translations: TitleTopicsInter | undefined,
  language: LanguageCode = 'es'
): string => {
  return translations?.[language]?.name || '';
};

export const emptySubject: ICoursesData = {
  id: '',
  enable: false,
  slug: '',
  translations: {},
  createdAt: null,
  updatedAt: null
};

export const emptyLesson: ILessonData = {
  id: '',
  slug: '',
  translations: {},
  createdAt: null,
  updatedAt: null
};

export const emptyQuestion={
  id:'',
  question:'',
  options: [],
  answer: 0,
  enable:false,
  lessonId: '',
  difficulty:0,
  explanation:'',
  createdAt: null,
  updatedAt: null,
}