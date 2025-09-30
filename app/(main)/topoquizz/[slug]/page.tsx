'use client';

import getLessonsByCourse from "@/app/hooks/topoquizz/getLessonsByCourse";
import { use } from "react";

interface LessonComponentProps {
    params: Promise<{ slug: string }>
}

const LessonComponent: React.FC<LessonComponentProps> = ({ params }) => {

    const { slug } = use(params);
    const { data, loading, error } = getLessonsByCourse(slug);

    if(loading) return <div>Cargando...</div>
    if(error) return <div>Error: {error}</div>

    return (
        <>
            <h1>Lessons</h1>

            {
                data.map((element, index)=>{
                    return(
                        <div key={index}>
                            {element.name}
                        </div>
                    )
                })
            }

        </>
    );
}

export default LessonComponent;