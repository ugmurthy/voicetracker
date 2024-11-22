
import {getAssemblyToken} from "~/modules/assembly.server"
import { redirect, useLoaderData } from "@remix-run/react";
import AudioAssembly from "../components/AudioAssembly";
import {  getAPIkey, getSessionToken, createAPISession } from "~/modules/session.server";
 export async function loader({request}) {
   console.log("/assembly : loader")
   // get session token
   const token = await getSessionToken(request)
   if (token) {
        return token;
   } else {
            // fetch token from assembly AI
        const apikey = await getAPIkey(request)
        const token = await getAssemblyToken(apikey);
        return redirect("/",{ headers: await createAPISession(apikey,token) });
   }
 }
   
export default function Component() {
    const token = useLoaderData();
    let url = 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000';
    url = url+`&token=${token}`
    
    return (
        <div className="p-4">
            <AudioAssembly url={url} />
        </div>
    ) 
}