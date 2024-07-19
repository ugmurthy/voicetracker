/* eslint-disable jsx-a11y/label-has-associated-control */
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createUserSession, registerUser } from '../modules/session/session.server'
import { redirect, json } from "@remix-run/node";
import { z, ZodError } from "zod";
import { zx } from "zodix"; // zodix help in validating schemas
//import db from '../modules/xata.server'

const SignUpSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Invalid email" }),
  name: z.string().optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

// Check if there is an error for a specific path.
function errorAtPath(error: ZodError, path: string) {
  return error.issues.find((issue) => issue.path[0] === path)?.message;
}

/*
 db.addUser returns 
 {
  "id": "bce8d52f-d826-99af-9aab-97e5d7e83841",
  "message": "invalid record: column [email]: is not unique"
 }
  if email exisits / user exists 

  returns:
  {
  "id": "rec_cq8gubfhqm2k22v7g3u0",
  "xata": {
    "createdAt": "2024-07-12T11:10:37.847892Z",
    "updatedAt": "2024-07-12T11:10:37.847892Z",
    "version": 0
  }
} on successful insert.
*/


export async function action(args: ActionFunctionArgs) {
  const result = await zx.parseFormSafe(args.request, SignUpSchema);
  //console.log("ACTION: /xsignup : Validation Result ",JSON.stringify(result,null,2))
  //await sleep(2000);// dummy delay to show progress bar
  let user 
  if (result.success) {
    user = {
      email:result.data.email, 
      password:result.data.password, 
      name:result.data.name,
      verified_email:false,
    }
    const data = await registerUser({...user});
    //const data = await db.addUser(user);
    console.log("ACTION: /signup : db.registerUser Result ",JSON.stringify(data,null,2))
    
    return redirect('/main', { headers: await createUserSession(data) });
  }
  // Get the error messages and return them to the client.
  return json({
    success: false,
    emailError: errorAtPath(result.error, "email"),
    passwordError: errorAtPath(result.error, "password"),
  });
}

export default function SignUp() {
  const data = useActionData<typeof action>();
  
  if (data?.success) {
    return <h1 className="mt-10 pl-40 text-3xl flex flex-col items-start ">Success!</h1>;
  }
  return (
    <>
      
      <Form  method="post" action="/signup">
        <div className="max-w-md mx-auto p-6 lg:p-8 text-gray-800 space-y-4 ">
        <h1 className="pl-40 mt-10 text-3xl flex flex-col items-start ">Sign Up  </h1>
      <div>
      <label className="input input-bordered input-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
        <input name="email" type="text"  placeholder="Email" className="w-full"/>
        
      </label>
      {data?.emailError && <div className="font-thin text-red-700 ">{data.emailError}</div>}
      </div>
      <div>
      <label className="input input-bordered flex items-center gap-2">
        <span>Name</span>
        <input name="name" type="text" className="w-full"  />
      </label>
      </div>
      <div>
      <label className="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
        <input name="password" type="password" className="w-full"  />
        
      </label>
      {data?.passwordError && <div className="font-thin text-red-700">{data.passwordError}</div>}
      </div>
        <button className="btn btn-neutral" type="submit">Sign Up</button>
        
        </div>
      </Form>
    </>
  );
}






/* 
<p>
          <label>Email:</label>
          <input className="ml-14 rounded-lg outline-dashed outline-black" name="email" />
          {data?.emailError && <div className="font-thin text-red-700 ">{data.emailError}</div>}
        </p>
        <p>
          <label>Password:</label>
          <input className="ml-4 rounded-lg  outline-dashed outline-black" type="password" name="password" />
          {data?.passwordError && <div className="font-thin text-red-700">{data.passwordError}
          </div>}
        </p> */