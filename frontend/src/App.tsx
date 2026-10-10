import { useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import { chirpBasis, fallbackChirps, fallbackInterruptChirp } from "./chirps";
import Phone from "./components/Phone";
import type { Tab } from "./components/TabBar";
import type { Activity, Todo } from "./data";
import Gallery from "./Gallery";
import { generateChirps, generateInterruptChirp } from "./llm";
import Activities from "./screens/Activities";
import ChirpBanner from "./screens/ChirpBanner";
import ChirpSheet from "./screens/ChirpSheet";
import ChirpTakeover from "./screens/ChirpTakeover";
import FakeFeed from "./screens/FakeFeed";
import Home from "./screens/Home";
import Interrupt from "./screens/Interrupt";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Reward from "./screens/Reward";
import Settings from "./screens/Settings";
import Todos from "./screens/Todos";
import { clearAll, clearNextChirp, loadNextChirp, loadProfile, loadTodos, saveNextChirp, saveProfile, saveTodos, type Profile } from "./storage";

type ScreenName = "login" | "onboarding" | Tab | "feed" | "banner" | "sheet" | "takeover" | "interrupt" | "activities" | "reward";

// Demo pacing: the shortest time the feed shows before the first chirp fires.
const FEED_TO_CHIRP_MS = 4000;

// The chirp for the interrupt page: the one the model prepared earlier if it still fits, otherwise the written one.
function pickInterruptChirp(profile: Profile | null, todos: Todo[]) {
  const prepared = loadNextChirp();
  return prepared && prepared.basis === chirpBasis(profile?.spice, todos) ? prepared.chirp : fallbackInterruptChirp(profile?.spice, todos);
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(loadProfile);
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  // True when the app was opened on /interrupt (by the Shortcut) and that page hasn't been dealt with yet.
  const [interruptPending, setInterruptPending] = useState(() => window.location.pathname.replace(/\/$/, "") === "/interrupt");
  // The interrupt page needs a logged-in user, so a logged-out visitor goes through login first.
  const [screen, setScreen] = useState<ScreenName>(profile ? (interruptPending ? "interrupt" : "home") : "login");
  const [interruptChirp, setInterruptChirp] = useState(() => pickInterruptChirp(profile, todos));
  const [chosen, setChosen] = useState<Activity>();
  // The session's three chirps, for 20, 40 and 60 minutes.
  const [chirps, setChirps] = useState<string[]>(() => fallbackChirps());
  // Chirps stay quiet until this timestamp (set from Settings or the interrupt page).
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

  useEffect(() => {
    // While the user is on Home, have the model write the next "time's up" chirp and save it,
    // so the interrupt page can show it at once instead of waiting for the model.
    if (!profile || screen !== "home") return;
    const basis = chirpBasis(profile.spice, todos);
    if (loadNextChirp()?.basis === basis) return;
    const controller = new AbortController();
    generateInterruptChirp({ profile, todos }, controller.signal).then(chirp => saveNextChirp({ chirp, basis })).catch(() => {});
    return () => controller.abort();
  }, [screen, profile, todos]);

  useEffect(() => {
    if (!pausedUntil) return;
    // Clear the pause when it runs out, so the screens update and chirps resume by themselves.
    const id = setTimeout(() => setPausedUntil(0), Math.max(0, pausedUntil - Date.now()));
    return () => clearTimeout(id);
  }, [pausedUntil]);

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
  function showInterrupt(forProfile: Profile | null) {
    setInterruptChirp(pickInterruptChirp(forProfile, todos));
    setScreen("interrupt");
  }
  function leaveInterrupt(next: ScreenName) {
    // The prepared chirp has been used, and the address goes back to / so a refresh doesn't interrupt again.
    clearNextChirp();
    setInterruptPending(false);
    window.history.replaceState(null, "", "/");
    setScreen(next);
  }
  function finishOnboarding(next: Profile | null) {
    if (next) updateProfile(next);
    if (interruptPending) showInterrupt(next);
    else setScreen("home");
  }

  const toggleTodo = (id: string) => updateTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toActivities = () => setScreen("activities");
  // Snoozing jumps straight to the next escalation tier so the demo doesn't have to wait.
  const screens: Record<ScreenName, ReactNode> = {
    login: <Login onSubmit={user => { updateProfile(user); setScreen("onboarding"); }}/>,
    onboarding: <Onboarding ai initial={profile ?? undefined} onDone={prefs => finishOnboarding(profile ? { ...profile, ...prefs } : null)}/>,
    home: <Home name={profile?.name} todos={todos} onToggleTodo={toggleTodo} onStartSession={() => setScreen("feed")} onNavigate={setScreen}/>,
    todos: <Todos todos={todos} onAdd={text => updateTodos([...todos, { id: String(Date.now()), text, done: false }])} onToggle={toggleTodo} onDelete={id => updateTodos(todos.filter(t => t.id !== id))} onNavigate={setScreen}/>,
    settings: <Settings ai todos={todos} name={profile?.name} email={profile?.email} spice={profile?.spice} paused={paused}
      onSpiceChange={spice => { if (profile) updateProfile({ ...profile, spice }); }}
      onSnooze={minutes => setPausedUntil(Date.now() + minutes * 60 * 1000)}
      onStopToday={() => setPausedUntil(new Date().setHours(24, 0, 0, 0))}
      onResume={() => setPausedUntil(0)}
      onEditPrefs={() => setScreen("onboarding")} onLogout={logout} onNavigate={setScreen}/>,
    feed: <FakeFeed onExit={() => setScreen("home")}/>,
    banner: <ChirpBanner chirp={chirps[0]} onAccept={toActivities} onSnooze={() => setScreen("sheet")}/>,
    sheet: <ChirpSheet chirp={chirps[1]} onAccept={toActivities} onSnooze={() => setScreen("takeover")}/>,
    takeover: <ChirpTakeover chirp={chirps[2]} onAccept={toActivities} onSnooze={() => setScreen("home")}/>,
    interrupt: <Interrupt ai chirp={interruptChirp} spice={profile?.spice} todos={todos}
      onAccept={() => {
        // Record the check-in without making the user wait on it.
        api("/checkins", { method: "POST", body: JSON.stringify({ app: "instagram", action: "went_outside" }) }).catch(() => {});
        leaveInterrupt("activities");
      }}
      onSnooze={minutes => setPausedUntil(Date.now() + minutes * 60 * 1000)}
      onDismiss={() => leaveInterrupt("home")}/>,
    activities: <Activities ai profile={profile} todos={todos} initialFilters={profile?.filters} onStart={activity => { setChosen(activity); setScreen("reward"); }}/>,
    reward: <Reward activity={chosen} tasksDone={todos.filter(t => t.done).length} onDone={() => setScreen("home")}/>,
  };
  const noisy = screen === "feed" || screen === "banner" || screen === "sheet";

  return <div className="app-shell single"><Phone noisy={noisy}>{screens[screen]}</Phone></div>;
}