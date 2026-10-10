import { useState } from "react";
import Icon from "./Icon";

export default function TaskRow({ text, note, overdue }: { text: string; note?: string; overdue?: boolean }) {
  const [done, setDone] = useState(false);
  return <button className={`task-row ${done ? "done" : ""}`} onClick={() => setDone(!done)}>
    <span className="checkbox">{done && <Icon name="check" size={15}/>}</span>
    <span className="task-copy"><strong>{text}</strong>{note && <small>{note}</small>}</span>
    {overdue && <span className="overdue">OVERDUE</span>}
  </button>;
}
