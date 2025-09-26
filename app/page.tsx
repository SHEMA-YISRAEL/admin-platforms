'use client'

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../utils/firebase'; // Adjust path as needed

// import { useCallback, useEffect, useState } from "react";
// import Image from "next/image";

export default function Home() {
  // const [counter, setCounter] = useState(5)

  // const decrementCount = useCallback(()=>{
  //   setCounter(prevCounter => prevCounter - 1)
  // }, [])

  // useEffect(()=>{
  //   if(counter==0){
  //     console.log("llego a cero")
  //     return 
  //   }
  //   setInterval(decrementCount, 1000)
  // }, [])

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "lessons"));
      const items = querySnapshot.docs.map(
        doc => (
          { 
            id: doc.id, 
            ...doc.data() 
          }
        )
      );
      setData(items);
      console.log(items)
      // console.log(data)
    };
    fetchData();
  }, []);

  return (
    <div 
    // className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20"
    >
      <main 
      // className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"
      >
        
        {
          data.map((element, index)=>{
            return<div key={index}>{element.name}</div>
          })
        }
      </main>
        
    </div>
  );
}
