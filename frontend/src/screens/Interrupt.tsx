import { useEffect, useState } from "react";
import { snoozeOptions } from "../chirps";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Spike, { type SpikeMood } from "../components/Spike";
import type { Todo } from "../data";
import { generateSnoozeComments } from "../llm";

// The page the Shortcut opens when the user is out of scrolling time.
// With `ai` off, Spike's snooze comments are the written backups.
export default function Interrupt({ ai = false, chirp, spice = 2, todos = [], onAccept, onSnooze, onDismiss }: { ai?: boolean; chirp: string; spice?: number; todos?: Todo[]; onAccept?: () => void; onSnooze?: (minutes: number) => void; onDismiss?: () => void }) {
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  // One comment per snooze option, ready before the user picks. Starts as the written backups.
  const [comments, setComments] = useState(() => snoozeOptions.map(option => option.comment));
  // Set once the user snoozes: what Spike said, and when the snooze ends.
  const [snoozed, setSnoozed] = useState<{ comment: string; until: Date } | null>(null);

  useEffect(() => {
    if (!ai) return;
    const controller = new AbortController();
    generateSnoozeComments({ spice, todos }, controller.signal).then(setComments).catch(() => {});
    return () => controller.abort();
  }, []);

  function snooze(index: number) {
    const { minutes } = snoozeOptions[index];
    setSnoozed({ comment: comments[index], until: new Date(Date.now() + minutes * 60 * 1000) });
    setSnoozeOpen(false);
    onSnooze?.(minutes);
  }

  return <main className="screen takeover interrupt">
    <div className="takeover-top"><span>TIME’S UP</span><strong>0:00</strong></div>
    <div className="sunburst"/><div className="big-spike"><Spike mood={snoozed ? "asleep" : moods[spice - 1]} size={184}/></div>
    <div className="bubble takeover-bubble">{snoozed ? snoozed.comment : chirp}</div>
    <p className="aside-copy">{snoozed ? `Snoozed until ${snoozed.until.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : "You’re out of scrolling time. I say this with love and several tiny spines."}</p>
    <div className="chirp-actions">
      <Button onClick={onAccept}>Fine, what should I do?</Button>
      {snoozed
        ? <Button variant="secondary" onClick={onDismiss}>Back to it, then</Button>
        : <div className="dropdown">
            <button type="button" className={`btn btn-secondary dropdown-toggle ${snoozeOpen ? "open" : ""}`} aria-haspopup="listbox" aria-expanded={snoozeOpen} onClick={() => setSnoozeOpen(!snoozeOpen)}><span>Snooze for…</span><Icon name="chevron" size={18}/></button>
            {snoozeOpen && <div className="dropdown-menu" role="listbox" aria-label="Snooze length">{snoozeOptions.map((option, i) => <button type="button" role="option" aria-selected={false} className="dropdown-option" key={option.minutes} onClick={() => snooze(i)}>{option.label}</button>)}</div>}
          </div>}
    </div>
  </main>;
}