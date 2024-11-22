import type { MetaFunction } from "@remix-run/node";
import { redirect, } from "@remix-run/node";
import {  validAPI ,createAPISession, authenticate} from "~/modules/session.server";
import {Form,useActionData, useNavigation} from '@remix-run/react'
import { getFormData } from "~/helpers/webUtils.server";
//import { getAssemblyToken } from "~/modules/assembly.server";
export const meta: MetaFunction = () => {
  return [
    { title: "SpeechTrack" },
    { name: "SpeechTrack", 
      content: "Realtime Speech Analysis using Assembly AI" 
    },
  ];
};

export async function loader({request}) {
  //const apikey = await getAPIkey(request); 
  //console.log("/ : loader :apikey ",apikey)
  
  if (await authenticate(request,"/")) {
    return redirect('/assembly')
  }
  return {};
}

export async function action({request}) {
  const {apikey} = await getFormData(request);
    //const apikey = await getAPIkey(request)
    console.log("/ : action start")
    const token = await validAPI(apikey,"/")
    if (token) {
        console.log("/ : action :Autheticated & Redirecting...")
        return redirect("/",{ headers: await createAPISession(apikey,token) });
    }
    return {error:"API Key Invalid or Absent!"}
}
export default function Index() {
  const actionData = useActionData();
  const MESSAGE = ""
  const navigation = useNavigation();
  return (
    <div className="container mx-auto max-w-md px-4">
  
    <Form className="pt-10 flex flex-col items-center space-y-2 " method="POST">
        <label className='form-control w-full max-w-xs'>
            <div className="label">
                <span className='label-text'>Assembly API Key</span>
                <div className="font-thin text-xs text-stone-500"><a href={"https://www.assemblyai.com/app"} target="_blank">Visit Assembly AI for key</a></div>
            </div>
            <input className='input input-bordered input-primary input-sm w-full max-w-xs' name="apikey" type="text"  ></input>
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
            
            Submit
        </button>
        {(actionData?.error && actionData.error )?<div><p className="text-red-600 font-bold">{actionData.error}</p></div>:""}
    
        {/*@TODO add some text providing more info  */}
    </Form>
    
</div>
  );
}
