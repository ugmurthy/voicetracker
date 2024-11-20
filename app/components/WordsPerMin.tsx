

function WordsPerMinute({wpm}) {
  /*
  Color-Coded Feedback:
   - Display the current wpm rate in a color-coded format:
     - Green for the optimal 120-160 wpm range
     - Yellow for slightly outside the range (e.g., 100-120 wpm or 160-180 wpm)
     - Red for significantly outside the range (e.g., below 100 wpm or above 180 wpm)
   - This gives the speaker a quick, at-a-glance understanding of their pacing.

  */

  if (!wpm) return <></> 
  const cval = getColor(wpm);
  const sty = { "--value": "70", "--size": "5rem", "--thickness": "8px", "background-color":"green","opacity":"0.8" };
  sty["--value"] = wpm?.toString();
  sty["background-color"] = cval;
  //console.log("Color ",cval)

  const cls = `radial-progress `;
  
  return (
    <div className={cls} style={sty} role="progressbar">{wpm}</div>
  )
}

export default WordsPerMinute;
// <div className={cls} style={{ "--value": "50", "--size": "12rem", "--thickness": "6px", "background-color":{cval}}} role="progressbar">{clarity}%</div>

function getColor(value) {
  // clarity is 0-100 0 is bad 100 is good

  if (value>=120 && value <= 140) {
    return 'green';
  }
  if (value<=120 && value >= 100) {
    return 'yellow';
  }
  if (value>=140 && value <= 160) {
    return 'yellow';
  }
  if (value<=100) {
    return 'red';
  }
  if (value>=160) {
    return 'red';
  }
  return 'red';
}


