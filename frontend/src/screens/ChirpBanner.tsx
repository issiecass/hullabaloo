import ChatBubble from "../components/ChatBubble";
import ChirpActions, { type ChirpHandlers } from "../components/ChirpActions";

export default function ChirpBanner({ chirp = "20 minutes. Your thumb has really put in a shift.", ...handlers }: ChirpHandlers & { chirp?: string }) {
  return <main className="feed-screen banner-state">
    <div className="feed-head"><span className="feed-word">FOR YOU</span><div className="timer"><span>SESSION</span><strong>20:00</strong></div></div>
    <div className="feed-tile tile-three"><div className="video-label">CRISPY<br/><b>NOODLES</b></div><div className="creator">@weekdaybites</div></div>
    <div className="feed-tile tile-two"><div className="gym-copy">DO THIS<br/>EVERY DAY</div></div>
    <div className="chirp-banner"><ChatBubble mood="playful" compact>{chirp}</ChatBubble><ChirpActions {...handlers}/></div>
  </main>;
}
