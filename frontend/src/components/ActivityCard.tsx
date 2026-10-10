import { formatMinutes, type Activity } from "../data";
import Icon from "./Icon";

const tones = ["sage", "cream", "mint"];

export default function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return <article className={`activity-card ${tones[index % tones.length]}`}><div className="activity-top"><span>{String(index + 1).padStart(2, "0")}</span><b>{activity.tag}</b></div><h2>{activity.title}</h2><div className="activity-meta"><Icon name="clock" size={18}/>{formatMinutes(activity.minutes)}<span>•</span><Icon name="map" size={18}/>{activity.nearby ? "Nearby" : "Worth the trip"}<span>•</span>{activity.free ? "Free" : "Costs a little"}</div><div className="starter"><span>5-MINUTE STARTER STEP</span><p>{activity.step}</p></div></article>;
}
