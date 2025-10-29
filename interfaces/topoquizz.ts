

export interface QuestionData{
    id:string,
    question:string,
    options: string[],
    answer: number,
    enable:boolean,
    lessonId: string,
    difficult:number,
    explanation:string,
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
