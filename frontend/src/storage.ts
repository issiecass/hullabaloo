import { initialTodos, type FilterId, type Todo } from "./data";

export type Profile = { name: string; email: string; interests?: string[]; spice?: number; filters?: FilterId[] };

const PROFILE_KEY = "touchgrass.profile";
const TODOS_KEY = "touchgrass.todos";

// localStorage can throw (private windows, blocked storage), so every access is guarded.
function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function loadProfile(): Profile | null {
  return read<Profile>(PROFILE_KEY);
}

export function saveProfile(profile: Profile) {
  write(PROFILE_KEY, profile);
}

export function loadTodos(): Todo[] {
  return read<Todo[]>(TODOS_KEY) ?? initialTodos;
}

export function saveTodos(todos: Todo[]) {
  write(TODOS_KEY, todos);
}

export function clearAll() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TODOS_KEY);
  } catch {}
}
