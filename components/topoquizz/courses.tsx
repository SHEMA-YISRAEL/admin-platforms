'use client'

import useFirebaseData from '@/app/hooks/topoquizz/useFirebaseData';
import { useRouter } from 'next/navigation'

const Courses = () => {
    
    const { data, loading, error } = useFirebaseData();
    const router = useRouter()

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const redirectByCourse = (slugCourse:string)=>{
        router.push(`topoquizz/${slugCourse}`)
    }

    return (
        <>
            <div className="">
                <h1>Courses</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 gap-5 p-5">
                {
                    data.map((element, index) => {
                        return (
                            <div 
                                className="grid justify-end content-end bg-blue-300  rounded-2xl h-40 hover:shadow-xl cursor-pointer" 
                                key={index}
                                onClick={()=> redirectByCourse(element.slug)}
                            >
                                <div className="font-bold pr-3 pb-3 hover:shadow-amber-300">
                                    {element.name}

                                    <p className="font-light  text-xs text-right">
                                        {element.lessonsNumber? element.lessonsNumber:0 }  lecciones
                                    </p>

                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
}
 
export default Courses;