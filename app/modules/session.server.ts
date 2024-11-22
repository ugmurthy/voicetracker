// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/node"; 
import { getAssemblyToken } from "./assembly.server";
type SessionData = {
  reference: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "kcarThceepS",

        // all of these are optional
        //domain: "",
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 604800, 
        //maxAge: 604800 = a week
        //maxAge:60, // for testing
        path: "/",
        sameSite: "none",
        secrets: ["speech_s3cret1"],
        secure: true,
      },
    }
  );


 // return a session token based on apikey - the recepient can store this in session 
 async function validAPI(apikey:string, route:string) {
    const token = await getAssemblyToken(apikey); // check by getting token
    console.log(`f(validAPI) via ${route}`)
  if(token)  {
    return token;
  } else {
    console.log(`f(validAPI): ${route} : Authentication failed `)
    return false;
  }
}

 async function createAPISession(apikey:string,token:string, headers = new Headers()) {
  const session = await getSession();
  session.set('apikey', apikey);
  session.set('token',token);
  console.log(`f(createAPISession) Got apikey,token`)
  
  headers.set('Set-Cookie', await commitSession(session));
  return headers;
}

 async function getAPIkey(request: Request) {
  try {  
  const session = await getSession(request.headers.get('Cookie'));
  const apikey = session.get('apikey');
  //console.log('get api key ', apikey);
  return apikey;
  } catch(e) {
    console.log("f(getAPI): Error ",e)
    return null
  }

}


async function getSessionToken(request: Request) {
    try {  
    const session = await getSession(request.headers.get('Cookie'));
    const token = session.get('token');
    console.log('f(getSessionToken): Got token ');
    return token;
    } catch(e) {
      console.log("f(getSessionToken): Error ",e)
      return null
    }
  
  }
  

// get settings if it exist else {}
async function getSettings(request: Request) {
  // Gets settings from session as JSON object
  // if empty returns {}
  const session = await getSession(request.headers.get('Cookie'));
  let settings = session.get('settings');
  try {
    settings = JSON.parse(settings);
  } catch (e) {
    settings = {};
  }
  //console.log('get api key ', apikey);
  return settings
}
async function getAll(request: Request, route) {
   const apikey = await getAPIkey(request);
   const settings = await getSettings(request);
   return {settings, apikey};
}


// returns apikey if exists
async function authenticate(request:Request, route:string) {
  
  const session = await getSession(request.headers.get("Cookie"))
  const apikey = session.get("apikey");
  let token = session.get("token");
  if (!token) {
    token = await getAssemblyToken(apikey);
  }
  return apikey
}

export { 
  getSession, 
  getSettings,
  getAll,
  commitSession, 
  destroySession , 
  validAPI, 
  getAPIkey, 
  getSessionToken,
  createAPISession, 
  authenticate
};