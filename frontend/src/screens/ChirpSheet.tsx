import ChirpActions, { type ChirpHandlers } from "../components/ChirpActions";
import Spike from "../components/Spike";

export default function ChirpSheet(handlers: ChirpHandlers) {
  return <main className="feed-screen sheet-state">
    <div className="feed-head"><span className="feed-word">FOR YOU</span><div className="timer"><span>SESSION</span><strong>40:00</strong></div></div>
    <div className="feed-tile tile-one"><div className="video-label">DINNER<br/><b>IN 10</b></div></div>
    <div className="dim"/>
    <div className="half-sheet"><div className="handle"/><div className="sheet-spike"><Spike mood="sassy" size={104}/></div><div className="bubble standalone">40 minutes of cooking videos and zero meals made. Bold strategy.</div><ChirpActions {...handlers}/></div>
  </main>;
}
