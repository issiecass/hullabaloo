import { useEffect, useState, type ReactNode } from "react";
import Phone from "./components/Phone";
import type { Tab } from "./components/TabBar";
import type { Activity, Todo } from "./data";
import Gallery from "./Gallery";
import Activities from "./screens/Activities";
import ChirpBanner from "./screens/ChirpBanner";
import ChirpSheet from "./screens/ChirpSheet";
import ChirpTakeover from "./screens/ChirpTakeover";
import FakeFeed from "./screens/FakeFeed";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Reward from "./screens/Reward";
import Settings from "./screens/Settings";
import Todos from "./screens/Todos";
import { clearAll, loadProfile, loadTodos, saveProfile, saveTodos, type Profile } from "./storage";

type ScreenName = "login" | "onboarding" | Tab | "feed" | "banner" | "sheet" | "takeover" | "activities" | "reward";

// Demo pacing: how long the feed shows before the first chirp fires.
const FEED_TO_CHIRP_MS = 4000;
const SNOOZE_MS = 30 * 60 * 1000;

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(loadProfile);
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [screen, setScreen] = useState<ScreenName>(profile ? "home" : "login");
  const [chosen, setChosen] = useState<Activity>();
  // Chirps stay quiet until this timestamp (set from Settings).
  const [pausedUntil, setPausedUntil] = useState(0);
  const paused = Date.now() < pausedUntil;

  useEffect(() => {
    if (screen !== "feed" || paused) return;
    const id = setTimeout(() => setScreen("banner"), FEED_TO_CHIRP_MS);
    return () => clearTimeout(id);
  }, [screen, paused]);

  // The original all-screens design overview lives at /#gallery.
  if (window.location.hash === "#gallery") return <Gallery/>;

  function updateProfile(next: Profile) {
    saveProfile(next);
    setProfile(next);
  }
  function updateTodos(next: Todo[]) {
    saveTodos(next);
    setTodos(next);
  }
  function logout() {
    clearAll();
    setProfile(null);
    setTodos(loadTodos());
    setPausedUntil(0);
    setScreen("login");
  }

  const toggleTodo = (id: string) => updateTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toActivities = () => setScreen("activities");
  // Snoozing jumps straight to the next escalation tier so the demo doesn't have to wait.
  const screens: Record<ScreenName, ReactNode> = {
    login: <Login onSubmit={user => { updateProfile(user); setScreen("onboarding"); }}/>,
    onboarding: <Onboarding initial={profile ?? undefined} onDone={prefs => { if (profile) updateProfile({ ...profile, ...prefs }); setScreen("home"); }}/>,
    home: <Home name={profile?.name} todos={todos} onToggleTodo={toggleTodo} onStartSession={() => setScreen("feed")} onNavigate={setScreen}/>,
    todos: <Todos todos={todos} onAdd={text => updateTodos([...todos, { id: String(Date.now()), text, done: false }])} onToggle={toggleTodo} onDelete={id => updateTodos(todos.filter(t => t.id !== id))} onNavigate={setScreen}/>,
    settings: <Settings name={profile?.name} email={profile?.email} spice={profile?.spice} paused={paused}
      onSpiceChange={spice => { if (profile) updateProfile({ ...profile, spice }); }}
      onSnooze={() => setPausedUntil(Date.now() + SNOOZE_MS)}
      onStopToday={() => setPausedUntil(new Date().setHours(24, 0, 0, 0))}
      onResume={() => setPausedUntil(0)}
      onEditPrefs={() => setScreen("onboarding")} onLogout={logout} onNavigate={setScreen}/>,
    feed: <FakeFeed onExit={() => setScreen("home")}/>,
    banner: <ChirpBanner onAccept={toActivities} onSnooze={() => setScreen("sheet")}/>,
    sheet: <ChirpSheet onAccept={toActivities} onSnooze={() => setScreen("takeover")}/>,
    takeover: <ChirpTakeover onAccept={toActivities} onSnooze={() => setScreen("home")}/>,
    activities: <Activities ai profile={profile} todos={todos} initialFilters={profile?.filters} onStart={activity => { setChosen(activity); setScreen("reward"); }}/>,
    reward: <Reward activity={chosen} tasksDone={todos.filter(t => t.done).length} onDone={() => setScreen("home")}/>,
  };
  const noisy = screen === "feed" || screen === "banner" || screen === "sheet";

  return <div className="app-shell single"><Phone noisy={noisy}>{screens[screen]}</Phone></div>;
}
