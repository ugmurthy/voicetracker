import { useState, useEffect, useCallback, useRef } from 'react';
import {createMicrophone} from '../modules/microphone'
import { analyseAllData, getPPMtranscript} from '../modules/evalspeech'
import WordDisplay from './WordsDisplay';
import ShowData from './ShowData';
import Clarity from './Clarity';
import AudioDownloader from './AudioDownloader';

import WordsPerMinute from './WordsPerMin';
import createWavFile from '~/modules/audioProcessor';

const AudioAssembly = ({url}) => {
    const samples=false;
    const [messages, setMessages] = useState([]);
    //const [inputMessage, setInputMessage] = useState("");
    const wsRef = useRef(null); //  persist WebSocket instance
    const [isOPEN,setIsOPEN] = useState(false)
    //const isOPEN = wsRef.current && wsRef.current.readyState === WebSocket.OPEN
    const terminate = {"terminate_session": true};
    const [isRecording, setIsRecording] = useState(false);
    const [audioSamples, setAudioSamples] = useState([]);
   
    const [microphone, setMicrophone] = useState(null);
    const [error, setError] = useState(null);
    const containerRef = useRef();
    const isConnecting = !error && !isOPEN && !isRecording && messages.length === 0;
    const reConnect =error || ( !isOPEN && !isRecording && messages.length  > 0);
    const showDownLoad = reConnect && !error;
    
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

  //[ida,tot_wc,duration,wpm,txt,tot_confidence] = analyseAllData(messages);
  // the tot_wc is cumulative word count
  // tot_confidence is cumulative confidence averaged over all partials
  // txt is an array of sentences
  const [ida,tot_wc,duration,wpm,txt,tot_confidence]=analyseAllData(messages);

  const finalResult = analyseAllData(messages,"Final");

  const durationStr = duration? Math.floor(duration*60)+ " s" : "";
  const confidence =tot_confidence?(tot_confidence?.toFixed(2)*100):""
  const wpmStr = wpm?wpm:"" + " wpm"

  const final_ida = finalResult[0];
  const punctuated_text = finalResult[4]
  /// pause processing
  
  const partial_data = ida?.map(r=>messages[r[0]])
  //const final_data = finalResult[0]?.map(r=>messages[r[0]]);
  const partial_ppm = partial_data?.length!==0? getPPMtranscript(partial_data)?.ppm:[];
  //const final_ppm = final_data?.length!==0?getPPMtranscript(final_data,"Final")?.ppm:[];
  //console.log("Partial PPM :",partial_ppm);
  //console.log("Final PPM :",punctuated_text);
  //console.log("Result :",punctuated_text);
  return (
    <div className="flex flex-col justify-center w-full max-w-6xl mx-auto bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="rounded-t-lg  w-full h-48 bg-cover bg-center bg-no-repeat bg-opacity-80" style={{"backgroundImage": ""}}>

        <h2 className="pt-20 text-center  text-6xl text-blue-500 font-bold mb-6">SpeechTrack</h2>
        </div>
    </div>
       
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
            {reConnect?<button onClick={clearSamples} className="btn btn-outline shadow-xl  btn-info btn-xs ">ReConnect</button>:""}
            {/*DOWNLOAD*/}
            {showDownLoad?<AudioDownloader audioBlob={createWavFile(audioSamples)} fileName={'audio.wav'} />:""}
            {/*STATUS */}
          <div className='flex space-x-2 items-center'>
            
            { (!isOPEN) ? <span className="badge badge-md badge-error">Disconnected</span> : <span className="badge badge-md badge-info">Connected</span> }
            
            {messages.length > 0 ?
            <>
            <span className="badge badge-neutral badge-md">{tot_wc} words</span>
            <span className='badge badge-neutral badge-md'>{wpmStr}</span>
            <span className='badge badge-neutral badge-md'>Duration {durationStr}</span>
            <span className='badge badge-neutral badge-md'>Clarity {confidence}</span>
            <span className='badge badge-neutral badge-md'>Partial ppm {partial_ppm}</span>
           
             </>:""}
            </div>
            
        </div>

        {error && (
          <div className="p-4 text-center">
            
            <span className='text-red-400 font-bold'>{error}</span>
          </div>
        )}
        {/*Main Sections - show only if there aren't any errors */}
        {((!error)&&!isConnecting)&&
        <div className="p-4 space-y-4 z-10">
          {/*Transcription */}
          <div ref={containerRef} className="p-4  overflow-y-auto rounded-box border border-base-300">
            {messages.length !== 0 &&  (
              <div className=' p-10 w-full bg-gray-100 rounded-lg'>
                <div className=''>
                <div className='divider'>PartialTranscript</div>
                { 
                ida.map((ary_id, index) => (
                    <div key={index} className="flex flex-wrap">
                        <WordDisplay  words={messages[ary_id[0]].words}/>    
                     </div>
  
                  ))
                }
              </div>
              <div className='divider'>FinalTranscript</div>
              <div className=''>
                { 
                final_ida.map((ary_id, index) => (
                    <div key={index} className="flex flex-wrap">
                        <WordDisplay  words={messages[ary_id[0]].words}/>    
                     </div>
  
                  ))
                }
              </div>
             

              </div>
              
            )}
          </div>
          <div className=" max-h-96 overflow-y-auto rounded-box border border-base-300">  
              {<ShowData data={punctuated_text?.join("")} raw={false} label="Punctuated Transcript"></ShowData>}
          </div>
          <div className="p-4 max-h-96 overflow-y-auto rounded-box border border-base-300">
              {<ShowData data={messages} label="Transcript Data"></ShowData>}
          </div>
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

*/