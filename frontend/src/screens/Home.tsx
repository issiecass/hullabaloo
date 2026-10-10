import { useEffect, useState } from "react";
import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import TabBar, { type Tab } from "../components/TabBar";
import TaskRow from "../components/TaskRow";
import TimerSheet from "../components/TimerSheet";
import TopBar from "../components/TopBar";
import { sampleTodos, type Todo } from "../data";
import { formatCountdown } from "../session";
import type { ScrollSession } from "../storage";

export default function Home({ name = "Jordan", todos = sampleTodos, session = null, onToggleTodo, onStartSession, onEndSession, onNavigate }: { name?: string; todos?: Todo[]; session?: ScrollSession | null; onToggleTodo?: (id: string) => void; onStartSession?: (seconds: number) => void; onEndSession?: () => void; onNavigate?: (tab: Tab) => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // Re-read the clock twice a second while a session runs, so the countdown ticks.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!session) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [session?.endsAt]);

  const firstName = name.split(" ")[0];
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const doneCount = todos.filter(t => t.done).length;
  const left = todos.length - doneCount;
  const nudge = todos.length === 0 ? "An empty list. Bold. Give me something to nag you about."
    : left === 0 ? "Everything done. I have nothing to roast. Unsettling."
    : `${left} ${left === 1 ? "task" : "tasks"} left. Very achievable. Suspiciously achievable.`;
  return <main className="screen home-screen">
    <TopBar title="Home" action={<button className="avatar" aria-label="Settings" onClick={() => onNavigate?.("settings")}>{initials}</button>}/>
    <div className="home-scroll">
      <div className="greeting"><p>HEY, {firstName.toUpperCase()}</p><h1>Ready to do literally<br/>anything else?</h1></div>
      {session
        ? <div className="scroll-stat counting"><div><span>Scrolling time left</span><strong>{formatCountdown((session.endsAt - now) / 1000)}</strong></div><small>{session.line}</small></div>
        : <div className="scroll-stat"><div><span>Scrolling timer</span><strong>Off the clock</strong></div><small>No session running. Suspiciously virtuous.</small></div>}
      <div className="todo-title"><h2>Today’s tiny victories</h2><span>{doneCount}/{todos.length}</span></div>
      {todos.length === 0
        ? <button type="button" className="link-btn" onClick={() => onNavigate?.("todos")}>Add your first task</button>
        : <div className="tasks">{todos.map(t => <TaskRow key={t.id} text={t.text} note={t.note} overdue={t.overdue} done={t.done} onToggle={onToggleTodo && (() => onToggleTodo(t.id))}/>)}</div>}
      <ChatBubble mood="playful" compact>{nudge}</ChatBubble>
      {session
        ? <Button variant="secondary" onClick={onEndSession}>I’m done early</Button>
        : <Button icon="clock" onClick={() => setSheetOpen(true)}>Clock me in to rot</Button>}
    </div>
    <TabBar active="home" onNavigate={onNavigate}/>
    {sheetOpen && <TimerSheet onStart={seconds => { setSheetOpen(false); onStartSession?.(seconds); }} onCancel={() => setSheetOpen(false)}/>}
  </main>;
}