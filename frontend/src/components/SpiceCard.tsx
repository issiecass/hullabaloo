import { spiceLevels } from "../data";

export function Peppers({ level }: { level: number }) {
  return <span className="spice-peppers" aria-hidden="true">{[1, 2, 3, 4].map(n => <i key={n} className={n <= level ? "hot" : ""}/>)}</span>;
}

export default function SpiceCard({ spice, onChange }: { spice: number; onChange?: (spice: number) => void }) {
  return <div className="spice-card spice-picker">
    <span className="spice-eyebrow">BURN SPICE LEVEL</span>
    <div className="spice-options" role="radiogroup" aria-label="Burn spice level">
      {spiceLevels.map((level, i) => <button type="button" key={level.name} role="radio" aria-checked={spice === i + 1} className={`spice-option ${spice === i + 1 ? "selected" : ""}`} onClick={() => onChange?.(i + 1)}>
        <span><strong>{level.name}</strong><small>{level.blurb}</small></span>
        <Peppers level={i + 1}/>
      </button>)}
    </div>
  </div>;
}
