import React from 'react';


function TextView({summary}) {
  return (
    <div>
      <textarea className=" textview-container textarea textarea-bordered h-[510px] w-[850px] text-[18px] px-10 pt-8 pb-28" value={summary} readOnly/>
    </div>
  )
}

export default TextView