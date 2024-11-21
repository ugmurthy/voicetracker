

import {AssemblyAI} from 'assemblyai'
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY 
  })
const BASEURL = "https://api.assemblyai.com/v2/";
const APIKEY = process.env.ASSEMBLY_API_KEY;
const EXPIRY=process.env.NODE_ENV==='development'?28800:480
            

const headers = {
    "Authorization": APIKEY,
    "content-type": "application/json",
};
const TOKEN= 'realtime/token'
//// REST API

export async function getAssemblyToken() {
    const url = BASEURL + TOKEN;
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
        throw new Error("Failed to get AssemblyAI token");  
        }
    const data = await response.json();
    console.log(`f(getAssemblyToken): getting token`)
    return data.token;
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
            console.log("f(fileUpdate) : Uploaded Successfully ",data);
            // returns obj: {upload_url: "urlstringto audio file"}
            return data;
        }
    } catch (e) {
        console.log("f(fileUpdate) : Error uploding file ",e);
        throw new Error("f(fileUpdate) : Error uploding file ")
    }
}

// SDK assembly API
// use assembly.ai api to get transcript give an audio blob
export async function askLeMUR(transcript) {
    const prompt = 'Provide a brief summary of the transcript';
    let retval
    try {
     retval = await client.lemur.task({
        transcript_ids:[transcript.id],
        prompt,
        final_model:'anthropic/claude-3-5-sonnet'
    })
    console.log("LeMUR Response");
    console.log(retval);
    return retval.response;
    } catch(e) {
        console.log("Error Response ",retval)
        return {error:e}
    }
}

export async function getTranscriptFromURL(audioURL){
    try {
        const params = {audio:audioURL,disfluencies:true}
        const transcript = await client.transcripts.transcribe(params)
        return transcript
    } catch (e) {
        console.log("f(getTranscriptFromURL) Error ",e)
        return e
    }
}