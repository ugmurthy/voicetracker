import { Download } from 'lucide-react';
import {useState} from 'react';
import { getTranscriptData } from '~/modules/evalspeech';
import { useLocation } from '@remix-run/react';

const AudioDownloader = ({ audioBlob, fileName, update ,loading=false}) => {
const location = useLocation();
const [isloading,setIsloading]=useState(loading);
let btncls = 'btn btn-xs btn-neutral btn-outline '
if (isloading) {
  btncls = btncls+ ' loading '
}
const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;
let BASEURL=fullUrl.split("/");
BASEURL.pop()

async function handleUpload() { 
  // create File object, formdata and post
  setIsloading(true)
  const wavefile = new File([audioBlob],"audio.wav",{type:audioBlob.type,lastModified:Date.now()})
  //const URL = 'http://localhost:5173/api/upload'
  const URL = BASEURL.join("/")+"/api/upload"
  console.log("Uploading.... ",wavefile.name,wavefile.size,URL)
  const formData = new FormData();
  formData.append("audio",wavefile);
  const options = {
      method:"POST",
      body:formData,
  }
  try {
      const response = await fetch(URL,options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response?.json();
      //setTranscript(data);
      update(data); // update parent
      console.log("transcript response:",isLoading,data)
      setIsloading(false)
  } catch(err) {
      console.log("Error uploading audio: ",err)
  }
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
        
        <div className="card-actions">
        <button onClick={handleUpload} className={btncls}>Analyse Audio</button>
        </div>
        
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