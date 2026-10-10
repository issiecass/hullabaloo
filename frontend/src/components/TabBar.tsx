import Icon from "./Icon";

export default function TabBar({ active = "home" }: { active?: "home" | "todos" | "settings" }) {
  return <nav className="tabbar" aria-label="Main navigation">
    <button className={active === "home" ? "selected" : ""}><Icon name="home"/><span>Home</span></button>
    <button className={active === "todos" ? "selected" : ""}><Icon name="check"/><span>To-dos</span></button>
    <button className={active === "settings" ? "selected" : ""}><Icon name="settings"/><span>Settings</span></button>
  </nav>;
}
