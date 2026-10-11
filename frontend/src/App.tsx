import { useEffect, useState, type ReactNode } from "react";
import { chirpBasis, fallbackInterruptChirp } from "./chirps";
import Phone from "./components/Phone";
import type { Tab } from "./components/TabBar";
import type { Activity, FilterId, Todo } from "./data";
import Gallery from "./Gallery";
import { generateInterruptChirp, generateSendOff } from "./llm";
import Activities from "./screens/Activities";
import Home from "./screens/Home";
import Interrupt from "./screens/Interrupt";
import Login, { type AuthResult } from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Reward from "./screens/Reward";
import Settings from "./screens/Settings";
import Todos from "./screens/Todos";
import { fallbackSendOff } from "./session";
import CheckIn from "./screens/CheckIn";
import { clearRun, loadRun, saveRun, clearAll, clearNextChirp, clearSession, loadNextChirp, loadProfile, loadSession, saveNextChirp, saveProfile, saveSession, type Profile, type ScrollSession, type ActivityRun } from "./storage";
import { api, ApiError, API_URL, clearToken, completeActivity, createTodo, deleteTodo, fetchTodos, getToken, savePreferences, setToken, updateTodo, type ApiUser } from "./api";

type ScreenName = "login" | "onboarding" | Tab | "interrupt" | "activities" | "checkin" | "reward";

// The chirp for the interrupt page: the one the model prepared earlier if it still fits, otherwise the written one.
function pickInterruptChirp(profile: Profile | null, todos: Todo[]) {
  const prepared = loadNextChirp();
  return prepared && prepared.basis === chirpBasis(profile?.spice, todos) ? prepared.chirp : fallbackInterruptChirp(profile?.spice, todos);
}

// The profile as the backend has it. Preferences are left out until onboarding is done, which is what sends the user there.
function profileFromUser(user: ApiUser): Profile {
  const account = { name: user.name, email: user.email, shortcutKey: user.shortcut_key };
  if (!user.onboarded) return account;
  const { picks = {}, ...answers } = user.answers;
  return {
    ...account,
    interests: user.interests,
    spice: user.spice_level,
    filters: user.filters,
    picks,
    answers: { meaningTo: "", freeHour: [], people: "", avoid: "", ...answers },
  };
}

export default function App() {
  // Being logged in means having a token from the backend; the saved profile alone is not enough.
  const [profile, setProfile] = useState<Profile | null>(() => getToken() ? loadProfile() : null);
  const [todos, setTodos] = useState<Todo[]>([]);
  // A scrolling session saved before the page was closed or reloaded.
  const [savedSession] = useState(loadSession);
  const [session, setSession] = useState<ScrollSession | null>(() => savedSession && savedSession.endsAt > Date.now() ? savedSession : null);
  // True when Spike has an interrupt to deliver: the app was opened on /interrupt (by the Shortcut),
  // or a session's time ran out while the app was closed.
  const [interruptPending, setInterruptPending] = useState(() => window.location.pathname.replace(/\/$/, "") === "/interrupt" || (!!savedSession && savedSession.endsAt <= Date.now()));
  // The interrupt page needs a logged-in user, so a logged-out visitor goes through login first.
  const [run, setRun] = useState<ActivityRun | null>(loadRun);
  const [screen, setScreen] = useState<ScreenName>(profile ? (interruptPending ? "interrupt" : run ? "checkin" : "home") : "login");
  const [interruptChirp, setInterruptChirp] = useState(() => pickInterruptChirp(profile, todos));
  // What the receipt shows: the activity, the minutes the user reported, and their XP total once the backend answers.
  const [receipt, setReceipt] = useState<{ activity: Activity; actualMinutes: number; totalXp: number | null } | null>(null);
  // The user's total XP from the database, after the activity they just finished. Unset while it loads.
  const [totalXp, setTotalXp] = useState<number>();
  // Chirps stay quiet until this timestamp (set from Settings or the interrupt page).
  const [pausedUntil, setPausedUntil] = useState(0);
  const paused = Date.now() < pausedUntil;

  useEffect(() => {
    // A session that ran out while the app was away has been turned into an interrupt above; forget it.
    if (savedSession && savedSession.endsAt <= Date.now()) clearSession();
  }, []);

  useEffect(() => {
    if (!session) return;
    // When the session's time runs out, Spike interrupts wherever the user is in the app.
    const id = setTimeout(() => {
      clearSession();
      setSession(null);
      setInterruptChirp(pickInterruptChirp(profile, todos));
      setScreen(current => current === "login" || current === "onboarding" || current === "checkin" ? current : "interrupt");
    }, Math.max(0, session.endsAt - Date.now()));
    return () => clearTimeout(id);
  }, [session?.endsAt, profile, todos]);

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

  useEffect(() => {
    // Confirm the saved login with the backend. Its copy of the profile replaces the one saved on the device.
    if (!getToken()) return;
    api<ApiUser>("/auth/me").then(user => {
      setProfile(current => {
        if (!current) return current;
        const next = profileFromUser(user);
        saveProfile(next);
        return next;
      });
      if (!user.onboarded) setScreen(current => current === "login" ? current : "onboarding");
      setTotalXp(user.xp);
      syncPause(user);
    }).catch(error => {
      // An expired or unknown login goes back to the login screen. If the backend is only unreachable, carry on with the saved data.
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) logout();
    });
  }, []);

  const loggedIn = profile !== null;
  useEffect(() => {
    if (!loggedIn) {
      setTodos([]);
      return;
    }
    let cancelled = false;
    fetchTodos().then(list => {
      if (cancelled) return;
      setTodos(list);
      // The interrupt page may already be showing a chirp picked before the list arrived.
      if (interruptPending) setInterruptChirp(pickInterruptChirp(profile, list));
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  // The original all-screens design overview lives at /#gallery.
  if (window.location.hash === "#gallery") return <Gallery/>;

  function updateProfile(next: Profile) {
    saveProfile(next);
    setProfile(next);
  }
  function reloadTodos() {
    fetchTodos().then(setTodos).catch(() => {});
  }
  function addTodo(text: string) {
    createTodo(text).then(todo => setTodos(current => [...current, todo])).catch(() => {});
  }
  function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    // Flip it straight away; the saved copy from the backend replaces it, or the list reloads if saving fails.
    setTodos(current => current.map(t => t.id === id ? { ...t, done: !todo.done } : t));
    updateTodo(id, { done: !todo.done }).then(saved => setTodos(current => current.map(t => t.id === id ? saved : t))).catch(reloadTodos);
  }
  function removeTodo(id: string) {
    setTodos(current => current.filter(t => t.id !== id));
    deleteTodo(id).catch(reloadTodos);
  }
  function logout() {
    // Only the login is cleared. Preferences are loaded from the backend again at the next login.
    clearToken();
    clearSession();
    clearRun();
    setRun(null);
    setSession(null);
    setProfile(null);
    setPausedUntil(0);
    setScreen("login");
  }
  function syncPause(user: ApiUser) {
    // A snooze saved in the backend still applies after a reload or on another screen.
    // A running session uses the same backend field, but shows as the countdown on Home, not as a snooze.
    const until = user.chirps_paused_until ? Date.parse(user.chirps_paused_until) : 0;
    const sessionRunning = (loadSession()?.endsAt ?? 0) > Date.now();
    if (until > Date.now() && !sessionRunning) setPausedUntil(until);
  }
  function handleAuthed({ token, user }: AuthResult) {
    setToken(token);
    // What was saved on this device is kept only when the same account logs back in.
    if (loadProfile()?.email.toLowerCase() !== user.email.toLowerCase()) {
      clearAll();
      setSession(null);
      setRun(null);
    }
    const next = profileFromUser(user);
    updateProfile(next);
    syncPause(user);
    if (!user.onboarded) setScreen("onboarding");
    else if (interruptPending) showInterrupt(next);
    else setScreen("home");
  }
  function snoozeFor(minutes: number) {
    setPausedUntil(Date.now() + minutes * 60 * 1000);
    // Saving it in the backend is what lets the Shortcut skip the interrupt while the snooze runs.
    if (profile?.shortcutKey) api("/snooze", { method: "POST", body: JSON.stringify({ key: profile.shortcutKey, minutes }) }).catch(() => {});
  }
  function startSession(seconds: number) {
    const next: ScrollSession = { endsAt: Date.now() + seconds * 1000, line: fallbackSendOff(seconds) };
    saveSession(next);
    setSession(next);
    // Telling the backend is what lets the Shortcut hold off while the session runs.
    api("/session", { method: "POST", body: JSON.stringify({ seconds }) }).catch(() => {});
    // Spike's send-off replaces the written line when the model answers.
    generateSendOff({ profile, todos, seconds }).then(line => {
      setSession(current => {
        if (!current || current.endsAt !== next.endsAt) return current;
        const updated = { ...current, line };
        saveSession(updated);
        return updated;
      });
    }).catch(() => {});
  }
  function endSession() {
    clearSession();
    setSession(null);
    api("/session", { method: "POST", body: JSON.stringify({ seconds: 0 }) }).catch(() => {});
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
     function startActivity(activity: Activity, filters: FilterId[]) {
     const next: ActivityRun = { activity, filters };
     saveRun(next);
     setRun(next);
     setScreen("checkin");
   }
   function cancelActivity() {
     clearRun();
     setRun(null);
     setScreen("activities");
   }
   function finishActivity(actualMinutes: number) {
     if (!run) return;
     const { activity, filters } = run;
     clearRun();
     setRun(null);
     setReceipt({ activity, actualMinutes, totalXp: null });
     setScreen("reward");
     // Saved in the background; the lifetime total appears on the receipt when the backend answers.
     completeActivity(activity, filters, actualMinutes)
      .then(result => {
        setReceipt(current => current && current.activity === activity ? { ...current, totalXp: result.xp_total } : current);
        setTotalXp(result.xp_total);
      })
      .catch(err => console.error("completeActivity failed:", err));
   }
  function finishOnboarding(next: Profile | null) {
    if (next) {
      updateProfile(next);
      savePreferences(next).catch(() => {});
    }
    if (interruptPending) showInterrupt(next);
    else setScreen("home");
  }

  const screens: Record<ScreenName, ReactNode> = {
    login: <Login onAuthed={handleAuthed}/>,
    onboarding: <Onboarding ai initial={profile ?? undefined} onDone={prefs => finishOnboarding(profile ? { ...profile, ...prefs } : null)}
      onExit={profile?.spice !== undefined ? () => setScreen("settings") : undefined}/>,
    home: <Home name={profile?.name} todos={todos} session={session} totalXp={totalXp} onToggleTodo={toggleTodo} onStartSession={startSession} onEndSession={endSession} onNavigate={setScreen}/>,
    todos: <Todos todos={todos} onAdd={addTodo} onToggle={toggleTodo} onDelete={removeTodo} onNavigate={setScreen}/>,
    settings: <Settings ai todos={todos} name={profile?.name} email={profile?.email} spice={profile?.spice} paused={paused}
      shortcutUrl={profile?.shortcutKey ? `${API_URL}/should-interrupt?key=${profile.shortcutKey}` : undefined}
      onSpiceChange={spice => {
        if (!profile) return;
        updateProfile({ ...profile, spice });
        savePreferences({ spice }).catch(() => {});
      }}
      onSnooze={snoozeFor}
      onStopToday={() => setPausedUntil(new Date().setHours(24, 0, 0, 0))}
      onResume={() => setPausedUntil(0)}
      onEditPrefs={() => setScreen("onboarding")} onLogout={logout} onNavigate={setScreen}/>,
    interrupt: <Interrupt ai chirp={interruptChirp} spice={profile?.spice} todos={todos}
      onAccept={() => {
        // Record the check-in without making the user wait on it.
        api("/checkins", { method: "POST", body: JSON.stringify({ app: "instagram", action: "went_outside" }) }).catch(() => {});
        leaveInterrupt("activities");
      }}
      onSnooze={minutes => startSession(minutes * 60)}
      onDismiss={() => leaveInterrupt("home")}/>,
    activities: <Activities ai profile={profile} todos={todos} initialFilters={profile?.filters} onStart={startActivity}/>,
    checkin: run ? <CheckIn key={run.activity.title} activity={run.activity} onFinish={finishActivity} onBack={cancelActivity}/> : null,
    reward: <Reward activity={receipt?.activity} actualMinutes={receipt?.actualMinutes} totalXp={receipt?.totalXp} tasksDone={todos.filter(t => t.done).length} onDone={() => setScreen("home")}/>,
  };

  return <div className="app-shell single"><Phone>{screens[screen]}</Phone></div>;
}