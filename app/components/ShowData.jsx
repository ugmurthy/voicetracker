import React from 'react'
// set raw = false if data is just text
// else JSON data will be displayed
function ShowData({data,raw=true,label=""}) {
    const labelname = label?label:"";
  if (!raw && typeof data !== "string") {
    return <div> </div>
  }
  // convert each element of the data array to JSON string  
  let dataStr = [];
  if (Array.isArray(data)) {
    dataStr = data.map(item => JSON.stringify(item, 2));
  }
  // get jsx element for each element of the dataStr array as a pre element
  let dataJsx = dataStr.map((item, index) => <pre key={index}>{item}</pre>);


  return (
    <div className="collapse bg-base-50 rounded-none">
  <input type="checkbox" /> 
  <div className="collapse-title font-medium text-xs text-left pl-20 text-blue-500">
    <span className='text-blue-800'>{labelname}</span>...
  </div>
  <div className="collapse-content"> 
   {raw
   ? <div className='text-xs font-thin text-left pl-20'>
    {dataJsx}
   </div>
   : <div className='text-xs font-thin text-left pl-20'>{data}</div>
   }
  </div>
</div>
  )
}

export default ShowData