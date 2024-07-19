import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useLoaderData } from "@remix-run/react";
import Login from "~/components/Google";
import { addAuthToken, createLoginSession, getGoogleProfile, getUserId, loginGoogleUser } from "~/modules/session/session.server";
//import { createTokenSession, validToken } from "~/module/sessions.server";
import { z, ZodError } from "zod";
import { zx } from "zodix"; // zodix help in validating schemas


const googleResponseSchema = z.object({
    access_token: z.string(),
    expires_in: z.string(),
    scope: z.string()
  });

export async function action(args:ActionFunctionArgs) {
    const result = await zx.parseFormSafe(args.request,googleResponseSchema);
    
    if (result.success) {
        const userProfile = await getGoogleProfile(args.request);
        //console.log("user ",userProfile);
        const {user,error} = await loginGoogleUser(userProfile);
        if (error) {
            // invalid password
            return json({success:false,...error})
          }
        // create a new session and store the hash of validator in db
        // Forcing: remember= "on"
        const {selector,validator,headers} = await createLoginSession('on');
        // add authtoken :store hash of validator in db
        const token = {selector,validator,userId:user.id}
        const ret_data = await addAuthToken(token)
        return redirect('/profile',{headers})
    } else {
        return null;
    }
}
    export async function loader(args:LoaderFunctionArgs) {
        const userId = await getUserId(args.request);
        //console.log("LOADER: /login userId ",userId)
        if (userId) {
          return redirect('/profile')
        } else {
          const google_client_id = process.env.GOOGLE_CLIENT_ID;
          return json({google_client_id});
        }
      }
    export default function Posts() {
    const {google_client_id} = useLoaderData();
        return (
            
            <Login gid={google_client_id} />
           
        );
    }