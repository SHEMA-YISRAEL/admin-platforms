
export interface DataQuestionTranslated {
  explanation: string;
  options: string[];
  question: string;
}

export interface QuestionTranslations {
  es?: DataQuestionTranslated;
  en?: DataQuestionTranslated;
  pt?: DataQuestionTranslated;
  ko?: DataQuestionTranslated;
  de?: DataQuestionTranslated;
}

export interface QuestionData {
    id: string;
    answer: number;
    enable: boolean;
    lessonId: string;
    difficult: number;
    translations?: QuestionTranslations;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface TitleTopicTranslation {
  name: string;
}

export interface TitleTopicsInter {
  es?: TitleTopicTranslation;
  en?: TitleTopicTranslation;
  pt?: TitleTopicTranslation;
  ko?: TitleTopicTranslation;
  de?: TitleTopicTranslation;
}
export interface ICoursesData {
    id:string,
    enable:boolean, 
    // image:string,
    // name:string,
    slug:string,
    translations:TitleTopicsInter
    createdAt: Date | null;
    updatedAt: Date | null;
}


export interface ILessonData {
  id: string;
  slug: string;
  translations?: TitleTopicsInter;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserPermissions {
  canViewTopoquizz?: boolean;
  canEditTopoquizz?: boolean;
  canDeleteTopoquizz?: boolean;
  canViewNeurapp?: boolean;
  canEditNeurapp?: boolean;
  canDeleteNeurapp?: boolean;

  // Permisos de traducción por idioma
  translateEnglish?: boolean;

  translatePortuguese?: boolean;
  translateGerman?: boolean;
  translateKorean?: boolean;

  // Permiso para editar versión en español (original)
  canEditSpanishVersion?: boolean;
  // Permiso para ver versión en español (solo lectura)
  canViewSpanishVersion?: boolean;
}

export interface UserData {
  id: string;
  userName: string;
  email: string;
  permissions: UserPermissions;
  rol?:string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
