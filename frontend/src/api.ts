import type { Picks } from "./onboarding";
import type { Activity, Answers, FilterId, Todo } from "./data";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "touchgrass.token";

// The account as the backend returns it from sign-up, log-in and /auth/me.
export type ApiUser = {
  id: number;
  name: string;
  email: string;
  spice_level: number;
  interests: string[];
  filters: FilterId[];
  // The onboarding answers, with the card picks saved alongside them (see savePreferences).
  answers: Partial<Answers> & { picks?: Picks };
  onboarded: boolean;
  chirps_paused_until: string | null;
  shortcut_key?: string;
};

// localStorage can throw (private windows, blocked storage), so every access is guarded.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// A reply from the backend that wasn't a success, with its status code and the reason it gave.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Calls the backend, sending the login token when there is one.
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  if (!res.ok) {
    // FastAPI puts the reason in "detail".
    const detail = await res.json().then(body => body?.detail).catch(() => null);
    throw new ApiError(res.status, typeof detail === "string" ? detail : `${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// The card picks have no column of their own, so they are saved inside the answers.
export function savePreferences(prefs: { interests?: string[]; spice?: number; filters?: FilterId[]; answers?: Answers; picks?: Picks }): Promise<ApiUser> {
  const body = {
    interests: prefs.interests,
    spice_level: prefs.spice,
    filters: prefs.filters,
    answers: prefs.answers || prefs.picks ? { ...prefs.answers, picks: prefs.picks ?? {} } : undefined,
  };
  return api<ApiUser>("/auth/me", { method: "PATCH", body: JSON.stringify(body) });
}

// A to-do as the backend returns it.
type ApiTodo = { id: number; text: string; note: string | null; due_date: string | null; done: boolean; created_at: string; overdue: boolean };

function toTodo(todo: ApiTodo): Todo {
  return { id: String(todo.id), text: todo.text, note: todo.note ?? undefined, overdue: todo.overdue, done: todo.done };
}

export function fetchTodos(): Promise<Todo[]> {
  return api<ApiTodo[]>("/todos").then(list => list.map(toTodo));
}

export function createTodo(text: string): Promise<Todo> {
  return api<ApiTodo>("/todos", { method: "POST", body: JSON.stringify({ text }) }).then(toTodo);
}

export function updateTodo(id: string, changes: { text?: string; note?: string | null; done?: boolean }): Promise<Todo> {
  return api<ApiTodo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(changes) }).then(toTodo);
}

export function deleteTodo(id: string): Promise<void> {
  return api<void>(`/todos/${id}`, { method: "DELETE" });
}

// Saves a started activity for the dopamine receipt. The backend only accepts these three tags.
const TAGS = ["QUICK WIN", "NOVELTY", "SOCIAL"];

export function completeActivity(activity: Activity, filters: FilterId[]) {
  const a = activity as any;
  const tag = String(a.tag ?? "").toUpperCase().replace(/[_-]/g, " ").trim();
  const minutes = parseInt(String(a.minutes ?? a.time ?? ""), 10);
  return api("/activities/complete", {
    method: "POST",
    body: JSON.stringify({
      tag: TAGS.includes(tag) ? tag : "QUICK WIN",
      title: String(a.title ?? "Activity"),
      minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 15,
      step: String(a.step ?? a.starter_step ?? a.starterStep ?? "Get started"),
      free: filters.includes("free"),
      nearby: filters.includes("nearby"),
    }),
  });
}