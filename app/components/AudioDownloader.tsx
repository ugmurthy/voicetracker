//import { Download } from 'lucide-react';
import {useState,useEffect} from 'react';
//import { getTranscriptData } from '~/modules/evalspeech';
import { useLocation,Link } from '@remix-run/react';
//import { getFirstFinalText } from '~/modules/evalspeech';
import {sleep} from "../helpers/util"

const AudioDownloader = ({ audioBlob, fileName, update,errorUpdate ,save,commandObj="",inferencing=false}) => {
const location = useLocation();
const [isloading,setIsloading]=useState(false);
const [done,setDone]=useState(false);
const [labeltxt,setLabeltxt]=useState("Analyse Audio")
const command=commandObj?.text
let btncls = 'btn btn-xs btn-neutral btn-outline '
const btncls_save ='btn btn-xs btn-neutral btn-outline '
useEffect(()=>{
  if (inferencing) {
    setDone(true)
    setLabeltxt("Save Results");
  }
},[inferencing])


let what = ""
if (isloading) {
  what = "Uploading Audio & Transcript..."
}
if (inferencing) {
  what = "Asking LeMUR to Evaluate Speech..."
}
if (!inferencing&&done) {
  what = "Saved Results"
}

if (isloading||inferencing) {
  btncls = btncls+ ' loading '
}
const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;
const BASEURL=fullUrl.split("/");
BASEURL.pop()

async function handleUpload() { 
  // create File object, formdata and post
  setIsloading(true)
  const wavefile = new File([audioBlob],"audio.wav",{type:audioBlob.type,lastModified:Date.now()})
  //const URL = 'http://localhost:5173/api/upload'
  const URL = BASEURL.join("/")+"/api/upload"
  console.log("Uploading.... ",wavefile.name,wavefile.size,URL)
  const formData = new FormData();
  formData.append("command",command)
  console.log("CommandObj ",commandObj)
  formData.append("firstFinalTranscriptObj",JSON.stringify(commandObj))
  //formData.append("lastFinalTranscriptObj",JSON.stringify(lastFinalObj))
  formData.append("audio",wavefile);
  const options = {
      method:"POST",
      body:formData,
  }
  try {
      let response;
          try {
            response = await fetch(URL,options);
          } catch(e) {
            handleError("Error during Fetch" + URL)
          }
      if (!response?.ok) {
          handleError(`Error: ${response?.status}`)
          //throw new Error(`Error: ${response?.status}`)
      }
      const data = await response?.json();
      //return value of /api/update is sent back to parent;
      update(data); // update parent
      console.log("transcript response:",isloading,data)
      setIsloading(false)
  } catch(err) {
      console.log("Error uploading audio")
      handleError("Error uploading audio")
      
  }
}

function handleError(err_message) {
  //console.log("Error uploading audio: ",err)
  errorUpdate(err_message);
}

function handleSave() {
  sleep(5000);
  save();
}
    const handleDownload = () => {
    
     // const audioBlob = combineAudioChunks(audioChunks);
    //const fileName = 'audio.wav';
    const url = URL.createObjectURL(audioBlob);
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

 useEffect(()=>{
  if (done && !inferencing) {
    console.log("Saving Results...")
    save();
  } 
 },[done,inferencing])

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        
        <div className="w-full my-2">
          <audio 
            controls 
            src={audioBlob ? URL.createObjectURL(audioBlob) : ''} 
            className="w-full"
          />
        </div>
        
        <div className="card-actions flex items-center space-x-2">
        {<button onClick={handleUpload} className={btncls}>Analyse Audio</button>}
        {/*done&&!inferencing&&<button onClick={handleSave}  className={btncls_save}>Save Result</button>*/}
        {done&&!inferencing&&<button className={btncls_save}><a href="/addinfo" target="_blank">Show History</a></button>}
       
        </div>
        {<div className='text-xs font-thin'>{what}</div>}
        {/* Status Message */}
        {!audioBlob && (
          <div className="text-sm text-error mt-2">
            No audio file available
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDownloader;