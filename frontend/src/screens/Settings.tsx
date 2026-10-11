import { useEffect, useRef, useState } from "react";
import { snoozeOptions } from "../chirps";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import Icon from "../components/Icon";
import SpiceCard, { Peppers } from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import TabBar, { type Tab } from "../components/TabBar";
import TopBar from "../components/TopBar";
import { spiceLevels, type Todo } from "../data";
import { generateSnoozeComments } from "../llm";

// With `ai` off (the gallery preview) the snooze comments are the written backups.
export default function Settings({ ai = false, todos = [], name = "Jordan", email = "jordan@example.com", spice = 2, paused = false, shortcutUrl, onSpiceChange, onSnooze, onStopToday, onResume, onEditPrefs, onLogout, onNavigate }: { ai?: boolean; todos?: Todo[]; name?: string; email?: string; spice?: number; paused?: boolean; shortcutUrl?: string; onSpiceChange?: (spice: number) => void; onSnooze?: (minutes: number) => void; onStopToday?: () => void; onResume?: () => void; onEditPrefs?: () => void; onLogout?: () => void; onNavigate?: (tab: Tab) => void }) {
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  const [editingSpice, setEditingSpice] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // One comment per snooze option, ready before the user picks. Starts as the written backups.
  const [comments, setComments] = useState(() => snoozeOptions.map(option => option.comment));
  // What Spike said about the snooze that is running now.
  const [snoozeComment, setSnoozeComment] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);

  // Ask the model for a fresh set in the background, so the next pick gets new wording without a wait.
  function refreshComments() {
    if (!ai) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const backups = snoozeOptions.map(option => option.comment);
    generateSnoozeComments({ spice, todos }, controller.signal).catch(() => backups).then(next => {
      if (pending.current === controller) setComments(next);
    });
  }

  useEffect(() => {
    refreshComments();
    return () => pending.current?.abort();
  }, []);

  function snooze(index: number) {
    setSnoozeComment(comments[index]);
    setSnoozeOpen(false);
    onSnooze?.(snoozeOptions[index].minutes);
    refreshComments();
  }
  function stopToday() {
    setSnoozeComment(null);
    onStopToday?.();
  }
  function resume() {
    setSnoozeComment(null);
    onResume?.();
  }

  return <main className="screen tab-screen">
    <TopBar title="Settings"/>
    <div className="tab-scroll">
      <div className="settings-chat"><ChatBubble mood={paused ? "asleep" : moods[spice - 1]} compact>{paused ? snoozeComment ?? "Pokes are paused. I’m resting my spines." : "Tell me how prickly to be."}</ChatBubble></div>
      {editingSpice
        ? <SpiceCard spice={spice} onChange={level => { onSpiceChange?.(level); setEditingSpice(false); }}/>
        : <div className="spice-card spice-summary">
            <div className="spice-summary-top"><span className="spice-eyebrow">SPIKE'S SHARPNESS</span><Peppers level={spice}/></div>
            <div className="spice-summary-main">
              <div><strong>{spiceLevels[spice - 1].name}</strong><small>{spiceLevels[spice - 1].blurb}</small></div>
              <button type="button" className="edit-btn" onClick={() => setEditingSpice(true)}>Edit</button>
            </div>
          </div>}
      <div className="settings-group">
        <span className="settings-label">Pokes</span>
        {paused
          ? <Button onClick={resume}>Resume pokes</Button>
          : <>
              <div className="dropdown">
                <button type="button" className={`btn btn-secondary dropdown-toggle ${snoozeOpen ? "open" : ""}`} aria-haspopup="listbox" aria-expanded={snoozeOpen} onClick={() => setSnoozeOpen(!snoozeOpen)}><span>Snooze for…</span><Icon name="chevron" size={18}/></button>
                {snoozeOpen && <div className="dropdown-menu" role="listbox" aria-label="Snooze length">{snoozeOptions.map((option, i) => <button type="button" role="option" aria-selected={false} className="dropdown-option" key={option.minutes} onClick={() => snooze(i)}>{option.label}</button>)}</div>}
              </div>
              <Button variant="secondary" onClick={stopToday}>Pause pokes today</Button>
            </>}
      </div>
      {shortcutUrl && <div className="settings-group">
        <span className="settings-label">Shortcut</span>
        <p className="settings-note">Your Shortcut asks this address whether to interrupt you. It answers “no” while a snooze is running.</p>
        <div className="shortcut-url">{shortcutUrl}</div>
        <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(shortcutUrl).then(() => setCopied(true)).catch(() => {}); }}>{copied ? "Copied" : "Copy link"}</Button>
      </div>}
      <div className="settings-group">
        <span className="settings-label">Interests</span>
        <Button variant="secondary" onClick={onEditPrefs}>Update my interests</Button>
      </div>
      <div className="settings-group">
        <span className="settings-label">Account</span>
        <div className="account-row"><strong>{name}</strong><small>{email}</small></div>
        <Button variant="secondary" onClick={onLogout}>Log out</Button>
      </div>
    </div>
    <TabBar active="settings" onNavigate={onNavigate}/>
  </main>;
}
