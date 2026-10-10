import { api } from "./api";
import { fallbackChirps, isCleanChirp, snoozeOptions } from "./chirps";
import { spiceLevels, type Activity, type FilterId, type Todo } from "./data";
import { cards, spiceSamples, type Card } from "./onboarding";
import { describeDuration } from "./session";
import type { Profile } from "./storage";

// The model is reached through the backend's /llm/chat, which holds the API key. Nothing here talks to the provider directly.
const IDEAS_TIMEOUT_MS = 20000;
const CHIRPS_TIMEOUT_MS = 12000;

const TAGS = ["QUICK WIN", "NOVELTY", "SOCIAL"] as const;
const TIERS = [20, 40, 60];

const CONTENT_RULES = "Rules: keep everything PG and kind. No profanity, nothing sexual, nothing dangerous or illegal, and no jokes about race, religion, gender, sexuality, disability, nationality, politics, or a person's body, intelligence, worth or mental health.";

const IDEAS_PROMPT = `You suggest things a person could do right now instead of scrolling social media.
Suggest exactly 3 activities that fit this specific person. Make them concrete and easy to start, not generic advice.
Reply with JSON only, in this shape:
{"activities":[{"title":"8 words or fewer","minutes":30,"starter_step":"One action that takes under 5 minutes, 20 words or fewer","tag":"QUICK WIN","free":true,"nearby":true}]}
"tag" is one of "QUICK WIN", "NOVELTY" or "SOCIAL". "free" means it costs nothing. "nearby" means it can be done at or close to home.
${CONTENT_RULES} Follow every constraint the user gives.`;

const CHIRPS_PROMPT = `You are Spike, a sarcastic but kind cactus who teases people for scrolling social media too long, the way a good friend would.
Write 3 chirps for someone who is scrolling right now: one for when they reach 20 minutes, one for 40 minutes and one for 60 minutes. Each is a little more pointed than the last.
Speak directly to the person as "you". Never use their name and never write about them in the third person.
When they have unfinished to-dos, mention one of them in every chirp, using a different one each time if you can. Only mention to-dos from their list.
Each chirp is short: one or two sentences and 20 words at most, with no emoji and no hashtags.
Observe and tease rather than giving orders or advice.
Match the spice level you are given: 1 is a friendly nudge, 2 is light teasing, 3 is dry sarcasm, 4 is a full roast that is still clean.
Tease the habit, never the person: aim at the scrolling, the procrastination and the phone.
${CONTENT_RULES}
Reply with JSON only, in this shape: {"at_20_minutes":"...","at_40_minutes":"...","at_60_minutes":"..."}`;

const INTERRUPT_PROMPT = `You are Spike, a sarcastic but kind cactus who teases people for scrolling social media too long, the way a good friend would.
The person has just used up their scrolling time for today, and you are interrupting them. Write 1 chirp telling them their time is up.
Speak directly to the person as "you". Never use their name and never write about them in the third person.
When they have unfinished to-dos, mention one of them. Only mention to-dos from their list.
The chirp is short: one or two sentences and 20 words at most, with no emoji and no hashtags. Do not mention a number of minutes or hours.
Observe and tease rather than giving orders or advice.
Match the spice level you are given: 1 is a friendly nudge, 2 is light teasing, 3 is dry sarcasm, 4 is a full roast that is still clean.
Tease the habit, never the person: aim at the scrolling, the procrastination and the phone.
${CONTENT_RULES}
Reply with JSON only, in this shape: {"chirp":"..."}`;

const SNOOZE_PROMPT = `You are Spike, a sarcastic but kind cactus in an app that nags people off social media. The person is about to snooze your reminders.
Write 3 short reactions, one for each snooze length: 1 minute, 15 minutes and 30 minutes.
The longer the snooze, the more attitude: 1 minute is mildly amused, 15 minutes is pointed, and 30 minutes is your most theatrical sarcasm.
Speak directly to the person as "you". Never use their name and never write about them in the third person.
Each reaction is one or two sentences and 20 words at most, with no emoji and no hashtags. You may mention one of their unfinished to-dos.
Match the spice level you are given: 1 is gentle, 4 is the sharpest, still clean.
Tease the habit of putting things off, never the person.
${CONTENT_RULES}
Reply with JSON only, in this shape: {"snooze_1":"...","snooze_15":"...","snooze_30":"..."}`;

const ONBOARDING_PROMPT = `You are Spike, a sarcastic but kind cactus in an app that nags people off social media. A new user is telling you about themselves.
You will be given a list of keys, each with a situation. Write one line from Spike for each key.
Each line is a single teasing one-liner of 16 words at most. When the situation is an answer they gave, start by echoing the answer, then poke fun at their scrolling habit.
Speak directly to the person as "you". No emoji, no hashtags and no questions.
If you are told their interests, you may work one of them in.
Tease the habit, never the person.
${CONTENT_RULES}
Reply with JSON only: one object with exactly the keys you were given, each mapped to its line.`;

// Sends one request to the model through the backend and returns its reply text. Throws on any failure or timeout.
async function chat(system: string, user: string, timeoutMs: number, signal?: AbortSignal): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort());
  try {
    const { content } = await api<{ content: string }>("/llm/chat", { method: "POST", body: JSON.stringify({ system, user }), signal: controller.signal });
    return content;
  } finally {
    clearTimeout(timer);
  }
}

// Models sometimes wrap JSON in prose or code fences, so parse from the first brace to the last.
function parseJson(content: string) {
  return JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1));
}

const lines = (items: unknown[]) => items.filter((line): line is string => typeof line === "string" && line !== "").join("\n");

function describeInterests(profile: Profile | null) {
  const answers = profile?.answers;
  const picks = profile?.picks ?? {};
  const pickSummaries = cards.flatMap(card => card.options.filter(option => picks[card.id] === option.id).map(option => option.summary));
  return [
    profile?.interests?.length && `Interests: ${profile.interests.join(", ")}`,
    pickSummaries.length && `How they like to spend free time: ${pickSummaries.join("; ")}`,
    answers?.meaningTo && `Has been meaning to start or get back to: ${answers.meaningTo}`,
    answers?.freeHour.length && `A good free hour for them involves: ${answers.freeHour.join(", ")}`,
    answers?.people && `Wishes they saw more of: ${answers.people}`,
  ];
}

export type IdeaRequest = { profile: Profile | null; filters: FilterId[]; todos: Todo[]; request?: string; exclude?: string[] };

export function parseActivities(content: string): Activity[] {
  const parsed = parseJson(content);
  const activities: Activity[] = [];
  for (const item of Array.isArray(parsed?.activities) ? parsed.activities : []) {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const step = typeof item?.starter_step === "string" ? item.starter_step.trim() : "";
    const minutes = Math.round(Number(item?.minutes));
    if (!title || !step || !(minutes > 0)) continue;
    activities.push({ title, step, minutes, tag: TAGS.includes(item.tag) ? item.tag : "QUICK WIN", free: item.free !== false, nearby: item.nearby !== false });
  }
  if (activities.length === 0) throw new Error("The model returned no usable activities");
  return activities.slice(0, 3);
}

export async function generateActivities({ profile, filters, todos, request, exclude }: IdeaRequest, signal?: AbortSignal): Promise<Activity[]> {
  const openTodos = todos.filter(t => !t.done).map(t => t.text);
  const user = lines([
    ...describeInterests(profile),
    profile?.answers?.avoid && `Never suggest anything involving: ${profile.answers.avoid}`,
    openTodos.length && `Unfinished to-dos (one idea may help with one of these): ${openTodos.join("; ")}`,
    filters.includes("free") && "Constraint: every activity must be free.",
    filters.includes("nearby") && "Constraint: every activity must be at or close to home.",
    filters.includes("hour") && "Constraint: every activity must take 60 minutes or less.",
    exclude?.length && `Do not repeat these ideas: ${exclude.join("; ")}`,
    request && `What they asked for just now: ${request}`,
  ]) || "No details given. Suggest broadly appealing ideas.";
  return parseActivities(await chat(IDEAS_PROMPT, user, IDEAS_TIMEOUT_MS, signal));
}

// Small models sometimes put the wrong duration in a slot, which would contradict what is on screen.
function isCleanLine(text: unknown, minutes: number): text is string {
  return isCleanChirp(text) && [...text.matchAll(/(\d+)\s*-?\s*min/gi)].every(match => Number(match[1]) === minutes);
}

// Returns three chirps (20, 40 and 60 minutes). Any line the model gets wrong is replaced by its backup.
export function parseChirps(content: string, backup: string[]): string[] {
  const parsed = parseJson(content);
  const ok = (chirp: unknown, tier: number): chirp is string => isCleanLine(chirp, TIERS[tier]);
  const chirps = TIERS.map(tier => parsed?.[`at_${tier}_minutes`]);
  if (!chirps.some(ok)) throw new Error("The model returned no usable chirps");
  return backup.map((fallback, tier) => { const chirp = chirps[tier]; return ok(chirp, tier) ? chirp.trim() : fallback; });
}

// What the chirp prompts are told about the person: spice level and unfinished to-dos.
function describeForChirp(profile: Profile | null, todos: Todo[]) {
  const openTodos = todos.filter(t => !t.done).map(t => t.note ? `${t.text} (${t.note})` : t.text);
  const meaningTo = profile?.answers?.meaningTo;
  return lines([
    `Spice level: ${profile?.spice ?? 2} of 4`,
    openTodos.length ? `Their unfinished to-dos: ${openTodos.join("; ")}` : "They have no unfinished to-dos, so tease the scrolling itself.",
    !openTodos.length && meaningTo && `Something they keep meaning to get back to: ${meaningTo}`,
  ]);
}

export async function generateChirps({ profile, todos }: { profile: Profile | null; todos: Todo[] }, signal?: AbortSignal): Promise<string[]> {
  return parseChirps(await chat(CHIRPS_PROMPT, describeForChirp(profile, todos), CHIRPS_TIMEOUT_MS, signal), fallbackChirps(profile?.spice ?? 2, todos));
}

// The "time's up" chirp for the interrupt page. Throws if the model's line isn't usable, so the caller can keep the written one.
export async function generateInterruptChirp({ profile, todos }: { profile: Profile | null; todos: Todo[] }, signal?: AbortSignal): Promise<string> {
  const chirp = parseJson(await chat(INTERRUPT_PROMPT, describeForChirp(profile, todos), CHIRPS_TIMEOUT_MS, signal))?.chirp;
  // -1 never matches, so a chirp that names any number of minutes is rejected.
  if (!isCleanLine(chirp, -1)) throw new Error("The model returned no usable chirp");
  return chirp.trim();
}

// Returns one reaction per snooze option. Any line the model gets wrong is replaced by its written backup.
export async function generateSnoozeComments({ spice = 2, todos }: { spice?: number; todos: Todo[] }, signal?: AbortSignal): Promise<string[]> {
  const openTodos = todos.filter(t => !t.done).map(t => t.text);
  const user = lines([
    `Spice level: ${spice} of 4`,
    openTodos.length ? `Their unfinished to-dos: ${openTodos.join("; ")}` : "They have no unfinished to-dos.",
  ]);
  const parsed = parseJson(await chat(SNOOZE_PROMPT, user, CHIRPS_TIMEOUT_MS, signal));
  const comments = snoozeOptions.map(option => parsed?.[`snooze_${option.minutes}`]);
  if (!comments.some((comment, i) => isCleanLine(comment, snoozeOptions[i].minutes))) throw new Error("The model returned no usable snooze comments");
  return snoozeOptions.map((option, i) => { const comment = comments[i]; return isCleanLine(comment, option.minutes) ? comment.trim() : option.comment; });
}

// One line the model is asked to write during onboarding: where it goes, what happened, and a written example of the tone.
export type LineRequest = { key: string; situation: string; example: string };

export function cardLineRequests(batch: Card[]): LineRequest[] {
  return batch.flatMap(card => card.options.map(option => ({ key: `${card.id}_${option.id}`, situation: `they answered "${option.label}" to "${card.question}"`, example: option.reaction })));
}

export function spiceLineRequests(): LineRequest[] {
  return spiceSamples.map((example, i) => ({ key: `spice_${i + 1}`, situation: `they allowed harshness level ${i + 1} of 4 (${spiceLevels[i].name}), so show off a sample roast about scrolling at exactly that level`, example }));
}

// Returns the lines that came back usable, by key. A missing key means "use the written line for that one".
export async function generateOnboardingLines(requests: LineRequest[], interests: string[], signal?: AbortSignal): Promise<Record<string, string>> {
  const user = lines([
    interests.length && `Their interests: ${interests.join(", ")}`,
    "Write a line for each key:",
    ...requests.map(request => `${request.key}: ${request.situation}. Tone example, do not copy it: "${request.example}"`),
  ]);
  const parsed = parseJson(await chat(ONBOARDING_PROMPT, user, CHIRPS_TIMEOUT_MS, signal));
  const result: Record<string, string> = {};
  for (const { key } of requests) {
    const line = parsed?.[key];
    if (isCleanChirp(line)) result[key] = line.trim();
  }
  return result;
}


const SEND_OFF_PROMPT = `You are Spike, a sarcastic but kind cactus in an app that nags people off social media. The person has just given themselves a set amount of scrolling time and is about to go and use it.
Write 1 send-off line for them. React to how long they chose: the longer the session, the more attitude.
Speak directly to the person as "you". Never use their name and never write about them in the third person.
The line is one sentence of 16 words at most, with no emoji, no hashtags and no questions. You may mention one of their unfinished to-dos.
Match the spice level you are given: 1 is gentle, 4 is the sharpest, still clean.
Tease the habit, never the person.
${CONTENT_RULES}
Reply with JSON only, in this shape: {"line":"..."}`;

// Spike's parting line when a scrolling session starts. Throws if the model's line isn't usable, so the caller keeps the written one.
export async function generateSendOff({ profile, todos, seconds }: { profile: Profile | null; todos: Todo[]; seconds: number }, signal?: AbortSignal): Promise<string> {
  const user = lines([`They chose to scroll for: ${describeDuration(seconds)}`, describeForChirp(profile, todos)]);
  const line = parseJson(await chat(SEND_OFF_PROMPT, user, CHIRPS_TIMEOUT_MS, signal))?.line;
  if (!isCleanChirp(line)) throw new Error("The model returned no usable line");
  return line.trim();
}