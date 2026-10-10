# hullabaloo
# Touch Grass

An AI companion that chirps you off your phone, then hands you something better to do.

Screen time limits are easy to ignore and give you nothing to do instead. Touch Grass pairs a nudge you actually enjoy (a playful roast from Spike, a sarcastic cactus) with three ready-made activities picked for your interests, budget, location, and free time.

> Built in 36 hours for UCF Hackathon 2026.

## How it works

1. **Catch**: a scroll session starts.
2. **Chirp**: Spike roasts you, using your own overdue to-dos as ammunition.
3. **Redirect**: swipe through 3 activity cards, each with a 5-minute starter step.
4. **Reward**: finish one and get your "dopamine receipt" showing the time you reclaimed.

## Features

- Onboarding for interests, spice level, and default filters
- To-do list that feeds the chirps
- AI-generated chirps at four spice levels, from mild to extra spicy
- AI-generated activity cards with swipe and reroll
- Reward screen styled like a paper receipt
- Settings: spice level, "Snooze 30 min", and "Stop chirping today"

Chirps are always PG. They tease the habit, never the person.

## Tech stack

- React + Vite
- Tailwind CSS
- Framer Motion
- LLM API: [provider to be confirmed]

## Getting started

Requires Node.js 18 or later.

```bash
git clone 
cd hullabaloo
npm install
npm run dev
```

Create a `.env` file in the project root for the API key. Never commit this file.

```
VITE_LLM_API_KEY=your-key-here
```

## Design

Mobile-first at 390 x 844. Type is DM Sans, with DM Mono on the receipt.

| Role | Name | Hex |
|---|---|---|
| Background | Sand | `#F4E9D8` |
| Primary | Saguaro green | `#1F4D3A` |
| Accent (buttons) | Terracotta | `#B94A33` |
| Card surfaces | Dune | `#E8D5B7` |
| Highlights | Sunset gold | `#E3A345` |
| Body text | Dusk brown | `#33291F` |
| Spike | Cactus green | `#5E9E5A` |


## Working together

- `main` should always run. Do not push broken code to it.
- Work on your own branch (`yourname/feature`), then open a pull request.
- Pull from `main` before you start each work session.


## Team

| Name | 
| Isabella Cassitta  |
| Mila Knickerbocker |
| Denice Garcia      |
| Daniel Ramirez     |
