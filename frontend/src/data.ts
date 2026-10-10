export type Todo = { id: string; text: string; note?: string; overdue?: boolean; done: boolean };

// Example tasks for the gallery preview only. Real users start with an empty list.
export const sampleTodos: Todo[] = [
  { id: "dentist", text: "Schedule dentist appointment", note: "3 weeks overdue", overdue: true, done: false },
  { id: "read", text: "Read 20 pages", done: false },
  { id: "mom", text: "Call mom", done: false },
  { id: "stats", text: "Finish stats assignment", done: false },
];

export type Answers = { meaningTo: string; freeHour: string[]; people: string; avoid: string };

export const freeHourOptions = ["Moving my body", "Making something", "Seeing people", "Learning something", "Being outside", "Proper rest"];

export const spiceLevels = [
  { name: "Mild", blurb: "A friendly nudge" },
  { name: "Playful", blurb: "Light teasing" },
  { name: "Sassy", blurb: "Dry sarcasm" },
  { name: "Extra spiky", blurb: "A full roast" },
];

export type FilterId = "free" | "nearby" | "hour";

export const filterOptions: { id: FilterId; label: string; longLabel: string }[] = [
  { id: "free", label: "Free", longLabel: "Free only" },
  { id: "nearby", label: "Nearby", longLabel: "Stay nearby" },
  { id: "hour", label: "≤ 1 hour", longLabel: "≤ 1 hour" },
];

export const defaultFilters: FilterId[] = ["free", "nearby", "hour"];

export type Activity = { tag: "QUICK WIN" | "NOVELTY" | "SOCIAL"; title: string; minutes: number; step: string; free: boolean; nearby: boolean };

// Backup ideas for when the AI call fails or is switched off.
export const activityPool: Activity[] = [
  { tag: "QUICK WIN", title: "Make the pasta you’ve been watching", minutes: 35, step: "Put a pot of water on the stove. That’s it. Momentum unlocked.", free: true, nearby: true },
  { tag: "NOVELTY", title: "Walk to a street you’ve never taken", minutes: 25, step: "Shoes on. Pick the first left you normally ignore.", free: true, nearby: true },
  { tag: "SOCIAL", title: "Call Mom while you walk", minutes: 20, step: "Send “Got 20 mins?” before your brain invents an excuse.", free: true, nearby: true },
  { tag: "QUICK WIN", title: "Read 20 pages of that book", minutes: 30, step: "Find the book. Open to the bookmark. Read one page standing up.", free: true, nearby: true },
  { tag: "NOVELTY", title: "Sketch whatever is on your desk", minutes: 15, step: "Grab any pen and the back of an envelope. Draw the first object you see.", free: true, nearby: true },
  { tag: "SOCIAL", title: "Text a friend a plan for this weekend", minutes: 10, step: "Open the chat and type “Saturday?” Send it before you overthink it.", free: true, nearby: true },
  { tag: "QUICK WIN", title: "Stretch for one full playlist", minutes: 20, step: "Stand up and reach for the ceiling. You’ve already started.", free: true, nearby: true },
  { tag: "NOVELTY", title: "Try the coffee shop you keep walking past", minutes: 45, step: "Put your wallet in your pocket and your shoes by the door.", free: false, nearby: true },
  { tag: "SOCIAL", title: "Meet a friend for a hike", minutes: 120, step: "Text one friend “hike this afternoon?” and fill a water bottle.", free: true, nearby: false },
  { tag: "NOVELTY", title: "Catch a matinee at the cinema", minutes: 150, step: "Look up today’s showtimes and pick the one that starts soonest.", free: false, nearby: false },
];

export function pickActivities(filters: FilterId[], exclude: Activity[] = []): Activity[] {
  const matches = activityPool.filter(a => (!filters.includes("free") || a.free) && (!filters.includes("nearby") || a.nearby) && (!filters.includes("hour") || a.minutes <= 60));
  const shuffled = [...matches].sort(() => Math.random() - 0.5);
  // Fresh ideas first, so a reroll shows new cards whenever the pool allows.
  return [...shuffled.filter(a => !exclude.includes(a)), ...shuffled.filter(a => exclude.includes(a))].slice(0, 3);
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} hr${rest ? ` ${rest} min` : ""}`;
}
