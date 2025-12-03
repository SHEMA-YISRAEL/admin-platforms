import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { getDocs, collection, Timestamp } from "firebase/firestore";
import { ICoursesData } from "@/interfaces/topoquizz";

import { docLessonLabel } from "@/constants/topoquizz";

function useCourses() {
	const [coursesData, setCoursesData] = useState<ICoursesData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(()=>{
		const fetchCourses = async ()=>{
			try{
				setLoading(true);
				setError(error);

				const querySnapshot = await getDocs(collection(db, docLessonLabel))
				const items = querySnapshot.docs.map((doc)=>{
					const data = doc.data();
					return(
						{
							...data,
							id:doc.id,
							...doc.data(),
							createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
							updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
						} as ICoursesData
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
	}, [error])
  return {coursesData, loading, error};
}

export default useCourses;