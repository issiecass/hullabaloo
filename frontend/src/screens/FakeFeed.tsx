import type { ReactNode } from "react";
import Icon from "../components/Icon";

export default function FakeFeed({ overlay }: { overlay?: ReactNode }) {
  return <main className="feed-screen">
    <div className="feed-head"><select aria-label="Content type" defaultValue="cooking"><option value="cooking">Cooking feed</option><option value="gym">Gym feed</option><option value="gaming">Gaming feed</option></select><div className="timer"><span>SESSION</span><strong>14:38</strong></div></div>
    <div className="stories">{["OMG", "EASY", "TREND", "WOW"].map((x,i) => <div key={x} className={`story s${i}`}><span>{x}</span></div>)}</div>
    <div className="feed-tile tile-one"><div className="video-label">PASTA<br/><b>HACK</b></div><div className="creator">@panqueen · Follow</div><div className="feed-actions"><span><Icon name="heart"/>28.4K</span><span><Icon name="message"/>436</span><span><Icon name="bookmark"/></span></div></div>
    <div className="feed-tile tile-two"><div className="gym-copy">ONE MOVE<br/><em>for instant abs*</em></div><div className="creator">@maxrepzz · #fitcheck</div><div className="feed-actions"><span><Icon name="heart"/>92K</span><span><Icon name="message"/>1,204</span></div></div>
    <div className="fake-nav"><span>⌂</span><span>⌕</span><b>＋</b><span>♬</span><span>●</span></div>
    {overlay}
  </main>;
}
