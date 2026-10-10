import type { Activity } from "../data";
import Icon from "./Icon";

export default function ActivityCard({ activity }: { activity: Activity }) {
  return <article className={`activity-card ${activity.tone}`}><div className="activity-top"><span>{activity.num}</span><b>{activity.tag}</b></div><h2>{activity.title}</h2><div className="activity-meta"><Icon name="clock" size={18}/>{activity.time}<span>•</span><Icon name="map" size={18}/>Nearby</div><div className="starter"><span>5-MINUTE STARTER STEP</span><p>{activity.step}</p></div></article>;
}
