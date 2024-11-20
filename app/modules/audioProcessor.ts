const createWavFile = (audioData: ArrayBuffer[]): Blob => {
    // Combine all chunks
    const totalLength = audioData.reduce((acc, chunk) => acc + chunk.byteLength, 0)
    // totallength is sigma bytelength of all chunks
    // chunk is instance of Uint8Array
    
    // we need 16 bit integer array to store the data
    // that would have 2 bytes per sample therefore half the total length
    const combinedData = new Int16Array(totalLength/2)
    let offset = 0 // to keep track of where we are in the combinedData array
    audioData.forEach(chunk => {
      const view = new Int16Array(chunk.buffer)
      //console.log(view.length);
      //console.log(`offset ${offset} chunksize ${chunk.byteLength}, viewLength ${view.length}, view bytes ${view.byteLength}  `)
      combinedData.set(view, offset)
      offset += view.length;
    })

    // Create WAV header
    const wavHeader = new ArrayBuffer(44)
    const view = new DataView(wavHeader)

    // "RIFF" identifier
    view.setUint32(0, 0x52494646, false)
    // File length
    view.setUint32(4, 36 + combinedData.length * 2, true)
    // "WAVE" identifier
    view.setUint32(8, 0x57415645, false)
    // "fmt " chunk header
    view.setUint32(12, 0x666D7420, false)
    // Chunk length
    view.setUint32(16, 16, true)
    // Sample format (1 is PCM)
    view.setUint16(20, 1, true)
    // Mono channel
    view.setUint16(22, 1, true)
    // Sample rate (16000 Hz)
    view.setUint32(24, 16000, true)
    // Byte rate
    view.setUint32(28, 16000 * 2, true)
    // Block align
    view.setUint16(32, 2, true)
    // Bits per sample
    view.setUint16(34, 16, true)
    // "data" chunk header
    view.setUint32(36, 0x64617461, false)
    // Data length
    view.setUint32(40, combinedData.length * 2, true)

    return new Blob([wavHeader, combinedData.buffer], { type: 'audio/wav' })
  }
   export default createWavFile;