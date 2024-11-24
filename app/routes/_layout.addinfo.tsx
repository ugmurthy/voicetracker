import Markdown from "~/components/Markdown";
import ShowData from "~/components/ShowData";
import { getResults,clearResults } from "~/helpers/localStoraageUtils";




export async function clientLoader() {
    return null;
}

export function HydrateFallback() {
    return <h1>Loading...</h1>;
}


function SubComponent({label,text}) {
    return (
        <div>
                <div className="pb-2 text-xl">{label}</div>
                {<div className="px-2 pb-4 text-sm text-blue-600">{text}</div>}
        </div>
    )
}
function ShowMore({label,data}) {
    //console.log(label)
    //console.log(data.feedback)
    /*
    {
    "feedback":"..."
    "transcript_text": [ ],
    "created": "2024-11-23T02:37:18.036482",
    "wpm": 129.47368421052633,
    "ppm": 6.315789473684211,
    "confidence": 0.91125596,
    "wc": 41,
    "pause": 2
}
    */
    console.log(data)
    const afTitle = "### Analysis and Feedback\n\n"
    const trTitlw = "### Transcript\n\n"
    const text = data.text
    const stats = {wpm:data.wpm,ppm:data.ppm,pause:data.pause,confidence:data.confidence,wc:data.wc}
    const summary=data?.summary;
    const sentiment = data.sentiment_analysis?.map((s)=>s.sentiment+":"+s.text)
    

    return (
        <div className="p-4">
            <div className="divider">{label}</div>
            <ShowData data={stats} label={"SpeechStats"}></ShowData>
            <Markdown markdown={afTitle+data.feedback}></Markdown>
            <p className="divider"></p>
            {text&&<SubComponent label={"Transcript"} text={text}></SubComponent>}
            {summary&&<SubComponent label={"Summary"} text={summary}>{}</SubComponent>}
            {sentiment&&<ShowData label="sentiment" data={sentiment}></ShowData>}
        </div>
    )
}

export default function Component() {
const storedData = getResults()
if (!storedData) {
    return <div>No Data found</div>
}

const showdata =  storedData?.map((s)=>[JSON.parse(s.result),s.timestamp]);
const showJSX = showdata.map((j,i)=> <ShowData key={i} label={i+" :"+j[1]} data={j[0]}></ShowData>)
const divJSX = showdata.map((j,i)=> <ShowMore key={i} label={j[1]} data={j[0]}></ShowMore>)

return (
        <div className="container">
            <h2 className="pt-6 text-center">Last 3 Speech Results</h2>
            <div className="p-6">
                {divJSX}
            </div>
            <div>
               
            </div>
        </div>
    )
}