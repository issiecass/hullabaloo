import type { FilterId } from "./data";

// Everything Spike says and offers during onboarding. Edit the wording here.

// Part 1: interests
export const interestsQuestion = "What do you do for fun? Scrolling doesn’t count.";

export const interestOptions = ["Cooking", "Baking", "Reading", "Writing", "Hiking", "Running", "Gym", "Yoga", "Sports", "Gaming", "Music", "Movies", "Art", "Crafts", "Photography", "Plants", "Thrifting", "Travel", "Puzzles", "Pets"];

export function interestsReaction(count: number) {
  if (count === 0) return "Nothing? Mysterious. I’ll improvise.";
  if (count === 1) return "One hobby. A minimalist. I respect it.";
  if (count <= 4) return `${count} hobbies, and I still caught you scrolling. Fascinating.`;
  return `${count} hobbies? Ambitious, for someone with this much screen time.`;
}

// Part 2: this-or-that cards
// `reaction` is Spike's written line (also the backup when the model isn't ready).
// `summary` is how the pick is described to the model. `filter` is the ideas filter it switches on.
export type CardOption = { id: string; label: string; caption: string; reaction: string; summary: string; filter?: FilterId };
export type Card = { id: string; question: string; options: [CardOption, CardOption] };

// The user's choices, as card id -> option id. Skipped cards are left out.
export type Picks = Record<string, string>;

export const cards: Card[] = [
  {
    id: "place",
    question: "A free evening appears. Where are you?",
    options: [
      { id: "in", label: "Staying in", caption: "Home is where the snacks are", reaction: "Staying in. The couch has trained you well.", summary: "prefers staying in", filter: "nearby" },
      { id: "out", label: "Going out", caption: "Outside, on purpose", reaction: "Going out? Voluntarily? Look at you.", summary: "likes getting out of the house" },
    ],
  },
  {
    id: "budget",
    question: "Your budget for fun is…",
    options: [
      { id: "free", label: "Zero dollars", caption: "Free or it didn’t happen", reaction: "Zero dollars. Broke but ambitious. My favourite.", summary: "wants free activities", filter: "free" },
      { id: "treat", label: "Treat myself", caption: "My wallet just flinched", reaction: "Treating yourself. Your wallet says hi, and also help.", summary: "happy to spend a little" },
    ],
  },
  {
    id: "time",
    question: "How long before you get bored?",
    options: [
      { id: "hour", label: "An hour, tops", caption: "Short and sweet", reaction: "An hour, tops. Wonder where that attention span went.", summary: "prefers activities under an hour", filter: "hour" },
      { id: "afternoon", label: "A whole afternoon", caption: "Fully committed", reaction: "A whole afternoon. Bold, from a professional scroller.", summary: "happy to spend a whole afternoon" },
    ],
  },
  {
    id: "company",
    question: "Ideal company?",
    options: [
      { id: "solo", label: "Just me", caption: "Peace and quiet", reaction: "Just you. And me, obviously. Always me.", summary: "prefers doing things alone" },
      { id: "people", label: "Actual humans", caption: "In person, even", reaction: "Actual humans. Not the ones in your feed.", summary: "likes doing things with other people" },
    ],
  },
  {
    id: "mode",
    question: "Pick your poison.",
    options: [
      { id: "move", label: "Move my body", caption: "Sweat is involved", reaction: "Moving. Your thumb can’t be the only thing getting exercise.", summary: "likes physical activity" },
      { id: "make", label: "Make something", caption: "Hands, meet project", reaction: "Making something instead of consuming it. Suspicious.", summary: "likes making things" },
    ],
  },
  {
    id: "novelty",
    question: "And finally…",
    options: [
      { id: "new", label: "Something new", caption: "Surprise me", reaction: "Something new. The algorithm noticed that about you.", summary: "likes trying new things" },
      { id: "favourite", label: "An old favourite", caption: "If it works, it works", reaction: "An old favourite. A creature of habit. I’ve seen your screen time.", summary: "prefers familiar activities" },
    ],
  },
];

export const skipReaction = "Skipped. Mysterious. Fine.";

// Part 3: the one typed question
export const meaningToQuestion = "What have you been “meaning to get back to” for months?";
export const meaningToPlaceholder = "Guitar, running, that half-read novel";

export function meaningToReaction(answer: string) {
  return answer ? `“${answer}.” Oh, I will be bringing that up. Often.` : "Nothing? Everyone has one. I’ll find it.";
}

// Part 4: spice level. One sample roast per level, shown when that level is picked.
export const spiceQuestion = "Last one. How mean am I allowed to be?";

export const spiceSamples = [
  "Okay, gently: maybe put the phone down soon? No rush.",
  "Your phone called. It wants some alone time.",
  "Another scroll session. Groundbreaking.",
  "You’ve scrolled far enough to reach the earth’s core. Impressive, and concerning.",
];

export const outro = "Right. I know enough to be annoying. Let’s go.";