import Button from "../components/Button";
import Spike from "../components/Spike";
import type { Activity } from "../data";

export default function Reward({ activity, tasksDone = 2, onDone }: { activity?: Activity; tasksDone?: number; onDone?: () => void }) {
  return <main className="screen reward-screen">
    <div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/>
    <Spike mood="proud" size={142}/>
    <h1>Okay, look at you.</h1><p className="praise">Out here having a life and everything.</p>
    <div className="receipt">
      <div className="receipt-brand">TOUCH GRASS</div><div className="receipt-sub">DOPAMINE RECEIPT</div>
      <div className="dash"/>
      <div className="receipt-row"><span>TIME RECLAIMED</span><strong>{activity ? activity.minutes : 42} MIN</strong></div>
      <div className="receipt-row tall"><span>ACTIVITY</span><strong>{activity ? activity.title.toUpperCase() : <>MADE A REAL<br/>PASTA DINNER</>}</strong></div>
      <div className="receipt-row"><span>TASKS DONE</span><strong>{tasksDone}</strong></div>
      <div className="dash"/>
      <div className="receipt-total"><span>REAL-LIFE XP</span><strong>+120</strong></div>
      <div className="receipt-foot">NO INFINITE SCROLL REQUIRED<br/>THANK YOU FOR TOUCHING GRASS</div>
    </div>
    <Button onClick={onDone}>Done</Button>
  </main>;
}
