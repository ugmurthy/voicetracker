import { Download } from 'lucide-react';

const AudioDownloader = ({ audioBlob, fileName }) => {
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
        <h2 className="card-title">Audio Player</h2>
        
        <div className="w-full my-4">
          <audio 
            controls 
            src={audioBlob ? URL.createObjectURL(audioBlob) : ''} 
            className="w-full"
          />
        </div>
        
        <div className="text-sm text-base-content/70 mb-4">
          {fileName}
        </div>
        
        <div className="card-actions">
          <button
            onClick={handleDownload}
            disabled={!audioBlob}
            className="btn btn-primary gap-2"
          >
            <Download className="w-4 h-4" />
            Download Audio
          </button>
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