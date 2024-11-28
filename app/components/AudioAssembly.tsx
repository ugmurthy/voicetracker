import { useState, useEffect, useCallback, useRef } from 'react';
import {Link} from '@remix-run/react'
import {createMicrophone} from '../modules/microphone.client'
import { analyseAllData,getFirstFinalTranscriptObj, getPPMtranscript, getTranscriptData} from '../modules/evalspeech'
import WordDisplay from './WordsDisplay';
import ShowData from './ShowData';
import Clarity from './Clarity';
import AudioDownloader from './AudioDownloader';
import Markdown from './Markdown'
import CommandCopy from './CommandCopy'
import WordsPerMinute from './WordsPerMin';
import createWavFile from '~/modules/audioProcessor.client';
import {getResults,saveResult,clearResults} from '~/helpers/localStoraageUtils'

const AudioAssembly = ({url}) => {
    const VERSION="V0.6 24-Nov-24"
    //const samples=false;
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null); //  persist WebSocket instance
    const [isOPEN,setIsOPEN] = useState(false)
    
    const terminate = {"terminate_session": true};
    const [isRecording, setIsRecording] = useState(false);
    const [audioSamples, setAudioSamples] = useState([]);
   
    // from child component AudioRecorder //
    const [tdata,setTdata]=useState(null);//contains transcript data after recording stops
    const [analysis,setAnalysis]=useState(null);
    // feedback
    const [feedback,setFeedback]=useState(null);
    const [inferencing,setInferencing]=useState(false);
    const [microphone, setMicrophone] = useState(null);
    const [error, setError] = useState("");
    const containerRef = useRef();
    const isConnecting = !error && !isOPEN && !isRecording && messages.length === 0;
    const reConnect =error || ( !isOPEN && !isRecording && messages.length  > 0);
    const showDownLoad = reConnect && !error // && !feedback;
    // tdata is true but feedback is null => we are infering
    // use it to keep loading sign on
    
    ///console.log("inferencing ",inferencing)
    /// WebSockets useEffet
useEffect(() => {
    let dataJSON={}
    if (!url) {
      console.error("WebSocket URL is required");
      return;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
        setIsOPEN(true);
      console.log("WebSocket connection established");
    };


    ws.onmessage = (event) => {
      try {
        dataJSON = JSON.parse(event.data);
         }
      catch{
        console.error("Error parsing JSON:", error);
      }
      if (Object.keys(dataJSON).includes("error")) {
        setError(dataJSON.error);
        console.error("Error from WebSocket:", dataJSON.error);
        return;
      }
      setMessages((prevMessages) => [...prevMessages, dataJSON]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      setIsOPEN(false);
      console.log("WebSocket connection closed");
    };

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log("Closing WebSocket connection");
        ws.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  };

///


  /// Microphone useEffect: stream audio to Assembly.ai
  useEffect(() => {
    const mic = createMicrophone();
    setMicrophone(mic);

    return () => {
      if (mic) {
        mic.stopRecording();
        // send {"terminate_session":true} to socket connection
        sendMessage(JSON.stringify(terminate));
        setIsOPEN(false); // connection will be closed by assembly.ai
        
      }
    };
  }, []);
  
  ///Scrollbottom useEffect: Ensure we are always on the last line of the transcription
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]); // Re-run effect whenever 'texts' changes
  // analysis
  useEffect(()=>{
    const  feedback= async() => {
      try {
      setInferencing(true);
      const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;
      let BASEURL=fullUrl.split("/");
      BASEURL.pop()
      const headers = {
        "content-type": "application/json",
      };
      const body = JSON.stringify(_analysis)
      const URL = BASEURL.join("/")+"/api/feedback"
      const options={method:"POST",headers,body}
      const response = await fetch(URL,options);
      if (response.ok) {
        const result =  await response.json()
        // update analysis
        // result,punctuated_text (from transcripts)
        setAnalysis((prevState)=> ({...prevState, ...{feedback:result,transcript_text:punctuated_text}}))
        setFeedback(result)
        setInferencing(false);
      } else {
        console.log("Error during POST /api/feedback ", response);
        setError("Time-out/Bad Gateway during POST /api/feedback "+response.status)
        setInferencing(false)
      }
    } // try
    catch (e){
      setError("Error in /api/feedback ");
      setInferencing(false);
    }
    }
    // analyse transcription 
    // Some info from transcription_data (created by /api/upload ) is transferred to _analysis
    // by following function
    const _analysis =getTranscriptData(tdata)
    setAnalysis(_analysis);
    //const id = tdata?.id;
    console.log("useEffect analysis",_analysis);
    feedback(); 
    
  },[tdata])
  // results


  const handleStartRecording = useCallback(async () => {
    try {
      if (!microphone) return;

      await microphone.requestPermission();
      await microphone.startRecording((audioBuffer) => {
        setAudioSamples((prev) => [...prev, audioBuffer]);
        sendMessage(audioBuffer); // send audioBuffer to socket connection
       
      });
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
      setIsRecording(false);
      sendMessage(JSON.stringify(terminate));
    }
  }, [microphone]);

  const handleStopRecording = useCallback(() => {
    if (microphone) {
      microphone.stopRecording();
      setIsRecording(false);
      //  send {"terminate_session":true} to socket connection
      sendMessage(JSON.stringify(terminate));
      setIsOPEN(false); // connection will be closed by assembly.ai
    }
  }, [microphone]);

  const clearSamples = useCallback(() => {
    document.location.reload();
  }, []);

  // sets transcript data to state var tdata
  // this is updated by child (AudioDownloader)
  const handleTranscriptUpdate = (tdata) => {
    setTdata(tdata);
    console.log("f(handleTranscriptUpdate): after /api/upload returns ",tdata)
  };
  // used by children
  const handleErrorUpdate = (err_message) => {
    setError(err_message);
    // we have a fetch error while asking leMUR.
  }
  // called from child component AudioDownloader
  // save data 
  const  handleSaveResult = ()=> {
    console.log("c(AudioAssemblu) : Saving evaluation report....");
    // analysis contains complete structure processed data
    // following keys will be stored to localStorage
    // feedback
    // transcript_text (original from streaming data)
    // text (final from transcript data
    // firstObj.created
    // duration, wc, wpm, ppm,confidence, pauses
    // id
    // summary
    // sentiment_analysys
    const s = {}
    const a = analysis 
      s.feedback=a.feedback;
      s.transcript_text = a.transcript_text;
      s.created = a.firstObj.created;
      s.duration = a.duration;
      s.wpm = a.wpm
      s.ppm = a.ppm 
      s.confidence = a.confidence;
      s.wc = a.wc;
      s.pause=a.pauses;
      s.text=a.text;
      s.summary=a.summary;
      s.sentiment_analysis=a.sentiment_analysis;
    saveResult(s);

  }
  //[ida,tot_wc,duration,wpm,txt,tot_confidence] = analyseAllData(messages);
  // the tot_wc is cumulative word count
  // tot_confidence is cumulative confidence averaged over all partials
  // txt is an array of sentences
  
  const [ida,tot_wc,duration,wpm,txt,tot_confidence]=analyseAllData(messages);
  
  const finalResult = analyseAllData(messages,"Final");
  const  firstFinalObj = getFirstFinalTranscriptObj(messages);
  //const firstFinalObj = finalTranscriptObj?.firstTranscript

  // following can be used to bind the start/end times for audio
  //const lastFinalObj = finalTranscriptObj?.lastTranscript

  const durationStr = duration? Math.floor(duration*60)+ " s" : "";
  const confidence =tot_confidence?((tot_confidence*100)?.toFixed(0)):""
  const wpmStr = wpm===Infinity|| !wpm?"wpm": (wpm +" wpm")

  const final_ida = finalResult[0];
  const punctuated_text = finalResult[4]
  /// pause processing
  
  const partial_data = ida?.map(r=>messages[r[0]])
  //const final_data = finalResult[0]?.map(r=>messages[r[0]]);
  const partial_ppm = partial_data?.length!==0? getPPMtranscript(partial_data)?.ppm:[];
  let feedbackFailed = "#### Mostlikely a timeout error"
  feedbackFailed = feedbackFailed + '\n\nPartial Results below:\n\n'
  feedbackFailed = "\n```\n" + analysis?.text + "\n```\n"
  return (
    <div className="flex flex-col justify-center w-full max-w-6xl mx-auto bg-base-100 shadow-lg">
      
        
        <div className="pt-4 text-center  text-4xl text-blue-700 font-bold ">SpeechTrack</div>
        < div className='text-xs text-center  text-blue-700'>Get a deeper understanding of Speech with <a href='https://www.assemblyai.com/' target="_blank" className='underline' > AssemblyAI</a></div>
        <div className='text-xs text-center font-thin text-gray-400 mb-6'>{VERSION}</div>
        
    
       
        <div className="flex flex-col items-center gap-6">
          <div className='flex space-x-2 items-center'>
          <Clarity confidence={confidence}/>
            <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={isConnecting || error}
                        className={`btn btn-circle btn-lg btn-outline shadow-2xl ${
                            isRecording ? 'btn-error' : 'btn-primary'
                        } ${isConnecting ? 'loading' : ''}`}
                        >
                        {!isConnecting && (
                            <span className="text-2xl">
                            {isRecording ? '◼' : '●'}
                            </span>
                        )}
            </button>
            <WordsPerMinute wpm={wpm}/>
            </div>
            {/*reConnect?<button onClick={clearSamples} className="btn btn-outline shadow-xl  btn-neutral btn-xs ">ReConnect</button>:""*/}
            {reConnect?<button className="btn btn-outline shadow-xl  btn-neutral btn-xs "><Link to="/api/token" reloadDocument>Next Speech</Link></button>:""}
            {/*DOWNLOAD*/}
            {showDownLoad?<AudioDownloader 
              audioBlob={createWavFile(audioSamples)} 
              fileName={'audio.wav'} 
              update={handleTranscriptUpdate}
              save={handleSaveResult}
              errorUpdate={handleErrorUpdate}
              commandObj={firstFinalObj}
              inferencing={inferencing}
            />:""}
            {/*STATUS */}
          <div className='flex space-x-2 items-center mb-2'>
            
            { (!isOPEN) ? <span className="badge badge-md badge-error">Disconnected</span> : <span className="badge badge-md badge-info">Connected</span> }
            
            {messages.length > 0 ?
            <>
            <span className="badge badge-neutral badge-md">{tot_wc} words</span>
            <span className='badge badge-neutral badge-md'>{wpmStr} </span>
            <span className='badge badge-neutral badge-md'>Duration {durationStr}</span>
            <span className='badge badge-neutral badge-md'>Clarity {confidence}</span>
            <span className='badge badge-neutral badge-md'>ppm {partial_ppm}</span>
           
             </>:""}
            </div>
            
        </div>

        {error && (
          <div className="p-4 text-center">
            <span className='text-red-400 font-bold'>{error}</span>
          </div>
        )}
        {/*Exception Section - show only  errors occur during /feedback */}
        {(error&&analysis&&!isConnecting&&!feedback)&&<Markdown markdown={feedbackFailed}></Markdown> }
         {/*Main Sections - show only if there aren't any errors */}
        {((!error)&&!isConnecting)&&
        <div className="p-4 space-y-4 z-10">
          {/*Analysis&Feedback*/}
          {feedback && <div className="p-4 max-h-96 overflow-y-auto rounded-box border border-base-300">
          <Markdown markdown={'## Analysis & Feedback\n\n '+feedback}></Markdown>
          <CommandCopy txt={'## Analysis & Feedback\n\n '+feedback} btnTxt="Copy"></CommandCopy>
          </div>}
          {/*Transcription */}
          <div ref={containerRef} className="p-4  overflow-y-auto rounded-box border border-base-300">
            {messages.length > 5 &&  (
              <div className=' p-10 w-full bg-gray-100 rounded-lg'>
                <div className=''>
                <div className='divider text-gray-500 text-sm font-thin'>Real Time Transcript indcating word confidence score in color</div>
                { 
                ida.map((ary_id, index) => (
                    <div key={index} className="flex flex-wrap">
                        <WordDisplay  words={messages[ary_id[0]].words}/>    
                     </div>
  
                  ))
                }
              </div>
              
              </div>
              
            )}
          </div>
       
         
         {feedback&& <div className=" max-h-96 overflow-y-auto rounded-box border border-base-300">  
              <ShowData data={analysis}  label="SpeechTrack Data"></ShowData>
            <ShowData data={messages}  label="Real Time Stream data"></ShowData>
          </div>}
          
        </div>
        } 
      </div>
    
  );
};

export default AudioAssembly;


/*
{samples &&  messages.map((message, index) => (
                  <li className="font-semibold font-mono text-xs" key={index}>{JSON.stringify(message)}</li>
                ))}


messages.map((message, index) => (
                    <li key={index}>
                        <WordDisplay  words={message.words}/>    
                     </li>

                     <div className=" max-h-96 overflow-y-auto rounded-box border border-base-300">  
              {<ShowData data={punctuated_text?.join("")}  label="Punctuated Transcript"></ShowData>}
          </div>
          



          <div className="p-4 max-h-96 overflow-y-auto rounded-box border border-base-300">
              {<ShowData data={tdata?.text} label="Audio Transcript"></ShowData>}
          </div>
            
          <div className="p-4 max-h-96 overflow-y-auto rounded-box border border-base-300">
              {<ShowData data={messages} label="Audio Stream Data"></ShowData>}
          </div>
*/