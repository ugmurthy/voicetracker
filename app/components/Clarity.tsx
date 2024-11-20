

function Clarity({confidence}) {
  let clarity = !confidence?0:confidence;
  if (!clarity) return <></>
  if (clarity > 100) clarity = 100;
  if (clarity < 0) clarity = 0
  const cval = getColor(clarity);

  const sty = { "--value": "70", "--size": "5rem", "--thickness": "8px", "background-color":"green","opacity":"0.8" };
  sty["--value"] = clarity.toString();
  sty["background-color"] = cval;
  //console.log("Color ",cval)

  const cls = `radial-progress `;
  console.log("Clarity ,cls",clarity,cls)
  return (
    <div className={cls} style={sty} role="progressbar">{clarity}%</div>
  )
}

export default Clarity
// <div className={cls} style={{ "--value": "50", "--size": "12rem", "--thickness": "6px", "background-color":{cval}}} role="progressbar">{clarity}%</div>

function getColor(value) {
  // clarity is 0-100 0 is bad 100 is good

  if (value >= 70) {
    return '#22c55e'; // green-500
  } else if (value >= 0.50) {
    return '#3b82f6'; // blue-500
  } else if (value >= 0.40) {
    return '#fde047'; // yellow-300
  } else {
    return '#ef4444';
  }

  }
