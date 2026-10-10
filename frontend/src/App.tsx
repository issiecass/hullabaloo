import { useEffect, useState, type ReactNode } from "react";
import Phone from "./components/Phone";
import { fallbackChirps } from "./chirps";
import type { Tab } from "./components/TabBar";
import type { Activity, Todo } from "./data";
import Gallery from "./Gallery";
import { generateChirps } from "./llm";
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

// Demo pacing: the shortest time the feed shows before the first chirp fires.
const FEED_TO_CHIRP_MS = 4000;
const SNOOZE_MS = 30 * 60 * 1000;

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(loadProfile);
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [screen, setScreen] = useState<ScreenName>(profile ? "home" : "login");
  const [chosen, setChosen] = useState<Activity>();
  // The session's three chirps, for 20, 40 and 60 minutes.
  const [chirps, setChirps] = useState<string[]>(() => fallbackChirps());
  // Chirps stay quiet until this timestamp (set from Settings).
  const [pausedUntil, setPausedUntil] = useState(0);
  const paused = Date.now() < pausedUntil;

  useEffect(() => {
    if (screen !== "feed" || paused) return;
    // Write this session's chirps while the feed is showing. The first one fires once they are
    // ready and the minimum feed time has passed; if the model fails, the backup chirps are used.
    const controller = new AbortController();
    let cancelled = false;
    const backup = fallbackChirps(profile?.spice, todos);
    const minimumWait = new Promise(resolve => setTimeout(resolve, FEED_TO_CHIRP_MS));
    Promise.all([generateChirps({ profile, todos }, controller.signal).catch(() => backup), minimumWait]).then(([next]) => {
      if (cancelled) return;
      setChirps(next);
      setScreen("banner");
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
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
    banner: <ChirpBanner chirp={chirps[0]} onAccept={toActivities} onSnooze={() => setScreen("sheet")}/>,
    sheet: <ChirpSheet chirp={chirps[1]} onAccept={toActivities} onSnooze={() => setScreen("takeover")}/>,
    takeover: <ChirpTakeover chirp={chirps[2]} onAccept={toActivities} onSnooze={() => setScreen("home")}/>,
    activities: <Activities ai profile={profile} todos={todos} initialFilters={profile?.filters} onStart={activity => { setChosen(activity); setScreen("reward"); }}/>,
    reward: <Reward activity={chosen} tasksDone={todos.filter(t => t.done).length} onDone={() => setScreen("home")}/>,
  };
  const noisy = screen === "feed" || screen === "banner" || screen === "sheet";

  return <div className="app-shell single"><Phone noisy={noisy}>{screens[screen]}</Phone></div>;
}
