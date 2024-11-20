import { getTranscript } from "~/modules/assembly.server";

export async function loader({params}) {
    console.log(`id : ${params.id}`);
    const transcript = await getTranscript(params.id)
    return transcript;
}