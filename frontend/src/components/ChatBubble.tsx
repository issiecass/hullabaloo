import type { ReactNode } from "react";
import Spike, { type SpikeMood } from "./Spike";

export default function ChatBubble({ children, mood = "mild", compact = false }: { children: ReactNode; mood?: SpikeMood; compact?: boolean }) {
  return <div className={`chat ${compact ? "compact" : ""}`}><Spike mood={mood} size={compact ? 54 : 76}/><div className="bubble">{children}</div></div>;
}
