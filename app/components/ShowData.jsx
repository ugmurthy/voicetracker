import React from 'react'

function ShowData({data,label=""}) {
    const labelname = label?label:"";
  return (
    <div className="collapse bg-base-50 rounded-none">
  <input type="checkbox" /> 
  <div className="collapse-title font-medium text-xs text-left pl-20 text-blue-500">
    <span className='text-blue-800'>{labelname}</span>...
  </div>
  <div className="collapse-content"> 
    <pre className='text-xs font-thin text-left pl-20'>{JSON.stringify(data,null,2)}</pre>
  </div>
</div>
  )
}

export default ShowData