
import {getAssemblyToken} from "~/modules/assembly.server"
import { redirect } from "@remix-run/react";

import {  getAPIkey, createAPISession } from "~/modules/session.server";
 export async function loader({request}) {
   console.log("/api/token : getting new token")
   const apikey = await getAPIkey(request)
   const token = await getAssemblyToken(apikey);
   
   return redirect("/",{ headers: await createAPISession(apikey,token) });
   }
 