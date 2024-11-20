// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// given a Partial transcript, return key stats
export function analysePartial(partial) {
    if (!partial.message_type.includes("Partial") || partial.text==='') {
        return null;
    }
    const start = partial.audio_start
    const end = partial.audio_end
    const duration = (end-start)
    const wc = partial.text.trim().split(/\s+/).length;
    const wpm = Math.floor(wc/(duration/1000/60)); // words/minute);
    return {duration,wc,wpm}
}

// clean up the transcript data
// looks only at Partial transcripts
// return 2 arrays and a duration and words per minute
// 1. array of two elments [index,start_time]
// 2. array of word counts per line of text
// 3. duration of the transcript in minutes
// 4. wordsper minute
// [ida,wc,duration,wpm]
export function analyseAllData(data,msgIncludes="Partial") {
    let idx={}
    let wc=0;
    for (let i=0;i<data.length;i++) {
        const msgType = data[i]["message_type"]
        if (msgType.includes(msgIncludes)) {
            var start = data[i]["audio_start"]
            idx[start]=i
        }
    }
    if (Object.keys(idx).length===0){
          console.log("No partial transcripts found");
          return [[],[],0]
        }
    const ida=[];
    _.forEach(idx, (value, key) => {ida.push([value,key])});

    const startTime = data[ida[0][0]]["audio_start"]
    const endTime =  data[ida[ida.length-1][0]]["audio_start"]
    // Wht is endTime taken from a partial["audio_start"] - this is 
    // to avoid counting trailing silence?
    const duration = (endTime-startTime)/1000/60; // minutes
    // get word count per line of text
    // if text is '' then it returns a 1 : TO FIX later
    
    wc=ida.map((i)=>data[i[0]].text.trim().split(/\s+/).length)
    let txt = ida.map((i)=>data[i[0]].text)
      txt = _.compact(txt);
    let confidence = ida.map((i)=>data[i[0]].confidence)
      confidence = _.compact(confidence)
    const tot_confidence = _.sum(confidence)/confidence.length
    const tot_wc = _.sum(_.compact(wc)); // total word count
    const wpm = Math.floor(tot_wc/duration); // words/minute
    return [ida,tot_wc,duration,wpm,txt,tot_confidence]
}
///// WORD FREQUENCY ///////////////////////////////////////////////////////////
export function getWordFrequency(text) {
  // Convert text to lowercase and split into words
  // Using regex to split on any whitespace and remove punctuation
  const words = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").split(/\s+/);
  
  // Create object to store frequency
  const frequency = {};
  
  // Count frequency of each word
  words.forEach(word => {
      if (word) {  // Only count non-empty strings
          frequency[word] = (frequency[word] || 0) + 1;
      }
  });
  const fa=[]
  //convert to array of value,key pairs
  _.forEach(frequency,(v,k)=>{fa.push([v,k])})
  const percentages=calculateWordPercentages(fa)
 
  return percentages;
}
export function calculateWordPercentages(frequencyPairs) {
  // Calculate total frequency
  const totalFrequency = frequencyPairs.reduce((sum, [freq]) => sum + freq, 0);
  
  // Calculate percentage for each word and sort by percentage descending
  const percentages = frequencyPairs
      .map(([frequency, word]) => ({
          word,
          frequency,
          percentage: (frequency / totalFrequency * 100).toFixed(2),
      }))
      .sort((a, b) => b.frequency - a.frequency);
  
  return percentages;
}
function getCumulativePercentages(frequencyAry){
  frequencyAry[0].cumulative = parseFloat(frequencyAry[0].percentage);
  for (let i = 1; i < frequencyAry.length; i++) {
    frequencyAry[i].cumulative = parseFloat(frequencyAry[i].percentage) + frequencyAry[i-1].cumulative;
  }
}


///// PAUSES  ///////////////////////////////////////////////////////////
export function getPPMtranscript(data, msgIncludes="Partial",THRESHOLD=0.5) {
  if (!Array.isArray(data) || data.length < 2) {
    return {pauses:0,totalTimeInSeconds:0};
  }
  // filter  message_type of interest
  const transcript = data.filter(item => item.message_type.includes(msgIncludes));
  if (transcript.length<2) {
    return {pauses:0,totalTimeInSeconds:0};
  }
  console.log('f(getPPMtranscript) ',transcript);
  // const THRESHOLD = 0.5; // in seconds (adjust as needed)
  const MINUTE_IN_SECONDS = 60;
  let pauses = 0;
  const end=transcript[transcript.length - 1].audio_end;
  const start = transcript[0].audio_start;
  let totalTimeInSeconds = (end - start) / 1000;
  console.log(totalTimeInSeconds);
  const wordPPM=[]
  wordPPM.push(getPPMwords(transcript[0].words));
  for (let i = 1; i < transcript.length; i++) {
      const pauseDuration = ( transcript[i].audio_start - transcript[i - 1].audio_end) / 1000; // pause in seconds
      wordPPM.push(getPPMwords(transcript[i].words)); // get pauses between words
      if (pauseDuration > THRESHOLD) {
          pauses++;
      }
  }
  if (totalTimeInSeconds === 0) {
    return {pauses,totalTimeInSeconds}; // Avoid division by zero
  }
  const wordPauses = _.sum(wordPPM);
  const total_pauses = pauses + wordPauses
  const ppm = ((total_pauses / totalTimeInSeconds) * MINUTE_IN_SECONDS).toFixed(2);
  return {ppm,total_pauses,totalTimeInSeconds,transcriptPauses:pauses,wordPauses};
}


// Get # pauses  - a pause is defined by threshold value
// default threshold is 0.5 seconds
// arg : word arry from transcript
export function getPPMwords(w, THRESHOLD=0.5) {
  if (!Array.isArray(w) || w.length < 2) {
    return 0;
  }
  const words = _.compact(w)
  let pauses = 0;
  for (let i = 1; i < words.length; i++) {
      const pauseDuration = (words[i].start - words[i - 1].end) / 1000; // pause in seconds
      if (pauseDuration > THRESHOLD) {
          pauses++;
      }
  }
  return pauses;
}



