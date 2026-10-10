import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import TabBar, { type Tab } from "../components/TabBar";
import TaskRow from "../components/TaskRow";
import TopBar from "../components/TopBar";
import { sampleTodos, type Todo } from "../data";

export default function Home({ name = "Jordan", todos = sampleTodos, onToggleTodo, onStartSession, onNavigate }: { name?: string; todos?: Todo[]; onToggleTodo?: (id: string) => void; onStartSession?: () => void; onNavigate?: (tab: Tab) => void }) {
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
      <div className="scroll-stat"><div><span>Scrolled today</span><strong>1h 47m</strong></div><div className="mini-bars"><i/><i/><i/><i/><i/></div><small>That’s almost a whole movie. A bad one.</small></div>
      <div className="todo-title"><h2>Today’s tiny victories</h2><span>{doneCount}/{todos.length}</span></div>
      {todos.length === 0
        ? <button type="button" className="link-btn" onClick={() => onNavigate?.("todos")}>Add your first task</button>
        : <div className="tasks">{todos.map(t => <TaskRow key={t.id} text={t.text} note={t.note} overdue={t.overdue} done={t.done} onToggle={onToggleTodo && (() => onToggleTodo(t.id))}/>)}</div>}
      <ChatBubble mood="playful" compact>{nudge}</ChatBubble>
      <Button icon="play" onClick={onStartSession}>Start scroll session</Button>
    </div>
    <TabBar active="home" onNavigate={onNavigate}/>
  </main>;
}
