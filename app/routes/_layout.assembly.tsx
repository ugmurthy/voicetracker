
//import AudioAssembly from "~/components/AudioAssembly";

import {getAssemblyToken} from "~/modules/assembly.server"
import { useLoaderData } from "@remix-run/react";

//components
import Divider from "../components/Divider"

 export async function loader({request}) {
   // fetch token from assembly AI
   const token = await getAssemblyToken();
  return token;
 }
   
export default function Component() {
    const token = useLoaderData();

    return (
        <div>
            <Divider></Divider>
                {JSON.stringify(token,null,2)}
            <Divider/>
        </div>
    )
}
// @TODO fetch token from assembly AI using clientLoader and clieantLoader
/* export default function Assembly() {
//const token = useLoaderData();
const token="ebbceb1a2e2f045695385c733837f7dc029f25b07ab669596606e87e163947dd"
//console.log(token);
    let url = 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000';

// @TODO fetch token from assembly AI using clientLoader and clieantLoader

url = url+`&token=${token}`
console.log("URL :",url)
    return (
        <div>
            <AudioAssembly url={url} />
        </div>
    )
} */