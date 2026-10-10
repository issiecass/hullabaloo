import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Chip from "../components/Chip";
import SpiceCard from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import { defaultFilters, filterOptions, freeHourOptions, type Answers, type FilterId } from "../data";

export type Prefs = { interests: string[]; spice: number; filters: FilterId[]; answers: Answers };

const toggle = <T,>(list: T[], item: T) => list.includes(item) ? list.filter(x => x !== item) : [...list, item];

export default function Onboarding({ initial, onDone }: { initial?: Partial<Prefs>; onDone?: (prefs: Prefs) => void }) {
  const interests = ["Reading", "Cooking", "Fitness", "Music", "Outdoors", "Art", "Gaming"];
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState(initial?.interests ?? ["Reading", "Cooking", "Outdoors"]);
  const [spice, setSpice] = useState(initial?.spice ?? 2);
  const [filters, setFilters] = useState(initial?.filters ?? defaultFilters);
  const [answers, setAnswers] = useState<Answers>(initial?.answers ?? { meaningTo: "", freeHour: [], people: "", avoid: "" });
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onDone?.({ interests: selected, spice, filters, answers: { ...answers, meaningTo: answers.meaningTo.trim(), people: answers.people.trim(), avoid: answers.avoid.trim() } });
  }

  if (step === 2) return <main className="screen onboarding">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={moods[spice - 1]} compact>Four quick questions, so my ideas are about you and not some generic human. Skip any you like.</ChatBubble>
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="field"><span>What have you been meaning to start or get back to?</span><input type="text" placeholder="Guitar, running, that half-read novel" value={answers.meaningTo} onChange={e => setAnswers({ ...answers, meaningTo: e.target.value })}/></label>
      <div className="field"><span>A good free hour looks like…</span><div className="chips">{freeHourOptions.map(o => <Chip key={o} active={answers.freeHour.includes(o)} onClick={() => setAnswers({ ...answers, freeHour: toggle(answers.freeHour, o) })}>{o}</Chip>)}</div></div>
      <label className="field"><span>Who do you wish you saw more?</span><input type="text" placeholder="My sister, friends from college" value={answers.people} onChange={e => setAnswers({ ...answers, people: e.target.value })}/></label>
      <label className="field"><span>Anything I should never suggest?</span><input type="text" placeholder="No car, bad knee, hate cooking" value={answers.avoid} onChange={e => setAnswers({ ...answers, avoid: e.target.value })}/></label>
      <Button>Let’s go</Button>
    </form>
    <button type="button" className="link-btn" onClick={() => setStep(1)}>Back</button>
  </main>;

  return <main className="screen onboarding">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={moods[spice - 1]}>I’m Spike. I’ll lovingly roast you off your feed and back into your life.</ChatBubble>
    <div className="section-heading"><span>What are you into?</span><small>Pick a few. I’m not psychic.</small></div>
    <div className="chips">{interests.map(i => <Chip key={i} active={selected.includes(i)} onClick={() => setSelected(v => toggle(v, i))}>{i}</Chip>)}</div>
    <SpiceCard spice={spice} onChange={setSpice}/>
    <div className="defaults"><span>Default suggestions</span><div className="chips">{filterOptions.map(f => <Chip key={f.id} active={filters.includes(f.id)} onClick={() => setFilters(v => toggle(v, f.id))}>{f.longLabel}</Chip>)}</div></div>
    <Button onClick={() => setStep(2)}>Next</Button>
  </main>;
}
