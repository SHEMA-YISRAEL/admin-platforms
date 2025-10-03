

export interface QuestionData{
    id:string,
    question:string,
    options: string[],
    correctAnswer: number,
    enable:boolean,
    lessonId: string,
    difficult:number,
    explanation:string,
    createdAt: Date;
    updatedAt: Date;
}