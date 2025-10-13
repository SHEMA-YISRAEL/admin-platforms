import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { getDocs, collection} from "firebase/firestore";

interface ICoursesData {
	id:string,
	enable:boolean, 
	image:string,
	name:string,
	slug:string,

	createdAt: Date
	updatedAt: Date
}

const docLessonLabel = 'courses'

function getCourses() {
	const [coursesData, setCoursesData] = useState<ICoursesData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<String | null>(null);

	useEffect(()=>{
		const fetchCourses = async ()=>{
			try{
				setLoading(true);
				setError(error);

				const querySnapshot = await getDocs(collection(db, docLessonLabel))
				const items = querySnapshot.docs.map((doc, i)=>{
					return(
						{
							id:doc.id,
							...doc.data()
						}
					)
				})
				setCoursesData(items)
			}catch(err){
				console.error('Error fetching Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
			}finally{
				setLoading(false)	
			}
		}
		fetchCourses()
	}, [])
  return {coursesData, loading, error};
}

export default getCourses;