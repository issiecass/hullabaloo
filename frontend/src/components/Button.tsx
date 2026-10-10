import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export default function Button({ children, variant = "primary", icon, disabled = false, onClick }: { children: ReactNode; variant?: "primary" | "secondary"; icon?: IconName; disabled?: boolean; onClick?: () => void }) {
  return <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>{icon && <Icon name={icon} size={18}/>}<span>{children}</span></button>;
}
