import type { Activity, FilterId, Todo } from "./data";
import type { Profile } from "./storage";

// Any OpenAI-compatible chat endpoint works here (Ollama, LM Studio, Groq, OpenRouter, Together).
// The default is Ollama running on the same machine, which needs no key.
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL ?? "http://localhost:11434/v1";
const MODEL = import.meta.env.VITE_LLM_MODEL ?? "llama3.2";
const API_KEY = import.meta.env.VITE_LLM_API_KEY;
const TIMEOUT_MS = 20000;

const TAGS = ["QUICK WIN", "NOVELTY", "SOCIAL"] as const;

const SYSTEM_PROMPT = `You suggest things a person could do right now instead of scrolling social media.
Suggest exactly 3 activities that fit this specific person. Make them concrete and easy to start, not generic advice.
Reply with JSON only, in this shape:
{"activities":[{"title":"8 words or fewer","minutes":30,"starter_step":"One action that takes under 5 minutes, 20 words or fewer","tag":"QUICK WIN","free":true,"nearby":true}]}
"tag" is one of "QUICK WIN", "NOVELTY" or "SOCIAL". "free" means it costs nothing. "nearby" means it can be done at or close to home.
Rules: keep everything PG and kind. No profanity, nothing sexual, nothing dangerous or illegal, and no jokes about a person's identity, body, intelligence or mental health. Follow every constraint the user gives.`;

export type IdeaRequest = { profile: Profile | null; filters: FilterId[]; todos: Todo[]; request?: string; exclude?: string[] };

function describeUser({ profile, filters, todos, request, exclude }: IdeaRequest) {
  const answers = profile?.answers;
  const openTodos = todos.filter(t => !t.done).map(t => t.text);
  return [
    profile?.interests?.length && `Interests: ${profile.interests.join(", ")}`,
    answers?.meaningTo && `Has been meaning to start or get back to: ${answers.meaningTo}`,
    answers?.freeHour.length && `A good free hour for them involves: ${answers.freeHour.join(", ")}`,
    answers?.people && `Wishes they saw more of: ${answers.people}`,
    answers?.avoid && `Never suggest anything involving: ${answers.avoid}`,
    openTodos.length && `Unfinished to-dos (one idea may help with one of these): ${openTodos.join("; ")}`,
    filters.includes("free") && "Constraint: every activity must be free.",
    filters.includes("nearby") && "Constraint: every activity must be at or close to home.",
    filters.includes("hour") && "Constraint: every activity must take 60 minutes or less.",
    exclude?.length && `Do not repeat these ideas: ${exclude.join("; ")}`,
    request && `What they asked for just now: ${request}`,
  ].filter((line): line is string => typeof line === "string" && line !== "").join("\n") || "No details given. Suggest broadly appealing ideas.";
}

// Models sometimes wrap JSON in prose or code fences, so parse from the first brace to the last.
export function parseActivities(content: string): Activity[] {
  const parsed = JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1));
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

export async function generateActivities(input: IdeaRequest, signal?: AbortSignal): Promise<Activity[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort());
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}) },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: describeUser(input) }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`LLM request failed with status ${res.status}`);
    const data = await res.json();
    return parseActivities(data.choices[0].message.content);
  } finally {
    clearTimeout(timer);
  }
}
