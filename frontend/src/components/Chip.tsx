import type { ReactNode } from "react";

export default function Chip({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button className={`chip ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}
