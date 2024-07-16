//import type { User, AuthToken } from "@prisma/client/wasm";
import { createCookieSessionStorage,redirect } from "@remix-run/node";
import bcrypt from 'bcryptjs'
import cryptoRandomString from 'crypto-random-string';
import z from 'zod';
//import zx from 'zodix'
import db  from '../xata.server'

const regData = z.object({
    name: z.string(),
    email:z.string(),
    password:z.string(),
})
type RegistrationData = z.infer<typeof regData>
type UserLoginData = {
    email: string;
    password: string;
}

export async function registerUser({name,email,password}:RegistrationData):Promise<T> {
    const hashedPassword = await bcrypt.hash(password,10)
    const data = await db.findUserByEmail(email);
    const existingUser= Object.keys(data).includes('message');
    // Error: User Exists
    if (existingUser) { // Error: User Exists
        throw new Error(`User with email: ${email} already exists`);
    }

    try { // create new User
      const user = {name,email,password:hashedPassword}
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

  const EXPIRY = 60 * 60 * 24 * 30 // seconds
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