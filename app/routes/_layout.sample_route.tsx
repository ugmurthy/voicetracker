import { useLoaderData } from "@remix-run/react";
//import {json} from '@remix-run/node'
import { json } from "@remix-run/node"; 

export function loader({request}) {
  const sampleData = {
    item:"Electric heater",
    make:"Godrej",
    year:1959,
    type:"antique",
    cost:"0809$",
  }
  return json(sampleData)
}



function Component() {
  const data = useLoaderData();

  return (
    <div className="flex flex-col items-center">
      <div className="divider"></div>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <div className="divider"></div>
      <button className="btn btn-square btn-primary">👍</button>
    </div>
    
  )
}

export default Component;
