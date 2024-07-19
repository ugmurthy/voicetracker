//import type { User, AuthToken } from "@prisma/client/wasm";
import { createCookieSessionStorage,redirect } from "@remix-run/node";
import bcrypt from 'bcryptjs'
import cryptoRandomString from 'crypto-random-string';
import z from 'zod';
//import zx from 'zodix'
import db  from '../xata.server'
import { version } from "react";

const regData = z.object({
    name: z.string(),
    email:z.string(),
    password:z.string(),
    verified_email:z.boolean(),
})
type RegistrationData = z.infer<typeof regData>
type UserLoginData = {
    email: string;
    password: string;
}

export async function registerUser({name,email,password,verified_email=false}:RegistrationData):Promise<T> {
    const hashedPassword = await bcrypt.hash(password,10)
    const data = await db.findUserByEmail(email);
    const existingUser= Object.keys(data).includes('message');
    // Error: User Exists
    if (existingUser) { // Error: User Exists
        throw new Error(`User with email: ${email} already exists`);
    }

    try { // create new User
      const user = {name,email,password:hashedPassword,verified_email}
        return db.addUser(user)
    } catch (error) {
        throw new Error("Unable to create new user")
    }
}

export async function loginUser({email,password}:UserLoginData):Promise<T> {
    const data = await db.findUserByEmail( email );
    //console.log("loginUser : data",data);
    const existingUser= Object.keys(data).includes('records') && data.records.length>0;
    // Error: User Exists
    if (!existingUser) { // Error: User Exists
      console.log(`No user found for email: ${email}`);
      return {user:{},error:{emailError:`No user found for email: ${email}`}};
       // throw new Error(`User with email: ${email} does NOT exists`);
    }
    // got user extract it from data.records
    const user = data.records[0];
    
    // first delete all old tokens for this userId
    const delCount= await deleteTokens(user.id);
    //console.log("Deleted old tokens ",delCount);
    const passwordValid = await bcrypt.compare(password,user.password);
    if (!passwordValid) {
        console.log("loginUser: Invalid Password");
        return {user:{},error:{passwordError:"Invalid Password"}};
    }
    return {user,error:""};
}

///LoginGoogleUser
const GoogleProfileData = z.object({
  email:z.string(),
  name:z.string(),
  verified_emai:z.boolean(),
  picture:z.string(),
})
type GoogleLoginData = z.infer<typeof GoogleProfileData>


/*
STEP:1. Check if user exists based on email in google profile
CASE:2. If user DOES NOT exist, then create a new user
  a. create a new user including picture processing for xata
  
CASE:3. If user exists, then check if user has verified_email=false
  a. if verified_email=false, then update user with verified_email=true
  b. update name, picture of needed 
  c. Update user record

4. create a new token
5. return user and token
*/
export async function loginGoogleUser({email,name,verified_email,picture}:GoogleLoginData):Promise<T> {
  let data = await db.findUserByEmail( email );
  //console.log("Google User : data :",data.records);
  const existingUser= Object.keys(data).includes('records') && data.records.length>0;
  
  //CASE 2: USER DOES NOT EXIST : CREATE NEW USER
  if (!existingUser) { // user does not exist : create new user
    //console.log(`No user found for email: ${email}`);
    console.log("Prepare to add Google User");
    // process picture url 
    const picField = {base64Content: await db.imageUrlToBase64(picture),
                      name:"picture.txt",
                      mediaType: "application/octed-stream",
                      enablePublicUrl:true} 

    const user = {email,name,verified_email,picture:picField}; // we will add picture later 
    const ret_val = await db.addUser(user);
    //console.log("Google User Created: ret_val :",ret_val);

    data = await db.findUserByEmail( email );
    //console.log("Google User : data :",data.records[0]);
      
  } 
  //CASE 3: USER EXISTS but verified_email is false : update user with Google profile info
  if (existingUser && !data.records[0].verified_email) { 
    const verified_email = data.records[0].verified_email;
    const picExists = data.records[0].picture; 
    const update_user=data.records[0];
    delete update_user.xata;
    delete update_user.family_name;
    delete update_user.given_name;
    
    // if verified_email is false : update it to true
    if (!verified_email) {
      update_user.verified_email = true;
      update_user.password="No Password"
      update_user.name = name;
    }
    if (!picExists) {
      const picField = {base64Content: await db.imageUrlToBase64(picture),
        name:"picture.txt",
        mediaType: "application/octed-stream",
        enablePublicUrl:true}
      update_user.picture = picField;
    }
    
    // update user
    //console.log("update_user ",update_user)
    const ret_val = await db.addUser(update_user,true); // second param is true for update 
    //console.log("Google User Updated: ret_val :",ret_val);
    data = await db.findUserByEmail( email );
    //console.log("Google User : data :",data.records[0]);
  }
  // got user extract it from data.records
  const user = data.records[0];
  
  // first delete all old tokens for this userId
  const delCount= await deleteTokens(user.id);
  console.log("Deleted tokens ",delCount)
  return {user,error:""};
}



export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect('/login', { headers: { 'Set-Cookie': await destroySession(session) } });
  }
  
  function getUserSession(request: Request) {
    return getSession(request.headers.get('Cookie'));
  }
  
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set');
  }
  const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
      name: 'rag-session',
      secure: process.env.NODE_ENV === 'production',
      secrets: [sessionSecret],
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });
  export async function createUserSession(user: User, headers = new Headers()) {
    const session = await getSession();
    session.set('userId', user?user.id:null);
    headers.set('Set-Cookie', await commitSession(session));
    return headers;
  }
  
  // create validator, selector pair and set 'loginSVpair - input arg=remember 
  // return validator, selector, headers
  export async function createLoginSession(remember="",headers = new Headers()) {
    const session = await getSession();
    const selector = getRandomString(12);
    const validator = getRandomString(12);
    session.set('loginSVpair',selector+validator)
    session.set('remember',remember)
    headers.set("Set-Cookie",await commitSession(session))
    return {selector,validator,headers}
  }

  export async function requireUserId(request: Request) {
    //const session = await getUserSession(request);
    //const userId = session.get('userId');
    const userId = await getUserId(request);
    if (!userId || typeof userId !== 'string') {
      throw redirect('/login');
    }
    return userId;
  }

  // 1. get userId from session
  export async function getUserId(request: Request) {
    // two sources for userId - normal cookie and remember me cookie
    const session = await getUserSession(request);
    let userId = session.get('userId');
    if (userId) {
      return userId;
    } else {
      const authtoken = await getAuthToken(request)
      //console.log("getUserId: authtoken",authtoken);
      userId = authtoken? authtoken.userId.id:null;
      if (!userId || typeof userId !== 'string') return null;
      return userId;
    }
  }
 // 2. get user object from userId
  export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (typeof userId !== 'string') {
      return null;
    }
    try {
      return await db.findUserById(userId)

    } catch {
      throw await logout(request);
    }
  }

  //// Crpto-random-string
  export  function getRandomString(size) {
    if (typeof size === 'number')
      return cryptoRandomString({length:size});
    return(cryptoRandomString({length:10}));
  }

  // returns selector,validator,remember from session
  export async function getLoginSession(request:Request) {
    const session = await getSession(request.headers.get('Cookie'));
    const loginSVpair =  session.get("loginSVpair")
    const remember = session.get("remember");
    if (loginSVpair?.length>12) {
      return {selector:loginSVpair.substring(0,12),validator:loginSVpair.substring(12),remember}
    } else {
      return {}
    }
  }

  const TokenSchema = z.object({
    selector : z.string(),
    validator: z.string(),
    userId: z.string(),
  })

  type Token = z.infer<typeof TokenSchema>

  //add authtoken to db
  export async function addAuthToken(token:Token):Promise<T>{
    const {selector,validator,userId} = token;
    // create hash
    const hashedValidator = await bcrypt.hash(validator,10);

    try {
      return await db.addAuthtoken({selector,hashedValidator,userId})
    } catch (error) {
      throw new Error("Unable to create new authtoken")
    }
  }

  const EXPIRY = 60 * 60 * 24 * 30 //  (a month in seconds)
  // get authtoken
  export async function getAuthToken(request:Request):Promise<AuthToken>{
    const {selector,validator,remember} = await getLoginSession(request);
    if (!selector) { // there is no cookie for login
        //console.log("getAuthToken ",selector)
        return null
    }

    const data = await db.findTokendBySelector(selector);
    const authtoken = data.records[0];
    //console.log("getAuthToken ",JSON.stringify(authtoken,null,2));
    if (authtoken) { // hash
      const validToken = await bcrypt.compare(validator,authtoken.hashedValidator);
      if (validToken) { // check age (EXPIRY)
        const dateNow = Date.now();
        const createAt = new Date(authtoken.xata.createdAt);
        const ageInSecs = parseInt((dateNow-createAt)/1000);

        //console.log("getAuthToken: token is valid.  ageInSecs ",ageInSecs, dateNow/1000,createAt/1000);
        if (ageInSecs>EXPIRY) {
          //console.log("getAuthToken: Forcing logout- token expiry ",ageInSecs," > ",EXPIRY)
          // deleteMany shifted to loginUser
          throw await logout(request);
          //return {}
        }
        return authtoken;
      } else {
        // this should never happen
        return {}
      }
    }
  }

  export async function deleteTokens(userId:string) {
    
    if (userId) {// deleteMany records with same userId
      const delCount = await db.authtokenDeleteMany(userId) 
      return delCount;
    }
  }


  // get google user profile and jwt token.
export async function getGoogleProfile(request:Request) {
  const formData = await request.formData();
  const access_token = formData.get("access_token");
  //const expires_in = formData.get("expires_in");
  //const scope = formData.get("scope");
  let userdata
  try {
  // fetch profile
  const res = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
              headers: {
                  Authorization: `Bearer ${access_token}`,
                  Accept: 'application/json'
              }
          })
       userdata = await  res.json();
      } catch (error) {
          console.log("getGoogleProfile: (error) ",error)
          return null;
      }

  return userdata;
}
