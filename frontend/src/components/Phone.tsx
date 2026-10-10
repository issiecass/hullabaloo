import type { ReactNode } from "react";

export default function Phone({ name, children, noisy = false }: { name?: string; children: ReactNode; noisy?: boolean }) {
  return <section className="frame-wrap">{name && <div className="frame-label">{name}</div>}<div className={`phone ${noisy ? "noisy-phone" : ""}`}><div className="speaker"/>{children}</div></section>;
}
