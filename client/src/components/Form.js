import React from 'react';
import { useState } from 'react';
import { IoIosSend } from "react-icons/io";
import { useForm } from 'react-hook-form';


function Form({setSummary}) {
    
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const handleFormSubmit = async (data) => {
        setLoading(true);
        try{
            const response = await fetch(`${window.location.origin}/user-query/case-details`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json'
               },
               body: JSON.stringify({ formData: data.caseDetails }) 
            });

            const result = await response.json();
            setSummary(result.summary);

        }catch(error){
            console.log(error);
        }finally{
            reset();
            setLoading(false);
        }
    }

    
  return (
    <div className='flex items-center justify-center'>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <label className="input input-bordered rounded-md flex items-center gap-2 w-[768px]">
            <input type="text" className="grow" placeholder="Case details"
                {...register('caseDetails', {
                    required: 'This field is required.',
                    pattern: {
                        value: /^[a-zA-Z].*$/gm,
                        message: 'Input must include letters and may include numbers and symbols, But not just numbers or symbols.'
                    },  
                })} 
            />
            <button className='' type='submit'>
            {loading ? <span className="loading loading-spinner loading-md"></span> : <IoIosSend className='text-2xl cursor-pointer'/>
            }
            </button>
            </label> 
            {errors.caseDetails && (
                <p className="text-red-500 text-sm mt-2">
                    {errors.caseDetails.message}
                </p>
            )}
        </form>
    </div>
  )
}

export default Form