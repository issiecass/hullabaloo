import Button from "../components/Button";
import ChatBubble from "../components/ChatBubble";
import TabBar from "../components/TabBar";
import TaskRow from "../components/TaskRow";
import TopBar from "../components/TopBar";
import { initialTodos } from "../data";

export default function Home({ onStartSession }: { onStartSession?: () => void }) {
  return <main className="screen home-screen">
    <TopBar title="Home" action={<button className="avatar">JD</button>}/>
    <div className="home-scroll">
      <div className="greeting"><p>HEY, JORDAN</p><h1>Ready to do literally<br/>anything else?</h1></div>
      <div className="scroll-stat"><div><span>Scrolled today</span><strong>1h 47m</strong></div><div className="mini-bars"><i/><i/><i/><i/><i/></div><small>That’s almost a whole movie. A bad one.</small></div>
      <div className="todo-title"><h2>Today’s tiny victories</h2><span>0/4</span></div>
      <div className="tasks">{initialTodos.map(t => <TaskRow key={t.text} {...t}/>)}</div>
      <ChatBubble mood="playful" compact>Four tasks. Very achievable. Suspiciously achievable.</ChatBubble>
      <Button icon="play" onClick={onStartSession}>Start scroll session</Button>
    </div>
    <TabBar/>
  </main>;
}
