'use client'
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Adjust path as needed

export default function Home() {

  // const [data, setData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(collection(db, "lessons"));
  //     const items = querySnapshot.docs.map(
  //       doc => (
  //         { 
  //           id: doc.id, 
  //           ...doc.data() 
  //         }
  //       )
  //     );
  //     setData(items);
  //     console.log(items)
  //     // console.log(data)
  //   };
  //   fetchData();
  // }, []);

  return (
    <div className="font-sans  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="w-full flex gap-[32px] items-center sm:items-start text-white font-bold sm:columns-1">
        <div
          className="w-1/3 h-40 cursor-pointer bg-blue-600 rounded-4xl text-6xl flex items-center justify-center"
          onClick={() => redirect('/topoquizz')}>
          Topoquizz
        </div>
        <div
          className="w-1/3 h-40 cursor-pointer bg-amber-300 rounded-4xl text-6xl flex items-center justify-center"
          onClick={() => redirect('/neurapp')}>
          NeurApp
        </div>
      </main>

    </div>
  );
}
