import { useEffect, useRef, useState, type FormEvent } from "react";
import ActivityCard from "../components/ActivityCard";
import Button from "../components/Button";
import Chip from "../components/Chip";
import Icon from "../components/Icon";
import Spike from "../components/Spike";
import TopBar from "../components/TopBar";
import { defaultFilters, filterOptions, pickActivities, type Activity, type FilterId, type Todo } from "../data";
import { generateActivities } from "../llm";
import type { Profile } from "../storage";

// With `ai` off (the gallery preview) ideas come straight from the backup list.
export default function Activities({ ai = false, profile = null, todos = [], initialFilters = defaultFilters, onStart }: { ai?: boolean; profile?: Profile | null; todos?: Todo[]; initialFilters?: FilterId[]; onStart?: (activity: Activity, filters: FilterId[]) => void }) {
  const [filters, setFilters] = useState(initialFilters);
  const [cards, setCards] = useState<Activity[]>(() => ai ? [] : pickActivities(initialFilters));
  const [active, setActive] = useState(0);
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<"loading" | "ai" | "backup">(ai ? "loading" : "backup");
  const pending = useRef<AbortController | null>(null);

  async function load(nextFilters: FilterId[], exclude: Activity[] = []) {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    let next = pickActivities(nextFilters, exclude);
    let source: "ai" | "backup" = "backup";
    if (ai) {
      setStatus("loading");
      try {
        next = await generateActivities({ profile, filters: nextFilters, todos, request: request.trim(), exclude: exclude.map(a => a.title) }, controller.signal);
        source = "ai";
      } catch {
        // Fall through to the backup list.
      }
    }
    // A newer request replaced this one while it was in flight.
    if (pending.current !== controller) return;
    setCards(next);
    setActive(0);
    setStatus(source);
  }

  useEffect(() => {
    if (ai) load(initialFilters);
    return () => pending.current?.abort();
  }, []);

  function toggleFilter(id: FilterId) {
    const next = filters.includes(id) ? filters.filter(f => f !== id) : [...filters, id];
    setFilters(next);
    load(next);
  }
  function handleAsk(e: FormEvent) {
    e.preventDefault();
    load(filters);
  }

  const loading = status === "loading";
  return <main className="screen activity-screen">
    <TopBar title="Escape plan"/>
    <div className="activity-intro"><p>Three better ideas</p><h1>Pick your antidote.</h1></div>
    <div className="chips filter-chips">{filterOptions.map(f => <Chip key={f.id} active={filters.includes(f.id)} onClick={() => toggleFilter(f.id)}>{f.label}</Chip>)}</div>
    <form className="todo-add idea-ask" onSubmit={handleAsk}>
      <input aria-label="Ask for something specific" placeholder="In the mood for… creative, indoors" value={request} onChange={e => setRequest(e.target.value)}/>
      <button className="todo-add-btn" aria-label="Get ideas"><Icon name="sparkle" size={20}/></button>
    </form>
    {loading ? <div className="card-stack"><div className="activity-card thinking-card"><Spike mood="playful" size={96}/><p>Spike is thinking…</p></div></div>
      : cards.length === 0 ? <div className="card-stack"><div className="activity-card thinking-card"><Spike mood="sassy" size={96}/><p>Nothing fits those filters. Loosen one.</p></div></div>
      : <div className="card-stack" onClick={() => setActive((active + 1) % cards.length)}>
          {[2,1,0].filter(offset => offset < cards.length).map((offset) => { const index = (active + offset) % cards.length; return <div className={`stack-pos pos-${offset}`} key={`${cards[index].title}-${offset}`}><ActivityCard activity={cards[index]} index={index}/></div>; })}
        </div>}
    <div className="swipe-hint">{ai && status === "backup" ? "Couldn’t reach the AI, so these are from Spike’s backup list." : <><span>←</span> Tap the card to browse <span>→</span></>}</div>
    <div className="dual-actions"><Button icon="play" disabled={loading || cards.length === 0} onClick={() => onStart?.(cards[active], filters)}>Start</Button></div>
  </main>;
}
