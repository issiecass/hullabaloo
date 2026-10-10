import { useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Chip from "../components/Chip";
import SpiceCard from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import { defaultFilters, filterOptions, type FilterId } from "../data";

export default function Onboarding({ onDone }: { onDone?: (prefs: { interests: string[]; spice: number; filters: FilterId[] }) => void }) {
  const interests = ["Reading", "Cooking", "Fitness", "Music", "Outdoors", "Art", "Gaming"];
  const [selected, setSelected] = useState(["Reading", "Cooking", "Outdoors"]);
  const [spice, setSpice] = useState(2);
  const [filters, setFilters] = useState(defaultFilters);
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  return <main className="screen onboarding">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={moods[spice - 1]}>I’m Spike. I’ll lovingly roast you off your feed and back into your life.</ChatBubble>
    <div className="section-heading"><span>What are you into?</span><small>Pick a few. I’m not psychic.</small></div>
    <div className="chips">{interests.map(i => <Chip key={i} active={selected.includes(i)} onClick={() => setSelected(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i])}>{i}</Chip>)}</div>
    <SpiceCard spice={spice} onChange={setSpice}/>
    <div className="defaults"><span>Default suggestions</span><div className="chips">{filterOptions.map(f => <Chip key={f.id} active={filters.includes(f.id)} onClick={() => setFilters(v => v.includes(f.id) ? v.filter(x => x !== f.id) : [...v, f.id])}>{f.longLabel}</Chip>)}</div></div>
    <Button onClick={() => onDone?.({ interests: selected, spice, filters })}>Let’s go</Button>
  </main>;
}
