
export interface QuestionTranslation {
    language: 'en' | 'pt' | 'de',
    question: string,
    options: string[],
    explanation: string
}

export interface QuestionData{
    id:string,
    question:string,
    options: string[],
    answer: number,
    enable:boolean,
    lessonId: string,
    difficult:number,
    explanation:string,
    translations?: QuestionTranslation[],
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface ICoursesData {
    id:string,
    enable:boolean, 
    image:string,
    name:string,
    slug:string,
    createdAt: Date | null;
    updatedAt: Date | null;
}


export interface ILessonData {
  id: string,
  name: string,
  slug: string,
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
  
  translateEnglish?: boolean;
}

export interface UserData {
  id: string;
  userName: string;
  email: string;
  permissions: UserPermissions;
  createdAt: Date | null;
  updatedAt: Date | null;
}
