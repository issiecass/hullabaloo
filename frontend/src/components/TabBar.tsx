import Icon from "./Icon";

export type Tab = "home" | "todos" | "settings";

export default function TabBar({ active = "home", onNavigate }: { active?: Tab; onNavigate?: (tab: Tab) => void }) {
  return <nav className="tabbar" aria-label="Main navigation">
    <button className={active === "home" ? "selected" : ""} onClick={() => onNavigate?.("home")}><Icon name="home"/><span>Home</span></button>
    <button className={active === "todos" ? "selected" : ""} onClick={() => onNavigate?.("todos")}><Icon name="check"/><span>To-dos</span></button>
    <button className={active === "settings" ? "selected" : ""} onClick={() => onNavigate?.("settings")}><Icon name="settings"/><span>Settings</span></button>
  </nav>;
}
