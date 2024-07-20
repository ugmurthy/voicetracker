/* eslint-disable jsx-a11y/label-has-associated-control */
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs ,LoaderFunctionArgs} from "@remix-run/node";
import { createUserSession, loginUser , createLoginSession, addAuthToken, getUserId} from '../modules/session/session.server'
import { redirect, json } from "@remix-run/node";
import { z, ZodError } from "zod";
import { zx } from "zodix"; // zodix help in validating schemas
import Google from "~/components/Google";
//import { sleep } from "~/helpers/util";

const schema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.string().startsWith('on').optional(),
});

// Check if there is an error for a specific path.
function errorAtPath(error: ZodError, path: string) {
  return error.issues.find((issue) => issue.path[0] === path)?.message;
}

export async function action(args: ActionFunctionArgs) {

  const result = await zx.parseFormSafe(args.request, schema);
  //  console.log("Validation Result ",JSON.stringify(result,null,2))
  if (result.success) {

    const {user,error} = await loginUser({email:result.data.email, password:result.data.password}) // if not registered user then Error
    //console.log("ACTION:loginUser  /login user: ",user)
    if (error) {
      // invalid password
      return json({success:false,...error})
    }
    if (result?.data.rememberMe) { 
      // create a new session and store the hash of validator in db
      const {selector,validator,headers} = await createLoginSession(result?.data.rememberMe);

      //console.log("ACTION /login RememberMe=True  ",selector,validator)
      // add authtoken :store hash of validator in db
      const token = {selector,validator,userId:user.id}
      const ret_data = await addAuthToken(token)
      //console.log("-------------- redirecting to /main ------------")
      return redirect('/profile',{headers})
    }
    //console.log("ACTION /login RememberMe=False ",user)
    return redirect('/profile', { headers: await createUserSession(user) });
  }
  // Get the error messages and return them to the client.
  return json({
    success: false,
    emailError: errorAtPath(result.error, "email"),
    passwordError: errorAtPath(result.error, "password"),
  });
}

export async function loader(args:LoaderFunctionArgs) {
  const userId = await getUserId(args.request);
  //console.log("LOADER: /login userId ",userId)
  if (userId) {
    return redirect('/main')
  } else {
    const google_client_id = process.env.GOOGLE_CLIENT_ID;
    return json({google_client_id});
  }
}
export default function Login() {
  const data = useActionData<typeof action>();
  const {google_client_id} = useLoaderData<typeof loader>();
if (data?.success) {
    return <h1 className="mt-10 pl-40 text-3xl flex flex-col items-start ">Success!</h1>;
  }
  return (
    <div>
      <Google gid={google_client_id}></Google>
      <div className="divider px-40"> or </div>
      <Form  method="post" action="/login">
        <div className="max-w-md mx-auto p-6 lg:p-8 text-gray-800 space-y-4 ">
        <h1 className="text-center text-3xl">Login  </h1>
      <div>
      <label className="input input-bordered input-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
        <input name="email" type="text"  placeholder="Email" className="w-full"/>
        
      </label>
      {data?.emailError && <div className="font-thin text-red-700 ">{data.emailError}</div>}
      </div>
      <div>
      <label className="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
        <input name="password" type="password" className="w-full"  />
        
      </label>
      {data?.passwordError && <div className="font-thin text-red-700">{data.passwordError}</div>}
      </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Remember me</span> 
            <input name="rememberMe" type="checkbox" defaultChecked className="checkbox" />
          </label>
        </div>
        <div className="flex flex-row justify-between  ">
        <button className="btn btn-neutral" type="submit">Login</button>
        <Link to="/signup" className="underline cursor-pointer place-content-center">Sign Up</Link>
        </div>
        </div>
      </Form>
    </div>
  );
}
