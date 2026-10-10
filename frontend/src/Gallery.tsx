import Phone from "./components/Phone";
import Activities from "./screens/Activities";
import ChirpBanner from "./screens/ChirpBanner";
import ChirpSheet from "./screens/ChirpSheet";
import ChirpTakeover from "./screens/ChirpTakeover";
import FakeFeed from "./screens/FakeFeed";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Onboarding from "./screens/Onboarding";
import Reward from "./screens/Reward";
import Settings from "./screens/Settings";
import Todos from "./screens/Todos";

export default function Gallery() {
  return <div className="app-shell">
    <header className="showcase-header"><div><span className="eyebrow">PRODUCT FLOW · MOBILE 390 × 844</span><h1>Touch Grass</h1></div><p>Your screen-time intervention,<br/>delivered with love and tiny spines.</p></header>
    <div className="phone-grid">
      <Phone name="00 · LOG IN"><Login/></Phone>
      <Phone name="01 · ONBOARDING"><Onboarding/></Phone>
      <Phone name="02 · HOME"><Home/></Phone>
      <Phone name="03 · SCROLL SIMULATOR" noisy><FakeFeed/></Phone>
      <Phone name="04 · 20 MIN CHIRP" noisy><ChirpBanner/></Phone>
      <Phone name="05 · 40 MIN CHIRP" noisy><ChirpSheet/></Phone>
      <Phone name="06 · 60 MIN TAKEOVER"><ChirpTakeover/></Phone>
      <Phone name="07 · ACTIVITY CARDS"><Activities/></Phone>
      <Phone name="08 · DOPAMINE RECEIPT"><Reward/></Phone>
      <Phone name="09 · TO-DOS"><Todos/></Phone>
      <Phone name="10 · SETTINGS"><Settings/></Phone>
    </div>
  </div>;
}
