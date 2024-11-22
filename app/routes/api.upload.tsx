import { fileUpload, getTranscriptFromURL } from "~/modules/assembly.server";
//import {getFormData} from "../helpers/webUtils.server"
import { authenticate } from "~/modules/session.server";
import { redirect } from "@remix-run/node"; // or "@remix-run/cloudflare" if using Cloudflare
import {getCommand} from "../modules/evalspeech"
export async function action({ request }) {
  console.time("/api/upload fileUpload")
  if (!await authenticate(request,"/assembly")) {
    return redirect("/")
   }
  const formData = await request.formData();
  const file = formData.get("audio");
  const firstline = formData.get("command");
  console.log("/api/upload ",firstline)
  if (!file || typeof file === "string") {
    throw new Error("File upload failed or file was not provided.");
  }
  console.log(`/api/upload :Received file: ${file.name}`);
  const data = await  fileUpload(file)
  console.timeEnd("/api/upload fileUpload")
  console.time("/api/upload getTranscriptFromURL")
  /// process commands here.
  const command = getCommand(firstline)
  let transcript_data = await getTranscriptFromURL(data.upload_url,command);
  //console.log("/api/upload : TranscriptData : ",JSON.stringify(transcript_data))
  console.timeEnd("/api/upload getTranscriptFromURL")
  if(Object(transcript_data).hasOwnProperty("id")) {
      transcript_data = {...transcript_data,firstline:firstline}
    }
  return transcript_data;
}