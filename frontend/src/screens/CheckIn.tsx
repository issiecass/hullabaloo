import { useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import { Wheel } from "../components/TimerSheet";
import TopBar from "../components/TopBar";
import { formatMinutes, type Activity } from "../data";

// The one step between picking an idea and the receipt: the user says how long the activity really took.
// That number is the XP on the receipt (1 minute = 1 XP).

function reaction(actual: number, listed: number) {
  if (actual === 0) return "Zero minutes? Nice try. Spin the wheels.";
  if (actual < listed) return `${formatMinutes(listed - actual)} faster than listed? Speedrun. XP counts what you actually did.`;
  if (actual > listed) return `${formatMinutes(actual - listed)} over? You got into it. More time, more XP.`;
  return "Right on the dot. Suspiciously punctual.";
}

export default function CheckIn({ activity, onFinish, onBack }: { activity: Activity; onFinish?: (actualMinutes: number) => void; onBack?: () => void }) {
  // Starts at the listed time; the wheels go up to 23 hr 59 min (the backend's limit is a day).
  const [hours, setHours] = useState(Math.min(23, Math.floor(activity.minutes / 60)));
  const [minutes, setMinutes] = useState(activity.minutes % 60);
  const [busy, setBusy] = useState(false);
  const total = hours * 60 + minutes;
  const mood = total === 0 ? "sassy" : total > activity.minutes ? "proud" : total < activity.minutes ? "playful" : "mild";

  return <main className="screen checkin-screen">
    <TopBar title="Check in"/>
    <section className="checkin-activity">
      <div className="checkin-tags"><b>{activity.tag}</b><span>DONE</span></div>
      <h1>{activity.title}</h1>
      <div className="checkin-meta">
        <span>Listed {formatMinutes(activity.minutes)}</span><i>•</i>
        <span>{activity.nearby ? "Nearby" : "Worth the trip"}</span><i>•</i>
        <span>{activity.free ? "Free" : "Costs a little"}</span>
      </div>
    </section>
    <div className="checkin-spike">
      <ChatBubble mood={mood}>{reaction(total, activity.minutes)}</ChatBubble>
    </div>
    <section className="checkin-time">
      <div className="checkin-time-head">
        <h2>How long did it actually take?</h2>
        {total !== activity.minutes && <button type="button" className="checkin-reset" onClick={() => { setHours(Math.min(23, Math.floor(activity.minutes / 60))); setMinutes(activity.minutes % 60); }}>As listed</button>}
      </div>
      <div className="wheels two">
        <Wheel count={24} value={hours} unit="hr" onChange={setHours}/>
        <Wheel count={60} value={minutes} unit="min" onChange={setMinutes}/>
      </div>
      <Button disabled={busy || total === 0} onClick={() => { setBusy(true); onFinish?.(total); }}>Print my receipt · +{total} XP</Button>
      <button type="button" className="link-btn" onClick={onBack}>Not done yet? Back to ideas</button>
    </section>
  </main>;
}