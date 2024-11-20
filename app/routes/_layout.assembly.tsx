
import {getAssemblyToken} from "~/modules/assembly.server"
import { useLoaderData } from "@remix-run/react";

//components

import AudioAssembly from "../components/AudioAssembly";
 export async function loader({request}) {
   // fetch token from assembly AI
   const token = await getAssemblyToken();
  return token;
 }
   
export default function Component() {
    const token = useLoaderData();
    let url = 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000';
    url = url+`&token=${token}`
    
    return (
        <div>
            <AudioAssembly url={url} />
        </div>
    ) 
}