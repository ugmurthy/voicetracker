import { askLeMUR, getTranscriptFromURL } from "~/modules/assembly.server";
//import {getFormData} from "../helpers/webUtils.server"

import { redirect } from "@remix-run/node"; // or "@remix-run/cloudflare" if using Cloudflare
import { authenticate } from "~/modules/session.server";
export const maxDuration = 30;
export async function action({ request }) {
  if (!await authenticate(request,"/assembly")) {
    return redirect("/")
  }
  const results =  await request.json()
  const transcript_id = results?.id;
  if (transcript_id) {
    console.log("/api/feedback ",transcript_id)
    const feedback = await askLeMUR(transcript_id,results)
    return feedback;
  }
  return null;
}