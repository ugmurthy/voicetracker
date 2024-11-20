
export function createMicrophone() {
    let stream;
    let audioContext;
    let audioWorkletNode;
    let source;
    let audioBufferQueue = new Int16Array(0);
    
    return {
      async requestPermission() {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      },
      async startRecording(onAudioCallback) {
        if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext({
          sampleRate: 16_000,
          latencyHint: 'balanced'
        });
        source = audioContext.createMediaStreamSource(stream);
  
        await audioContext.audioWorklet.addModule('audio-processor.js');
        audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');
  
        source.connect(audioWorkletNode);
        audioWorkletNode.connect(audioContext.destination);
        audioWorkletNode.port.onmessage = (event) => {
          const currentBuffer = new Int16Array(event.data.audio_data);
          audioBufferQueue = mergeBuffers(audioBufferQueue, currentBuffer);
  
          const bufferDuration = (audioBufferQueue.length / audioContext.sampleRate) * 1000;
  
          if (bufferDuration >= 100) {
            const totalSamples = Math.floor(audioContext.sampleRate * 0.1);
            const finalBuffer = new Uint8Array(audioBufferQueue.subarray(0, totalSamples).buffer);
            audioBufferQueue = audioBufferQueue.subarray(totalSamples);
            if (onAudioCallback) onAudioCallback(finalBuffer);
          }
        }
      },
      stopRecording() {
        stream?.getTracks().forEach((track) => track.stop());
        audioContext?.close();
        audioBufferQueue = new Int16Array(0);
      }
    }
  }
  
  // Helper function to merge audio buffers
  export function mergeBuffers(buffer1, buffer2) {
    const result = new Int16Array(buffer1.length + buffer2.length);
    result.set(buffer1, 0);
    result.set(buffer2, buffer1.length);
    return result;
  }
  