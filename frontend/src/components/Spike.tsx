export type SpikeMood = "mild" | "playful" | "sassy" | "spicy" | "proud" | "asleep";

export default function Spike({ mood = "mild", size = 92 }: { mood?: SpikeMood; size?: number }) {
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
