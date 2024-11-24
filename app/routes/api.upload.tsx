/*
Imp:
1. Get audio_end from first FinalTranscript
2. Get commands first FinalTranscript.text


*/


import { fileUpload, getTranscriptFromURL } from "~/modules/assembly.server";
//import {getFormData} from "../helpers/webUtils.server"
import { authenticate } from "~/modules/session.server";
import { redirect } from "@remix-run/node"; // or "@remix-run/cloudflare" if using Cloudflare
import {getCommand} from "../modules/evalspeech"
export const maxDuration = 30;
export async function action({ request }) {
  console.time("/api/upload fileUpload")
  if (!await authenticate(request,"/assembly")) {
    return redirect("/")
   }
  const formData = await request.formData();
  const file = formData.get("audio");
  //const firstline = formData.get("command");
  
  let firstFinalTranscriptObj = formData.get("firstFinalTranscriptObj")
  
  firstFinalTranscriptObj = JSON.parse(firstFinalTranscriptObj);
  //console.log("/api/upload ",firstFinalTranscriptObj);
  const firstline = firstFinalTranscriptObj?.text
  /// where should we process audio from = end of first sentencte
  /// only if firstline contains words like (summary,sentiment)
  const audio_start_from = firstFinalTranscriptObj.audio_end
  //Start UPLOAD wav file
  const command = getCommand(firstline)
  //console.log("/api/upload first line",firstline)
  //console.log("/api/upload command ",command)
  //console.log("/api/upload first FinalTranscriptObj ",JSON.stringify(firstFinalTranscriptObj))

  if (!file || typeof file === "string") {
    throw new Error("File upload failed or file was not provided.");
  }
  
  const data = await  fileUpload(file)
  console.timeEnd("/api/upload fileUpload")

  /// START getting transcript for audio URL
  console.time("/api/upload getTranscriptFromURL")
  console.log("/api/upload getTranscriptFromURL",{...command,audio_start_from})
  const transcript_data = await getTranscriptFromURL(data.upload_url,{...command,audio_start_from});
  console.timeEnd("/api/upload getTranscriptFromURL")

  if(Object(transcript_data).hasOwnProperty("id")) {
      transcript_data.firstline = firstline;
      transcript_data.firstObj=firstFinalTranscriptObj;
      //console.log("/api/upload combined transcript data",transcript_data)
      return transcript_data;
    }
  return null;
}