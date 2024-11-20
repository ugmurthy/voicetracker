
const BASEURL = "https://api.assemblyai.com/v2/";
const APIKEY = process.env.ASSEMBLY_API_KEY;
const EXPIRY=process.env.NODE_ENV==='development'?28800:480
            

const headers = {
    "Authorization": APIKEY,
    "content-type": "application/json",
};
const TOKEN= 'realtime/token'
export async function getAssemblyToken() {
    const url = BASEURL + TOKEN;
    console.log('url :',url)
    const body = JSON.stringify({
        "expires_in": EXPIRY
      })

    const response = await fetch(url, {
        method: "POST",
        headers,
        body,
    });

    console.log("======\n",response,"========\n");
    if (response.status !== 200) {
        throw new Error("Failed to get AssemblyAI token");  
        }
    const data = await response.json();
    return data.token;
}