import { useState } from "react";
import ActivityCard from "../components/ActivityCard";
import Button from "../components/Button";
import Chip from "../components/Chip";
import TopBar from "../components/TopBar";
import { activities } from "../data";

export default function Activities({ onStart }: { onStart?: () => void }) {
  const [active, setActive] = useState(0);
  return <main className="screen activity-screen">
    <TopBar title="Escape plan"/>
    <div className="activity-intro"><p>Three better ideas</p><h1>Pick your antidote.</h1></div>
    <div className="chips filter-chips"><Chip active>Free</Chip><Chip active>Nearby</Chip><Chip active>≤ 1 hour</Chip></div>
    <div className="card-stack" onClick={() => setActive((active + 1) % 3)}>
      {[2,1,0].map((offset) => { const index = (active + offset) % 3; return <div className={`stack-pos pos-${offset}`} key={`${active}-${offset}`}><ActivityCard activity={activities[index]}/></div>; })}
    </div>
    <div className="swipe-hint"><span>←</span> Swipe to browse <span>→</span></div>
    <div className="dual-actions"><Button variant="secondary" icon="refresh">Reroll</Button><Button icon="play" onClick={onStart}>Start</Button></div>
  </main>;
}
