import { useState, type FormEvent } from "react";
import TabBar, { type Tab } from "../components/TabBar";
import TaskRow from "../components/TaskRow";
import TopBar from "../components/TopBar";
import { initialTodos, type Todo } from "../data";

export default function Todos({ todos = initialTodos, onAdd, onToggle, onDelete, onNavigate }: { todos?: Todo[]; onAdd?: (text: string) => void; onToggle?: (id: string) => void; onDelete?: (id: string) => void; onNavigate?: (tab: Tab) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onAdd?.(clean);
    setText("");
  }

  return <main className="screen tab-screen">
    <TopBar title="To-dos"/>
    <div className="tab-scroll">
      <div className="greeting"><p>THE LIST</p><h1>Things future you<br/>will thank you for.</h1></div>
      <form className="todo-add" onSubmit={handleSubmit}>
        <input aria-label="New task" placeholder="Add a task" value={text} onChange={e => setText(e.target.value)}/>
        <button className="todo-add-btn" aria-label="Add task">+</button>
      </form>
      {todos.length === 0
        ? <p className="empty-note">Nothing here yet. Add the thing you’ve been putting off.</p>
        : <div className="tasks">{todos.map(t => <div className="todo-line" key={t.id}>
            <TaskRow text={t.text} note={t.note} overdue={t.overdue} done={t.done} onToggle={onToggle && (() => onToggle(t.id))}/>
            <button className="task-delete" aria-label={`Delete ${t.text}`} onClick={() => onDelete?.(t.id)}>×</button>
          </div>)}</div>}
    </div>
    <TabBar active="todos" onNavigate={onNavigate}/>
  </main>;
}
