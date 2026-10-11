import { useEffect, useRef, useState } from "react";
import { capReaction, MAX_SESSION_SECONDS, sessionReaction } from "../session";
import Button from "./Button";
import ChatBubble from "./ChatBubble";
import type { SpikeMood } from "./Spike";

// Height of one row on a wheel, in pixels. Must match .wheel-item in index.css.
const ITEM = 36;

// One scroll wheel, like a column of the iPhone timer. The value is whichever row sits in the middle.
function Wheel({ count, value, unit, onChange }: { count: number; value: number; unit: string; onChange: (value: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // When the value is set from outside (a preset button), roll the wheel to it.
      const el = ref.current;
      if (el && Math.round(el.scrollTop / ITEM) !== value) el.scrollTo({ top: value * ITEM, behavior: "smooth" });
    }, [value]);

  function handleScroll() {
    if (!ref.current) return;
    const next = Math.min(count - 1, Math.max(0, Math.round(ref.current.scrollTop / ITEM)));
    if (next !== value) onChange(next);
  }

  return <div className="wheel-col">
    <div className="wheel" ref={ref} onScroll={handleScroll} role="listbox" aria-label={unit} tabIndex={0}>
      {Array.from({ length: count }, (_, n) => <button type="button" key={n} role="option" aria-selected={n === value} className={`wheel-item ${n === value ? "selected" : ""}`} onClick={() => ref.current?.scrollTo({ top: n * ITEM, behavior: "smooth" })}>{n}</button>)}
    </div>
    <span className="wheel-unit">{unit}</span>
  </div>;
}

export default function TimerSheet({ onStart, onCancel }: { onStart?: (seconds: number) => void; onCancel?: () => void }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const picked = hours * 3600 + minutes * 60 + seconds;
  const total = Math.min(MAX_SESSION_SECONDS, picked);
  const mood: SpikeMood = total < 5 * 60 ? "mild" : total < 30 * 60 ? "playful" : total < 60 * 60 ? "sassy" : "spicy";

  return <div className="sheet-backdrop" onClick={onCancel}>
    <div className="timer-sheet" role="dialog" aria-label="Set a scrolling timer" onClick={e => e.stopPropagation()}>
      <ChatBubble mood={mood} compact>{picked > MAX_SESSION_SECONDS ? capReaction : sessionReaction(total)}</ChatBubble>
      <div className="wheels">
        <Wheel count={3} value={hours} unit="hr" onChange={setHours}/>
        <Wheel count={60} value={minutes} unit="min" onChange={setMinutes}/>
        <Wheel count={60} value={seconds} unit="sec" onChange={setSeconds}/>
      </div>
      <Button disabled={total === 0} onClick={() => onStart?.(total)}>Start the clock</Button>
      <button type="button" className="link-btn" onClick={onCancel}>Never mind</button>
    </div>
  </div>;
}