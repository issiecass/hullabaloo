import { useState } from "react";
import ActivityCard from "../components/ActivityCard";
import Button from "../components/Button";
import Chip from "../components/Chip";
import TopBar from "../components/TopBar";
import { defaultFilters, filterOptions, pickActivities, type Activity, type FilterId } from "../data";

export default function Activities({ initialFilters = defaultFilters, onStart }: { initialFilters?: FilterId[]; onStart?: (activity: Activity) => void }) {
  const [filters, setFilters] = useState(initialFilters);
  const [cards, setCards] = useState(() => pickActivities(initialFilters));
  const [active, setActive] = useState(0);

  function show(next: Activity[]) {
    setCards(next);
    setActive(0);
  }
  function toggleFilter(id: FilterId) {
    const next = filters.includes(id) ? filters.filter(f => f !== id) : [...filters, id];
    setFilters(next);
    show(pickActivities(next));
  }

  return <main className="screen activity-screen">
    <TopBar title="Escape plan"/>
    <div className="activity-intro"><p>Three better ideas</p><h1>Pick your antidote.</h1></div>
    <div className="chips filter-chips">{filterOptions.map(f => <Chip key={f.id} active={filters.includes(f.id)} onClick={() => toggleFilter(f.id)}>{f.label}</Chip>)}</div>
    <div className="card-stack" onClick={() => setActive((active + 1) % cards.length)}>
      {[2,1,0].filter(offset => offset < cards.length).map((offset) => { const index = (active + offset) % cards.length; return <div className={`stack-pos pos-${offset}`} key={`${cards[index].title}-${offset}`}><ActivityCard activity={cards[index]} index={index}/></div>; })}
    </div>
    <div className="swipe-hint"><span>←</span> Tap the card to browse <span>→</span></div>
    <div className="dual-actions"><Button variant="secondary" icon="refresh" onClick={() => show(pickActivities(filters, cards))}>Reroll</Button><Button icon="play" onClick={() => onStart?.(cards[active])}>Start</Button></div>
  </main>;
}
