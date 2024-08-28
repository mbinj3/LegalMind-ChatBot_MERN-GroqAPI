import React from 'react';
import { useState } from 'react';
import TextView from '../components/TextView';
import Form from '../components/Form';


function Home() {

  const [summary, setSummary] = useState("");
    
  return (
    <div className='flex flex-col items-center justify-center gap-5 bg-[#1f2937] h-svh w-full'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Legal Mind ⚖️</h1>
        <h1 className='text-2xl font-bold'>Decoding Law with Intelligent Summaries</h1>
      </div>
      <div className=' flex flex-col items-center justify-center mt-2'> 

        <div className='relative'> 
          <TextView summary={summary}/>
        </div> 
        <div className='absolute bottom-[70px]'>
          <Form setSummary={setSummary} />
        </div>  
      </div>
    </div>
  )
}

export default Home