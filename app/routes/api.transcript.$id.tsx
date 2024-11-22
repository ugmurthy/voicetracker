import { getTranscript } from "~/modules/assembly.server";
import { authenticate } from "~/modules/session.server";
import {redirect} from '@remix-run/react'

export async function loader({params}) {
    if (!await authenticate(request,"/assembly")) {
        return redirect("/")
       }
    console.log(`/api/transcript : id : ${params.id}`);
    const transcript = await getTranscript(params.id)
    return transcript;
}