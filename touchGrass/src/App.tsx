import { useState, type ReactNode } from "react";

type IconName =
  | "home"
  | "check"
  | "settings"
  | "clock"
  | "map"
  | "sparkle"
  | "refresh"
  | "play"
  | "heart"
  | "message"
  | "bookmark"
  | "chevron";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06L7.03 4.2l.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2l2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.62.7 1.06 1.34 1.06H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    sparkle: <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z"/>,
    refresh: <><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 1-2-5"/></>,
    play: <path d="m9 6 9 6-9 6Z"/>,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

type SpikeMood = "mild" | "playful" | "sassy" | "spicy" | "proud" | "asleep";

function Spike({ mood = "mild", size = 92 }: { mood?: SpikeMood; size?: number }) {
  const isSassy = mood === "sassy";
  const armLeft = mood === "proud" ? "M30 51 Q11 42 14 27" : isSassy ? "M29 51 Q16 58 25 66" : mood === "spicy" ? "M31 52 Q15 42 19 32" : "M29 49 Q15 42 17 31";
  const armRight = mood === "proud" ? "M66 51 Q84 40 81 26" : isSassy ? "M65 50 Q79 57 70 66" : mood === "spicy" ? "M67 51 Q80 46 76 36" : "M66 53 Q80 56 80 68";
  return (
    <svg className="spike" width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={`Spike looks ${mood}`}>
      {mood === "asleep" && <><path d="M35 20Q50 0 68 20Z" fill="#B94A33"/><circle cx="69" cy="19" r="5" fill="#E3A345"/><text x="72" y="14" className="z">z</text><text x="81" y="6" className="z big">Z</text></>}
      {mood === "proud" && <><path d="m12 20 2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3 5-1Z" fill="#E3A345"/><path d="m79 11 1 4 4 1-3 2 1 4-3-2-4 2 2-4-3-2 4-1Z" fill="#E3A345"/></>}
      <path d={armLeft} fill="none" stroke="#1F4D3A" strokeWidth="9" strokeLinecap="round"/>
      <path d={armRight} fill="none" stroke="#1F4D3A" strokeWidth="9" strokeLinecap="round"/>
      <path d="M38 78 34 89M59 78l4 11" stroke="#1F4D3A" strokeWidth="8" strokeLinecap="round"/>
      <rect x="27" y="14" width="42" height="70" rx="21" fill="#5E9E5A" stroke="#1F4D3A" strokeWidth="3"/>
      <g stroke="#1F4D3A" strokeWidth="2" strokeLinecap="round" opacity=".75">
        <path d="m29 30-5-2M67 27l5-3M28 60l-5 2M69 58l5 2M47 18v-5M50 80v6M37 42l-4-2M60 43l4-2"/>
      </g>
      {mood === "playful" ? <><path d="M36 43q4-4 8 0" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/><circle cx="58" cy="42" r="2.5" fill="#16392B"/><path d="M42 56q8 7 16-1" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/></>
        : mood === "sassy" ? <><circle cx="39" cy="44" r="2.5" fill="#16392B"/><circle cx="58" cy="44" r="2.5" fill="#16392B"/><path d="m34 36 10 2M54 38l10-4M43 58q7-4 13 0" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/></>
        : mood === "spicy" ? <><circle cx="39" cy="44" r="2.5" fill="#16392B"/><circle cx="58" cy="44" r="2.5" fill="#16392B"/><path d="M35 36h9M54 36h9M43 57h12" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/></>
        : mood === "asleep" ? <><path d="m34 43 8 2M55 45l8-2M44 57q5 3 10 0" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/></>
        : mood === "proud" ? <><path d="M34 42q4-5 8 0M55 42q4-5 8 0M38 53q11 14 22 0Z" fill="#F4E9D8" stroke="#16392B" strokeWidth="2"/></>
        : <><circle cx="39" cy="43" r="2.5" fill="#16392B"/><circle cx="58" cy="43" r="2.5" fill="#16392B"/><path d="M41 55q8 7 16 0" fill="none" stroke="#16392B" strokeWidth="3" strokeLinecap="round"/></>}
    </svg>
  );
}

function Button({ children, variant = "primary", icon, onClick }: { children: ReactNode; variant?: "primary" | "secondary"; icon?: IconName; onClick?: () => void }) {
  return <button className={`btn btn-${variant}`} onClick={onClick}>{icon && <Icon name={icon} size={18}/>}<span>{children}</span></button>;
}

function Chip({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button className={`chip ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}

function ChatBubble({ children, mood = "mild", compact = false }: { children: ReactNode; mood?: SpikeMood; compact?: boolean }) {
  return <div className={`chat ${compact ? "compact" : ""}`}><Spike mood={mood} size={compact ? 54 : 76}/><div className="bubble">{children}</div></div>;
}

function Phone({ name, children, noisy = false }: { name: string; children: ReactNode; noisy?: boolean }) {
  return <section className="frame-wrap"><div className="frame-label">{name}</div><div className={`phone ${noisy ? "noisy-phone" : ""}`}><div className="speaker"/>{children}</div></section>;
}

function TopBar({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="topbar"><div className="brand-mark" aria-label="Touch Grass"><svg viewBox="0 0 120 120" role="img"><rect width="120" height="120" rx="28" fill="#1F4D3A"/><circle cx="60" cy="56" r="31" fill="#B94A33"/><g fill="none" stroke="#F4E9D8" strokeLinecap="round" strokeLinejoin="round"><path d="M60 90V30" strokeWidth="15"/><path d="M60 76H46Q40 76 40 70V56" strokeWidth="10"/><path d="M60 62H74Q80 62 80 56V42" strokeWidth="10"/><path d="M36 97H84" strokeWidth="6"/></g><circle cx="80" cy="33" r="4" fill="#E3A345"/></svg></div><div className="top-title">{title}</div>{action || <div className="top-action"/>}</div>;
}

function TabBar({ active = "home" }: { active?: "home" | "todos" | "settings" }) {
  return <nav className="tabbar" aria-label="Main navigation">
    <button className={active === "home" ? "selected" : ""}><Icon name="home"/><span>Home</span></button>
    <button className={active === "todos" ? "selected" : ""}><Icon name="check"/><span>To-dos</span></button>
    <button className={active === "settings" ? "selected" : ""}><Icon name="settings"/><span>Settings</span></button>
  </nav>;
}

function Onboarding() {
  const interests = ["Reading", "Cooking", "Fitness", "Music", "Outdoors", "Art", "Gaming"];
  const [selected, setSelected] = useState(["Reading", "Cooking", "Outdoors"]);
  const [spice, setSpice] = useState(2);
  const moods: SpikeMood[] = ["mild", "playful", "sassy", "spicy"];
  return <Phone name="01 · ONBOARDING"><main className="screen onboarding">
    <div className="mini-logo">TOUCH GRASS</div>
    <ChatBubble mood={moods[spice - 1]}>I’m Spike. I’ll lovingly roast you off your feed and back into your life.</ChatBubble>
    <div className="section-heading"><span>What are you into?</span><small>Pick a few. I’m not psychic.</small></div>
    <div className="chips">{interests.map(i => <Chip key={i} active={selected.includes(i)} onClick={() => setSelected(v => v.includes(i) ? v.filter(x => x !== i) : [...v, i])}>{i}</Chip>)}</div>
    <div className="spice-card">
      <div className="row-between"><div><strong>Burn Spice Level</strong><small>{["Mild", "Playful", "Sassy", "Extra spicy"][spice - 1]}</small></div><div className="peppers" aria-label={`${spice} out of 4 peppers`}>{[1,2,3,4].map(n => <span className={n <= spice ? "hot" : ""} key={n}>●</span>)}</div></div>
      <input aria-label="Chirp spice" type="range" min="1" max="4" value={spice} onChange={e => setSpice(Number(e.target.value))}/>
      <div className="slider-labels"><span>nice-ish</span><span>no mercy*</span></div>
    </div>
    <div className="defaults"><span>Default suggestions</span><div className="chips"><Chip active>Free only</Chip><Chip active>Stay nearby</Chip><Chip active>≤ 1 hour</Chip></div></div>
    <Button>Let’s go</Button>
  </main></Phone>;
}

const initialTodos = [
  { text: "Schedule dentist appointment", note: "3 weeks overdue", overdue: true },
  { text: "Read 20 pages" },
  { text: "Call mom" },
  { text: "Finish stats assignment" },
];

function TaskRow({ text, note, overdue }: { text: string; note?: string; overdue?: boolean }) {
  const [done, setDone] = useState(false);
  return <button className={`task-row ${done ? "done" : ""}`} onClick={() => setDone(!done)}>
    <span className="checkbox">{done && <Icon name="check" size={15}/>}</span>
    <span className="task-copy"><strong>{text}</strong>{note && <small>{note}</small>}</span>
    {overdue && <span className="overdue">OVERDUE</span>}
  </button>;
}

function Home() {
  return <Phone name="02 · HOME"><main className="screen home-screen">
    <TopBar title="Home" action={<button className="avatar">JD</button>}/>
    <div className="greeting"><p>HEY, JORDAN</p><h1>Ready to do literally<br/>anything else?</h1></div>
    <div className="scroll-stat"><div><span>Scrolled today</span><strong>1h 47m</strong></div><div className="mini-bars"><i/><i/><i/><i/><i/></div><small>That’s almost a whole movie. A bad one.</small></div>
    <div className="todo-title"><h2>Today’s tiny victories</h2><span>0/4</span></div>
    <div className="tasks">{initialTodos.map(t => <TaskRow key={t.text} {...t}/>)}</div>
    <ChatBubble mood="playful" compact>Four tasks. Very achievable. Suspiciously achievable.</ChatBubble>
    <Button icon="play">Start scroll session</Button>
    <TabBar/>
  </main></Phone>;
}

function FakeFeed({ overlay }: { overlay?: ReactNode }) {
  return <Phone name="03 · SCROLL SIMULATOR" noisy><main className="feed-screen">
    <div className="feed-head"><select aria-label="Content type" defaultValue="cooking"><option value="cooking">Cooking feed</option><option value="gym">Gym feed</option><option value="gaming">Gaming feed</option></select><div className="timer"><span>SESSION</span><strong>14:38</strong></div></div>
    <div className="stories">{["OMG", "EASY", "TREND", "WOW"].map((x,i) => <div key={x} className={`story s${i}`}><span>{x}</span></div>)}</div>
    <div className="feed-tile tile-one"><div className="video-label">PASTA<br/><b>HACK</b></div><div className="creator">@panqueen · Follow</div><div className="feed-actions"><span><Icon name="heart"/>28.4K</span><span><Icon name="message"/>436</span><span><Icon name="bookmark"/></span></div></div>
    <div className="feed-tile tile-two"><div className="gym-copy">ONE MOVE<br/><em>for instant abs*</em></div><div className="creator">@maxrepzz · #fitcheck</div><div className="feed-actions"><span><Icon name="heart"/>92K</span><span><Icon name="message"/>1,204</span></div></div>
    <div className="fake-nav"><span>⌂</span><span>⌕</span><b>＋</b><span>♬</span><span>●</span></div>
    {overlay}
  </main></Phone>;
}

function ChirpActions() {
  return <div className="chirp-actions"><Button>Fine, what should I do?</Button><Button variant="secondary">Snooze 30 min</Button></div>;
}

function ChirpBanner() {
  return <Phone name="04 · 20 MIN CHIRP" noisy><main className="feed-screen banner-state">
    <div className="feed-head"><span className="feed-word">FOR YOU</span><div className="timer"><span>SESSION</span><strong>20:00</strong></div></div>
    <div className="feed-tile tile-three"><div className="video-label">CRISPY<br/><b>NOODLES</b></div><div className="creator">@weekdaybites</div></div>
    <div className="feed-tile tile-two"><div className="gym-copy">DO THIS<br/>EVERY DAY</div></div>
    <div className="chirp-banner"><ChatBubble mood="playful" compact>20 minutes. Your thumb has really put in a shift.</ChatBubble><ChirpActions/></div>
  </main></Phone>;
}

function ChirpSheet() {
  return <Phone name="05 · 40 MIN CHIRP" noisy><main className="feed-screen sheet-state">
    <div className="feed-head"><span className="feed-word">FOR YOU</span><div className="timer"><span>SESSION</span><strong>40:00</strong></div></div>
    <div className="feed-tile tile-one"><div className="video-label">DINNER<br/><b>IN 10</b></div></div>
    <div className="dim"/>
    <div className="half-sheet"><div className="handle"/><div className="sheet-spike"><Spike mood="sassy" size={104}/></div><div className="bubble standalone">40 minutes of cooking videos and zero meals made. Bold strategy.</div><ChirpActions/></div>
  </main></Phone>;
}

function ChirpTakeover() {
  return <Phone name="06 · 60 MIN TAKEOVER"><main className="screen takeover">
    <div className="takeover-top"><span>INTERVENTION</span><strong>60:00</strong></div>
    <div className="sunburst"/><div className="big-spike"><Spike mood="spicy" size={184}/></div>
    <div className="bubble takeover-bubble">An hour of watching strangers live their lives. Should we try yours?</div>
    <p className="aside-copy">I say this with love and several tiny spines.</p>
    <ChirpActions/>
  </main></Phone>;
}

const activities = [
  { num: "01", tag: "QUICK WIN", title: "Make the pasta you’ve been watching", time: "35 min", step: "Put a pot of water on the stove. That’s it. Momentum unlocked.", tone: "sage" },
  { num: "02", tag: "NOVELTY", title: "Walk to a street you’ve never taken", time: "25 min", step: "Shoes on. Pick the first left you normally ignore.", tone: "cream" },
  { num: "03", tag: "SOCIAL", title: "Call Mom while you walk", time: "20 min", step: "Send “Got 20 mins?” before your brain invents an excuse.", tone: "mint" },
];

function ActivityCard({ activity }: { activity: typeof activities[number] }) {
  return <article className={`activity-card ${activity.tone}`}><div className="activity-top"><span>{activity.num}</span><b>{activity.tag}</b></div><h2>{activity.title}</h2><div className="activity-meta"><Icon name="clock" size={18}/>{activity.time}<span>•</span><Icon name="map" size={18}/>Nearby</div><div className="starter"><span>5-MINUTE STARTER STEP</span><p>{activity.step}</p></div></article>;
}

function Activities() {
  const [active, setActive] = useState(0);
  return <Phone name="07 · ACTIVITY CARDS"><main className="screen activity-screen">
    <TopBar title="Escape plan"/>
    <div className="activity-intro"><p>Three better ideas</p><h1>Pick your antidote.</h1></div>
    <div className="chips filter-chips"><Chip active>Free</Chip><Chip active>Nearby</Chip><Chip active>≤ 1 hour</Chip></div>
    <div className="card-stack" onClick={() => setActive((active + 1) % 3)}>
      {[2,1,0].map((offset) => { const index = (active + offset) % 3; return <div className={`stack-pos pos-${offset}`} key={`${active}-${offset}`}><ActivityCard activity={activities[index]}/></div>; })}
    </div>
    <div className="swipe-hint"><span>←</span> Swipe to browse <span>→</span></div>
    <div className="dual-actions"><Button variant="secondary" icon="refresh">Reroll</Button><Button icon="play">Start</Button></div>
  </main></Phone>;
}

function Reward() {
  return <Phone name="08 · DOPAMINE RECEIPT"><main className="screen reward-screen">
    <div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/>
    <Spike mood="proud" size={142}/>
    <h1>Okay, look at you.</h1><p className="praise">Out here having a life and everything.</p>
    <div className="receipt">
      <div className="receipt-brand">TOUCH GRASS</div><div className="receipt-sub">DOPAMINE RECEIPT</div>
      <div className="dash"/>
      <div className="receipt-row"><span>TIME RECLAIMED</span><strong>42 MIN</strong></div>
      <div className="receipt-row tall"><span>ACTIVITY</span><strong>MADE A REAL<br/>PASTA DINNER</strong></div>
      <div className="receipt-row"><span>TASKS DONE</span><strong>2</strong></div>
      <div className="dash"/>
      <div className="receipt-total"><span>REAL-LIFE XP</span><strong>+120</strong></div>
      <div className="receipt-foot">NO INFINITE SCROLL REQUIRED<br/>THANK YOU FOR TOUCHING GRASS</div>
    </div>
    <Button>Done</Button>
  </main></Phone>;
}

export default function App() {
  return <div className="app-shell">
    <header className="showcase-header"><div><span className="eyebrow">PRODUCT FLOW · MOBILE 390 × 844</span><h1>Touch Grass</h1></div><p>Your screen-time intervention,<br/>delivered with love and tiny spines.</p></header>
    <div className="phone-grid">
      <Onboarding/>
      <Home/>
      <FakeFeed/>
      <ChirpBanner/>
      <ChirpSheet/>
      <ChirpTakeover/>
      <Activities/>
      <Reward/>
    </div>
  </div>;
}
