

import {AssemblyAI} from 'assemblyai'
import {SPEECH_PROMPT,tail} from './system.server'
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY 
  })
const BASEURL = "https://api.assemblyai.com/v2/";
const APIKEY = process.env.NODE_ENV==='development'
                ? process.env.ASSEMBLY_API_KEY:"";
const EXPIRY=process.env.NODE_ENV==='development'?28800:480
            

const headers = {
    "Authorization": APIKEY,
    "content-type": "application/json",
};
const TOKEN_URL= 'realtime/token'
//// REST API

export async function getAssemblyToken(FROM_USER_APIKEY="") {
    const url = BASEURL + TOKEN_URL;
    headers.Authorization=process.env.NODE_ENV==='cdevelopment'
            ? APIKEY
            : FROM_USER_APIKEY
    //console.log('url :',url)
    const body = JSON.stringify({
        "expires_in": EXPIRY
      })

    const response = await fetch(url, {
        method: "POST",
        headers,
        body,
    });

    //console.log("======\n",response,"========\n");
    if (response.status !== 200) {
        console.log(`f(getAssemblyToken): Failed to get AssemblyAI Token`)
        return null
        //throw new Error("Failed to get AssemblyAI token");  
        }
    const data = await response.json();
    console.log(`f(getAssemblyToken): getting token`)
    return data.token;
}
export async function getHeader() {
    return headers;
}
export async function getTranscript(id) {
    const url = BASEURL + `transcript/${id}`;
    console.log('url :',url)
    

    const response = await fetch(url, {
        method: "GET",
        headers,
    });

    //console.log("======\n",response,"========\n");
    if (response.status !== 200) {
        throw new Error("Failed to get AssemblyAI token");  
        }
    const data = await response.json();
    return data;
}

export async function fileUpload(file:File) {
    console.time("f(fileUpload)")
    const url = BASEURL + `upload`;
    console.log('url :',url)
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body:file
        });
        if (response.ok) {
            const data = await response.json();
            console.log("f(fileUpload) : Uploaded Successfully ",data);
            // returns obj: {upload_url: "urlstringto audio file"}
            console.timeEnd("f(fileUpload)")
            return data;
        }
    } catch (e) {
        console.log("f(fileUpload) : Error uploding file ",e);
        throw new Error("f(fileUpload) : Error uploding file ")
    }
}

// SDK assembly API
// use assembly.ai api to get transcript give an audio blob
export async function askLeMUR(transcript_id,results) {
    // inject Instruction prompt with
    // structured results relating parameter
    // and final instruction for the task and output format
    console.time("f(askLeMUR)")
    //console.log("f(askLeMUR) command ",results?.command);
    const prompt = SPEECH_PROMPT + tail.Speech;
    
    let retval
    try {
     retval = await client.lemur.task({
        transcript_ids:[transcript_id],
        prompt,
        final_model:'anthropic/claude-3-5-sonnet'
    })
    //console.log("f(askLeMUR): Response");
    //console.log(retval.response);
    console.timeEnd("f(askLeMUR)");

    return retval.response;
    } catch(e) {
        console.log("Error Response ",retval)
        return {error:e}
    }
}

export async function getTranscriptFromURL(audioURL,command){
    try {
        //console.log(`f(getTranscriptFromURL)`,params)
        const params = {audio:audioURL,disfluencies:true,...command}
        console.log(`f(getTranscriptFromURL)`,params)
        const transcript = await client.transcripts.transcribe(params)
        return transcript
    } catch (e) {
        console.log("f(getTranscriptFromURL) Error ",e)
        return Error(`f(getTranscriptFromURL): failed`) 
    }
}