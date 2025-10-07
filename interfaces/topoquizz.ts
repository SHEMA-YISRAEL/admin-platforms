

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