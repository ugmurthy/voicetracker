import { fileUpload, getTranscriptFromURL } from "~/modules/assembly.server";
//import {getFormData} from "../helpers/webUtils.server"
import { authenticate } from "~/modules/session.server";
import { redirect } from "@remix-run/node"; // or "@remix-run/cloudflare" if using Cloudflare

export async function action({ request }) {
  console.time("/api/upload fileUpload")
  if (!await authenticate(request,"/assembly")) {
    return redirect("/")
   }
  const formData = await request.formData();
  const file = formData.get("audio");

  if (!file || typeof file === "string") {
    throw new Error("File upload failed or file was not provided.");
  }
  console.log(`/api/upload :Received file: ${file.name}`);
  const data = await  fileUpload(file)
  console.timeEnd("/api/upload fileUpload")
  console.time("/api/upload getTranscriptFromURL")
  //console.log(`/api/upload :file uploaded: ${JSON.stringify(data)} `)
  const transcript_data = await getTranscriptFromURL(data.upload_url);
  //console.log("/api/upload : TranscriptData : ",JSON.stringify(transcript_data))
  console.timeEnd("/api/upload getTranscriptFromURL")
  return transcript_data;
}