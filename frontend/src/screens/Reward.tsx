import Button from "../components/Button";
import Spike from "../components/Spike";
import { formatMinutes, type Activity } from "../data";

// XP is the time the user reported spending: 1 minute = 1 XP.
// totalXp is the account's running total from the backend; it appears once the save comes back.
export default function Reward({ activity, actualMinutes, totalXp, tasksDone = 2, onDone }: { activity?: Activity; actualMinutes?: number; totalXp?: number | null; tasksDone?: number; onDone?: () => void }) {
  const listed = activity?.minutes ?? 35;
  const actual = actualMinutes ?? listed;
  const diff = actual - listed;
  const praise = diff < 0 ? "Faster than planned. Efficient and outside." : diff > 0 ? "Went long. That’s called enjoying something." : "Out here having a life and everything.";
  const verdict = diff < 0 ? `${formatMinutes(-diff)} UNDER` : diff > 0 ? `${formatMinutes(diff)} OVER` : "ON THE DOT";

  return <main className="screen reward-screen">
    <div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/>
    <Spike mood="proud" size={142}/>
    <h1>Okay, look at you.</h1><p className="praise">{praise}</p>
    <div className="receipt">
      <div className="receipt-brand">TOUCH GRASS</div><div className="receipt-sub">DOPAMINE RECEIPT</div>
      <div className="dash"/>
      <div className="receipt-row tall"><span>ACTIVITY</span><strong>{activity ? activity.title.toUpperCase() : <>MADE A REAL<br/>PASTA DINNER</>}</strong></div>
      <div className="receipt-row"><span>LISTED TIME</span><strong>{formatMinutes(listed).toUpperCase()}</strong></div>
      <div className="receipt-row"><span>TIME RECLAIMED</span><strong>{formatMinutes(actual).toUpperCase()}</strong></div>
      <div className="receipt-row"><span>VS. PLAN</span><strong>{verdict.toUpperCase()}</strong></div>
      <div className="receipt-row"><span>TASKS DONE</span><strong>{tasksDone}</strong></div>
      <div className="dash"/>
      <div className="receipt-total"><span>REAL-LIFE XP</span><strong>+{actual}</strong></div>
      {totalXp != null && <div className="receipt-row"><span>LIFETIME XP</span><strong>{totalXp}</strong></div>}
      <div className="receipt-foot">1 MINUTE = 1 XP<br/>NO INFINITE SCROLL REQUIRED<br/>THANK YOU FOR TOUCHING GRASS</div>
    </div>
    <Button onClick={onDone}>Done</Button>
  </main>;
}