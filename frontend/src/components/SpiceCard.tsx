export default function SpiceCard({ spice, onChange }: { spice: number; onChange?: (spice: number) => void }) {
  return <div className="spice-card">
    <div className="row-between"><div><strong>Burn Spice Level</strong><small>{["Mild", "Playful", "Sassy", "Extra spicy"][spice - 1]}</small></div><div className="peppers" aria-label={`${spice} out of 4 peppers`}>{[1,2,3,4].map(n => <span className={n <= spice ? "hot" : ""} key={n}>●</span>)}</div></div>
    <input aria-label="Chirp spice" type="range" min="1" max="4" value={spice} onChange={e => onChange?.(Number(e.target.value))}/>
    <div className="slider-labels"><span>nice-ish</span><span>no mercy*</span></div>
  </div>;
}
