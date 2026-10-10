import { useEffect, useState, type ReactNode } from "react";
import Phone from "./components/Phone";
import Gallery from "./Gallery";
import Activities from "./screens/Activities";
import ChirpBanner from "./screens/ChirpBanner";
import ChirpSheet from "./screens/ChirpSheet";
import ChirpTakeover from "./screens/ChirpTakeover";
import FakeFeed from "./screens/FakeFeed";
import Home from "./screens/Home";
import Onboarding from "./screens/Onboarding";
import Reward from "./screens/Reward";

type ScreenName = "onboarding" | "home" | "feed" | "banner" | "sheet" | "takeover" | "activities" | "reward";

// Demo pacing: how long the feed shows before the first chirp fires.
const FEED_TO_CHIRP_MS = 4000;

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("onboarding");

  useEffect(() => {
    if (screen !== "feed") return;
    const id = setTimeout(() => setScreen("banner"), FEED_TO_CHIRP_MS);
    return () => clearTimeout(id);
  }, [screen]);

  // The original all-screens design overview lives at /#gallery.
  if (window.location.hash === "#gallery") return <Gallery/>;

  const toActivities = () => setScreen("activities");
  // Snoozing jumps straight to the next escalation tier so the demo doesn't have to wait.
  const screens: Record<ScreenName, ReactNode> = {
    onboarding: <Onboarding onDone={() => setScreen("home")}/>,
    home: <Home onStartSession={() => setScreen("feed")}/>,
    feed: <FakeFeed/>,
    banner: <ChirpBanner onAccept={toActivities} onSnooze={() => setScreen("sheet")}/>,
    sheet: <ChirpSheet onAccept={toActivities} onSnooze={() => setScreen("takeover")}/>,
    takeover: <ChirpTakeover onAccept={toActivities} onSnooze={() => setScreen("home")}/>,
    activities: <Activities onStart={() => setScreen("reward")}/>,
    reward: <Reward onDone={() => setScreen("home")}/>,
  };
  const noisy = screen === "feed" || screen === "banner" || screen === "sheet";

  return <div className="app-shell single"><Phone noisy={noisy}>{screens[screen]}</Phone></div>;
}
