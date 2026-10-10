import { useState } from "react";
import Icon from "./Icon";

export default function TaskRow({ text, note, overdue, done, onToggle }: { text: string; note?: string; overdue?: boolean; done?: boolean; onToggle?: () => void }) {
  // Falls back to its own state when no handler is passed, as in the gallery preview.
  const [localDone, setLocalDone] = useState(false);
  const isDone = onToggle ? !!done : localDone;
  return <button className={`task-row ${isDone ? "done" : ""}`} onClick={onToggle ?? (() => setLocalDone(!localDone))}>
    <span className="checkbox">{isDone && <Icon name="check" size={15}/>}</span>
    <span className="task-copy"><strong>{text}</strong>{note && <small>{note}</small>}</span>
    {overdue && <span className="overdue">OVERDUE</span>}
  </button>;
}
