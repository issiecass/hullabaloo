import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Chip from "../components/Chip";
import SpiceCard from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import type { Answers, FilterId } from "../data";
import { cardLineRequests, generateOnboardingLines, spiceLineRequests, type LineRequest } from "../llm";
import { cards, interestOptions, interestsQuestion, interestsReaction, meaningToPlaceholder, meaningToQuestion, meaningToReaction, outro, skipReaction, spiceQuestion, spiceSamples, type CardOption, type Picks } from "../onboarding";

export type Prefs = { interests: string[]; spice: number; filters: FilterId[]; answers: Answers; picks: Picks };

const INTRO = "I’m Spike. Before I start roasting you, I need material.";
// Steps: 0 is interests, then one per card, then the typed question, then spice.
const MEANING_TO_STEP = cards.length + 1;
const SPICE_STEP = cards.length + 2;

// With `ai` off (the gallery preview) Spike only uses his written lines.
export default function Onboarding({ ai = false, initial, onDone, onExit }: { ai?: boolean; initial?: Partial<Prefs>; onDone?: (prefs: Prefs) => void; onExit?: () => void }) {  const [step, setStep] = useState(0);
  // Spike's latest line, shown above the current question.
  const [reaction, setReaction] = useState(INTRO);
  const [selected, setSelected] = useState(initial?.interests ?? []);
  const [custom, setCustom] = useState("");
  const [picks, setPicks] = useState<Picks>(initial?.picks ?? {});
  const [meaningTo, setMeaningTo] = useState(initial?.answers?.meaningTo ?? "");
  const [spice, setSpice] = useState(initial?.spice ?? 0);
  const [spiceTouched, setSpiceTouched] = useState(false);
  // Lines the model has written so far, by key. Anything missing falls back to the written line.
  const modelLines = useRef<Record<string, string>>({});
  const controllers = useRef<AbortController[]>([]);

  // Ask the model for lines ahead of time, so they are ready by the time the user gets there.
  function prepare(requests: LineRequest[], interests: string[]) {
    if (!ai) return;
    const controller = new AbortController();
    controllers.current.push(controller);
    generateOnboardingLines(requests, interests, controller.signal).then(found => { Object.assign(modelLines.current, found); }).catch(() => {});
  }

  useEffect(() => {
    prepare(cardLineRequests(cards.slice(0, 3)), []);
    return () => controllers.current.forEach(controller => controller.abort());
  }, []);

  const card = step >= 1 && step <= cards.length ? cards[step - 1] : null;
  const options = [...interestOptions, ...selected.filter(interest => !interestOptions.includes(interest))];
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  const mood = step === SPICE_STEP && spice ? moods[spice - 1] : "playful";
  const question = step === 0 ? interestsQuestion : card ? card.question : step === MEANING_TO_STEP ? meaningToQuestion : spiceTouched ? outro : spiceQuestion;

  function toggleInterest(interest: string) {
    setSelected(selected.includes(interest) ? selected.filter(x => x !== interest) : [...selected, interest]);
  }
  function addCustom(e: FormEvent) {
    e.preventDefault();
    const clean = custom.trim();
    if (clean && !selected.some(interest => interest.toLowerCase() === clean.toLowerCase())) {
      const known = interestOptions.find(option => option.toLowerCase() === clean.toLowerCase());
      setSelected([...selected, known ?? clean]);
    }
    setCustom("");
  }
  function sendInterests() {
    // The later cards and the spice samples are requested now, so they can use the interests.
    prepare([...cardLineRequests(cards.slice(3)), ...spiceLineRequests()], selected);
    setReaction(interestsReaction(selected.length));
    setStep(1);
  }
  function pick(option: CardOption) {
    if (!card) return;
    setPicks({ ...picks, [card.id]: option.id });
    setReaction(modelLines.current[`${card.id}_${option.id}`] ?? option.reaction);
    setStep(step + 1);
  }
  function skipCard() {
    if (!card) return;
    const rest = { ...picks };
    delete rest[card.id];
    setPicks(rest);
    setReaction(skipReaction);
    setStep(step + 1);
  }
  function sendMeaningTo(e: FormEvent) {
    e.preventDefault();
    setReaction(meaningToReaction(meaningTo.trim()));
    setStep(SPICE_STEP);
  }
  function chooseSpice(level: number) {
    setSpice(level);
    setSpiceTouched(true);
    setReaction(modelLines.current[`spice_${level}`] ?? spiceSamples[level - 1]);
  }
  function back() {
    setReaction(step === 1 ? INTRO : "Fine. Have another go.");
    setStep(step - 1);
  }
  function finish() {
    // The first three cards double as the ideas filters.
    const filters = cards.flatMap(c => c.options.filter(option => option.filter && picks[c.id] === option.id).map(option => option.filter as FilterId));
    onDone?.({ interests: selected, spice, filters, picks, answers: { meaningTo: meaningTo.trim(), freeHour: [], people: initial?.answers?.people ?? "", avoid: initial?.answers?.avoid ?? "" } });
  }

  return <main className="screen onboarding">
    {onExit && <button type="button" className="ob-exit" onClick={onExit}>Exit</button>}
    <div className="ob-progress" aria-label={`Step ${step + 1} of ${SPICE_STEP + 1}`}>{Array.from({ length: SPICE_STEP + 1 }, (_, i) => <i key={i} className={i <= step ? "done" : ""}/>)}</div>
    <ChatBubble mood={mood} compact>{reaction}</ChatBubble>
    <div className="bubble ob-question">{question}</div>

    {step === 0 && <>
      <div className="chips">{options.map(interest => <Chip key={interest} active={selected.includes(interest)} onClick={() => toggleInterest(interest)}>{interest}</Chip>)}</div>
      <form className="todo-add ob-add" onSubmit={addCustom}>
        <input aria-label="Add your own interest" placeholder="Add your own…" value={custom} onChange={e => setCustom(e.target.value)}/>
        <button className="todo-add-btn" aria-label="Add interest">+</button>
      </form>
      <Button onClick={sendInterests}>{selected.length ? "That’s me" : "Skip"}</Button>
    </>}

    {card && <>
      <div className="tt-pair">
        {card.options.map((option, i) => <button type="button" key={option.id} className={`tt-card ${i === 1 ? "alt" : ""} ${picks[card.id] === option.id ? "picked" : ""}`} onClick={() => pick(option)}><strong>{option.label}</strong><small>{option.caption}</small></button>)}
        <span className="tt-or">or</span>
      </div>
      <button type="button" className="link-btn" onClick={skipCard}>Skip this one</button>
    </>}

    {step === MEANING_TO_STEP && <form className="login-form" onSubmit={sendMeaningTo}>
      <label className="field"><input type="text" aria-label="What you have been meaning to get back to" placeholder={meaningToPlaceholder} value={meaningTo} onChange={e => setMeaningTo(e.target.value)}/></label>
      <Button>{meaningTo.trim() ? "Send" : "Skip"}</Button>
    </form>}

    {step === SPICE_STEP && <>
      <SpiceCard spice={spice} onChange={chooseSpice}/>
      <Button disabled={!spice} onClick={finish}>Let’s go</Button>
    </>}

    {step > 0 && <button type="button" className="link-btn" onClick={back}>Back</button>}
  </main>;
}