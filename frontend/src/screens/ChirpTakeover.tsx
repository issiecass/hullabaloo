import ChirpActions, { type ChirpHandlers } from "../components/ChirpActions";
import Spike from "../components/Spike";

export default function ChirpTakeover(handlers: ChirpHandlers) {
  return <main className="screen takeover">
    <div className="takeover-top"><span>INTERVENTION</span><strong>60:00</strong></div>
    <div className="sunburst"/><div className="big-spike"><Spike mood="spicy" size={184}/></div>
    <div className="bubble takeover-bubble">An hour of watching strangers live their lives. Should we try yours?</div>
    <p className="aside-copy">I say this with love and several tiny spines.</p>
    <ChirpActions {...handlers}/>
  </main>;
}
