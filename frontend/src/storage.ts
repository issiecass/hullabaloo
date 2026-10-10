import type { Answers, FilterId } from "./data";
import type { Picks } from "./onboarding";

export type Profile = { name: string; email: string; interests?: string[]; spice?: number; filters?: FilterId[]; answers?: Answers; picks?: Picks; shortcutKey?: string };

// A chirp the model wrote ahead of time for the interrupt page, and what it was written for (see chirpBasis).
export type PreparedChirp = { chirp: string; basis: string };

// A scrolling session the user started: when it ends (a timestamp) and Spike's line on the countdown card.
export type ScrollSession = { endsAt: number; line: string };

const PROFILE_KEY = "touchgrass.profile";
const NEXT_CHIRP_KEY = "touchgrass.nextChirp";
const SESSION_KEY = "touchgrass.session";

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

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function loadProfile(): Profile | null {
  return read<Profile>(PROFILE_KEY);
}

export function saveProfile(profile: Profile) {
  write(PROFILE_KEY, profile);
}

export function loadNextChirp(): PreparedChirp | null {
  return read<PreparedChirp>(NEXT_CHIRP_KEY);
}

export function saveNextChirp(prepared: PreparedChirp) {
  write(NEXT_CHIRP_KEY, prepared);
}

export function clearNextChirp() {
  remove(NEXT_CHIRP_KEY);
}

export function loadSession(): ScrollSession | null {
  return read<ScrollSession>(SESSION_KEY);
}

export function saveSession(session: ScrollSession) {
  write(SESSION_KEY, session);
}

export function clearSession() {
  remove(SESSION_KEY);
}

export function clearAll() {
  remove(PROFILE_KEY);
  remove(NEXT_CHIRP_KEY);
  remove(SESSION_KEY);
}