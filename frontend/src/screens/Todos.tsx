import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import Spike, { type SpikeMood } from "../components/Spike";
import TabBar, { type Tab } from "../components/TabBar";
import TaskRow from "../components/TaskRow";
import TopBar from "../components/TopBar";
import { sampleTodos, type Todo } from "../data";

export default function Todos({ todos = sampleTodos, onAdd, onToggle, onDelete, onNavigate }: { todos?: Todo[]; onAdd?: (text: string) => void; onToggle?: (id: string) => void; onDelete?: (id: string) => void; onNavigate?: (tab: Tab) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onAdd?.(clean);
    setText("");
  }

  // Spike's comment and expression follow the state of the list.
  const left = todos.filter(t => !t.done).length;
  const nudge = todos.length === 0 ? "An empty list. Bold. Give me something to nag you about."
    : left === 0 ? "Everything done. I have nothing to roast. Unsettling."
    : `${left} ${left === 1 ? "task" : "tasks"} left. Very achievable. Suspiciously achievable.`;
  const mood: SpikeMood = todos.length === 0 ? "playful" : left === 0 ? "proud" : "sassy";

  return <main className="screen tab-screen">
    <TopBar title="To-dos"/>
    <div className="tab-scroll">
      <div className="greeting"><h1>Things future you<br/>will thank you for.</h1></div>
      <form className="todo-add" onSubmit={handleSubmit}>
        <input aria-label="New task" placeholder="Add a task" maxLength={200} value={text} onChange={e => setText(e.target.value)}/>
        <button className="todo-add-btn" aria-label="Add task">+</button>
      </form>
      {todos.length > 0 && <div className="tasks">{todos.map(t => <div className="todo-line" key={t.id}>
        <TaskRow text={t.text} note={t.note} overdue={t.overdue} done={t.done} onToggle={onToggle && (() => onToggle(t.id))}/>
        <button className="task-delete" aria-label={`Delete ${t.text}`} onClick={() => onDelete?.(t.id)}>×</button>
      </div>)}</div>}
      <div className="todo-spike"><Spike mood={mood} size={112}/><div className="bubble">{nudge}</div></div>
      <div className="todo-home"><Button variant="secondary" icon="home" onClick={() => onNavigate?.("home")}>Back to home</Button></div>
    </div>
    <TabBar active="todos" onNavigate={onNavigate}/>
  </main>;
}