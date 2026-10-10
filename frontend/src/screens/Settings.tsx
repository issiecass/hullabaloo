import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import SpiceCard from "../components/SpiceCard";
import type { SpikeMood } from "../components/Spike";
import TabBar, { type Tab } from "../components/TabBar";
import TopBar from "../components/TopBar";

export default function Settings({ name = "Jordan", email = "jordan@example.com", spice = 2, paused = false, onSpiceChange, onSnooze, onStopToday, onResume, onLogout, onNavigate }: { name?: string; email?: string; spice?: number; paused?: boolean; onSpiceChange?: (spice: number) => void; onSnooze?: () => void; onStopToday?: () => void; onResume?: () => void; onLogout?: () => void; onNavigate?: (tab: Tab) => void }) {
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  return <main className="screen tab-screen">
    <TopBar title="Settings"/>
    <div className="tab-scroll">
      <div className="settings-chat"><ChatBubble mood={paused ? "asleep" : moods[spice - 1]} compact>{paused ? "Chirps are paused. I’m resting my spines." : "Tell me how hard to go on you."}</ChatBubble></div>
      <SpiceCard spice={spice} onChange={onSpiceChange}/>
      <div className="settings-group">
        <span className="settings-label">Chirps</span>
        {paused
          ? <Button onClick={onResume}>Resume chirps</Button>
          : <><Button variant="secondary" onClick={onSnooze}>Snooze 30 min</Button><Button variant="secondary" onClick={onStopToday}>Stop chirping today</Button></>}
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
