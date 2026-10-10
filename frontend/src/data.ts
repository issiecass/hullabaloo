export const initialTodos = [
  { text: "Schedule dentist appointment", note: "3 weeks overdue", overdue: true },
  { text: "Read 20 pages" },
  { text: "Call mom" },
  { text: "Finish stats assignment" },
];

export const activities = [
  { num: "01", tag: "QUICK WIN", title: "Make the pasta you’ve been watching", time: "35 min", step: "Put a pot of water on the stove. That’s it. Momentum unlocked.", tone: "sage" },
  { num: "02", tag: "NOVELTY", title: "Walk to a street you’ve never taken", time: "25 min", step: "Shoes on. Pick the first left you normally ignore.", tone: "cream" },
  { num: "03", tag: "SOCIAL", title: "Call Mom while you walk", time: "20 min", step: "Send “Got 20 mins?” before your brain invents an excuse.", tone: "mint" },
];

export type Activity = typeof activities[number];
