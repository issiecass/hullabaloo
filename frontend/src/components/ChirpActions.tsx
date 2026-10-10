import Button from "./Button";

export type ChirpHandlers = { onAccept?: () => void; onSnooze?: () => void };

export default function ChirpActions({ onAccept, onSnooze }: ChirpHandlers) {
  return <div className="chirp-actions"><Button onClick={onAccept}>Fine, what should I do?</Button><Button variant="secondary" onClick={onSnooze}>Snooze 30 min</Button></div>;
}
