import Phone from "./components/Phone";
import Activities from "./screens/Activities";
import Home from "./screens/Home";
import Interrupt from "./screens/Interrupt";
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
      <Phone name="03 · TIME’S UP"><Interrupt chirp="Out of scrolling time, and “Schedule dentist appointment” remains untouched. Bold strategy."/></Phone>
      <Phone name="04 · ACTIVITY CARDS"><Activities/></Phone>
      <Phone name="05 · DOPAMINE RECEIPT"><Reward/></Phone>
      <Phone name="06 · TO-DOS"><Todos/></Phone>
      <Phone name="07 · SETTINGS"><Settings/></Phone>
    </div>
  </div>;
}