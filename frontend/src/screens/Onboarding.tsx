import { useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Chip from "../components/Chip";
import type { SpikeMood } from "../components/Spike";

export default function Onboarding({ onDone }: { onDone?: () => void }) {
  const interests = ["Reading", "Cooking", "Fitness", "Music", "Outdoors", "Art", "Gaming"];
  const [selected, setSelected] = useState(["Reading", "Cooking", "Outdoors"]);
  const [spice, setSpice] = useState(2);
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  return <main className="screen onboarding">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={moods[spice - 1]}>I’m Spike. I’ll lovingly roast you off your feed and back into your life.</ChatBubble>
    <div className="section-heading"><span>What are you into?</span><small>Pick a few. I’m not psychic.</small></div>
    <div className="chips">{interests.map(i => <Chip key={i} active={selected.includes(i)} onClick={() => setSelected(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i])}>{i}</Chip>)}</div>
    <div className="spice-card">
      <div className="row-between"><div><strong>Burn Spice Level</strong><small>{["Mild", "Playful", "Sassy", "Extra spicy"][spice - 1]}</small></div><div className="peppers" aria-label={`${spice} out of 4 peppers`}>{[1,2,3,4].map(n => <span className={n <= spice ? "hot" : ""} key={n}>●</span>)}</div></div>
      <input aria-label="Chirp spice" type="range" min="1" max="4" value={spice} onChange={e => setSpice(Number(e.target.value))}/>
      <div className="slider-labels"><span>nice-ish</span><span>no mercy*</span></div>
    </div>
    <div className="defaults"><span>Default suggestions</span><div className="chips"><Chip active>Free only</Chip><Chip active>Stay nearby</Chip><Chip active>≤ 1 hour</Chip></div></div>
    <Button onClick={onDone}>Let’s go</Button>
  </main>;
}
