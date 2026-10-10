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
- LLM: any OpenAI-compatible chat endpoint. Defaults to an open-source model served locally by Ollama.

## Getting started

Requires Node.js 18 or later and pnpm (`npm install -g pnpm`).

```bash
git clone https://github.com/issiecass/hullabaloo.git
cd hullabaloo/frontend
pnpm install
pnpm dev
```

The app opens at http://localhost:8443.

## AI activity ideas

The ideas screen asks an LLM for three activities, using the user's interests, onboarding answers, to-dos, filters, and whatever they type into the request box. If the model can't be reached, the app falls back to a built-in list, so it always works.

By default it talks to [Ollama](https://ollama.com) on the same machine, which is free and needs no key:

```bash
ollama pull llama3.2
```

Ollama then serves the model at `http://localhost:11434` whenever it is running.

To use a different model or a hosted provider, create `frontend/.env` (it is gitignored) and restart `pnpm dev`:

```
VITE_LLM_BASE_URL=http://localhost:11434/v1
VITE_LLM_MODEL=llama3.2
VITE_LLM_API_KEY=
```

A key placed in `.env` ends up in the browser bundle where anyone can read it. That is fine for a local demo, but a hosted key should sit behind a backend.

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
