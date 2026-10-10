// The longest scrolling session a user can give themselves: two hours.
export const MAX_SESSION_SECONDS = 2 * 60 * 60;

// Spike's reaction to the length chosen on the wheels. More time, more attitude.
const reactions: { upTo: number; line: string }[] = [
  { upTo: 0, line: "How long are we rotting today? Spin the wheels." },
  { upTo: 59, line: "Seconds? That’s not rotting, that’s a blink." },
  { upTo: 5 * 60, line: "Barely enough time to find something to be mad about." },
  { upTo: 15 * 60, line: "A respectable rot. Modest. Almost responsible." },
  { upTo: 30 * 60, line: "Settling in, I see. The couch sends its regards." },
  { upTo: 60 * 60, line: "That’s a whole episode of doing nothing. Bold." },
  { upTo: Infinity, line: "That’s not a break, that’s a lifestyle." },
];

export function sessionReaction(seconds: number): string {
  return (reactions.find(reaction => seconds <= reaction.upTo) ?? reactions[reactions.length - 1]).line;
}

export const capReaction = "Two hours is my limit. Even I have standards.";

// The line on the countdown card until the model's send-off arrives, or if it never does.
export function fallbackSendOff(seconds: number): string {
  if (seconds < 5 * 60) return "Go on, then. I’ll count. Loudly.";
  if (seconds < 30 * 60) return "Go on. I’m watching the clock.";
  return "Take your time. I’ll be here, quietly judging.";
}

// "1 hour 30 minutes", for telling the model how long the session is.
export function describeDuration(seconds: number): string {
  const parts = [
    [Math.floor(seconds / 3600), "hour"],
    [Math.floor((seconds % 3600) / 60), "minute"],
    [seconds % 60, "second"],
  ] as const;
  return parts.filter(([amount]) => amount > 0).map(([amount, unit]) => `${amount} ${unit}${amount === 1 ? "" : "s"}`).join(" ") || "0 seconds";
}

// "14:32" or "1:04:32", for the countdown.
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const pad = (n: number) => String(n).padStart(2, "0");
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  return hours ? `${hours}:${pad(minutes)}:${pad(s % 60)}` : `${minutes}:${pad(s % 60)}`;
}