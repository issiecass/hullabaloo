import { useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import SpiceCard, { Peppers } from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import TabBar, { type Tab } from "../components/TabBar";
import TopBar from "../components/TopBar";
import { spiceLevels } from "../data";

export default function Settings({ name = "Jordan", email = "jordan@example.com", spice = 2, paused = false, onSpiceChange, onSnooze, onStopToday, onResume, onEditPrefs, onLogout, onNavigate }: { name?: string; email?: string; spice?: number; paused?: boolean; onSpiceChange?: (spice: number) => void; onSnooze?: () => void; onStopToday?: () => void; onResume?: () => void; onEditPrefs?: () => void; onLogout?: () => void; onNavigate?: (tab: Tab) => void }) {
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  const [editingSpice, setEditingSpice] = useState(false);
  return <main className="screen tab-screen">
    <TopBar title="Settings"/>
    <div className="tab-scroll">
      <div className="settings-chat"><ChatBubble mood={paused ? "asleep" : moods[spice - 1]} compact>{paused ? "Chirps are paused. I’m resting my spines." : "Tell me how hard to go on you."}</ChatBubble></div>
      {editingSpice
        ? <SpiceCard spice={spice} onChange={level => { onSpiceChange?.(level); setEditingSpice(false); }}/>
        : <div className="spice-card spice-summary">
            <div className="spice-summary-top"><span className="spice-eyebrow">BURN SPICE LEVEL</span><Peppers level={spice}/></div>
            <div className="spice-summary-main">
              <div><strong>{spiceLevels[spice - 1].name}</strong><small>{spiceLevels[spice - 1].blurb}</small></div>
              <button type="button" className="edit-btn" onClick={() => setEditingSpice(true)}>Edit</button>
            </div>
          </div>}
      <div className="settings-group">
        <span className="settings-label">Chirps</span>
        {paused
          ? <Button onClick={onResume}>Resume chirps</Button>
          : <><Button variant="secondary" onClick={onSnooze}>Snooze 30 min</Button><Button variant="secondary" onClick={onStopToday}>Stop chirping today</Button></>}
      </div>
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