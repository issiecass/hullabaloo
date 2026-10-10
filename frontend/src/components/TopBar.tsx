import type { ReactNode } from "react";

export default function TopBar({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="topbar"><div className="brand-mark" aria-label="Touch Grass"><svg viewBox="0 0 120 120" role="img"><rect width="120" height="120" rx="28" fill="#1F4D3A"/><circle cx="60" cy="56" r="31" fill="#B94A33"/><g fill="none" stroke="#F4E9D8" strokeLinecap="round" strokeLinejoin="round"><path d="M60 90V30" strokeWidth="15"/><path d="M60 76H46Q40 76 40 70V56" strokeWidth="10"/><path d="M60 62H74Q80 62 80 56V42" strokeWidth="10"/><path d="M36 97H84" strokeWidth="6"/></g><circle cx="80" cy="33" r="4" fill="#E3A345"/></svg></div><div className="top-title">{title}</div>{action || <div className="top-action"/>}</div>;
}
