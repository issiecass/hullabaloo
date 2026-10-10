import type { Todo } from "./data";

type Template = (task?: string) => string;

// Backup chirps for when the AI call fails. One row per spice level, one entry per tier (20, 40 and 60 minutes).
const templates: Template[][] = [
  [
    t => t ? `20 minutes of scrolling. “${t}” is still waiting, whenever you’re ready.` : "You’ve been scrolling for 20 minutes. A little break might feel nice.",
    t => t ? `40 minutes now. “${t}” would take less time than this has.` : "40 minutes in. Your eyes would love a change of scenery.",
    t => t ? `That’s an hour. How about we go and do “${t}” together?` : "That’s an hour. Let’s find you something better to do.",
  ],
  [
    t => t ? `20 minutes. “${t}” is starting to feel left out.` : "20 minutes. Your thumb has really put in a shift.",
    t => t ? `40 minutes, and “${t}” still hasn’t done itself. Weird.` : "40 minutes. The feed will survive without you, promise.",
    t => t ? `An hour gone. “${t}” has been waving at you this whole time.` : "An hour. Even your phone could use a break.",
  ],
  [
    t => t ? `20 minutes of scrolling, zero minutes of “${t}”. Interesting priorities.` : "20 minutes of scrolling. Riveting stuff, I assume.",
    t => t ? `40 minutes in and “${t}” remains untouched. Bold strategy.` : "40 minutes of other people’s lives. Bold strategy.",
    t => t ? `One hour. “${t}” could have been done three times by now.` : "An hour of watching strangers live their lives. Should we try yours?",
  ],
  [
    t => t ? `20 minutes already. “${t}” is still pending. Stunning work.` : "20 minutes of scrolling. Truly a marathon of the thumb.",
    t => t ? `40 minutes. “${t}” is collecting dust, but at least the feed got your attention.` : "40 minutes. The algorithm thanks you for your service.",
    t => t ? `A full hour gone and “${t}” hasn’t moved. Award-winning procrastination.` : "A full hour. A personal best in doing nothing. Shall we stop?",
  ],
];

export function fallbackChirps(spice = 2, todos: Todo[] = []): string[] {
  const open = todos.filter(t => !t.done).map(t => t.text);
  const level = templates[Math.min(Math.max(spice, 1), 4) - 1];
  return level.map((template, tier) => template(open.length ? open[tier % open.length] : undefined));
}

// Backup chirps for the interrupt page ("time's up"), one per spice level.
const interruptTemplates: Template[] = [
  t => t ? `Time’s up for today. “${t}” is still waiting, whenever you’re ready.` : "Time’s up for today. A little break might feel nice.",
  t => t ? `That’s your scrolling time gone. “${t}” is starting to feel left out.` : "That’s your scrolling time gone. Your thumb has earned a rest.",
  t => t ? `Out of scrolling time, and “${t}” remains untouched. Bold strategy.` : "Out of scrolling time. Should we try your own life for a bit?",
  t => t ? `Time’s up. “${t}” hasn’t moved, but the feed got your full attention. Stunning work.` : "Time’s up. A personal best in doing nothing. Shall we stop?",
];

export function fallbackInterruptChirp(spice = 2, todos: Todo[] = []): string {
  const open = todos.filter(t => !t.done).map(t => t.text);
  return interruptTemplates[Math.min(Math.max(spice, 1), 4) - 1](open[0]);
}

// Describes what a prepared chirp was written for, so a stale one isn't shown after the tasks or spice level change.
export function chirpBasis(spice = 2, todos: Todo[] = []): string {
  return `${spice}|${todos.filter(t => !t.done).map(t => t.text).join("|")}`;
}

const BLOCKED = /\b(fuck\w*|shit\w*|bitch\w*|ass|asshole|damn|crap|stupid|idiot|dumb|moron|loser|ugly|fat|lazy|pathetic|worthless|useless|hopeless|procrastinator\w*|slacker\w*|slob\w*|failure)\b/i;

// Last line of defence on model output: right length, and nothing profane or aimed at the person.
export function isCleanChirp(text: unknown): text is string {
  if (typeof text !== "string") return false;
  const words = text.trim().split(/\s+/).length;
  return text.trim().length >= 8 && words <= 32 && !BLOCKED.test(text);
}

// Snooze choices in Settings. The comments are backups for when the AI call fails; longer snoozes get more attitude.
export const snoozeOptions = [
  { minutes: 1, label: "1 minute", comment: "One minute. Barely a blink. Fine." },
  { minutes: 15, label: "15 minutes", comment: "Fifteen minutes? I’ll be right here, watching the clock. Judging quietly." },
  { minutes: 30, label: "30 minutes", comment: "Thirty whole minutes of peace for your feed. Bold. Truly, take your time." },
];