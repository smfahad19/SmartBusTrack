export default function StopTimeline({ stops, etas, activeIndex = -1 }) {
  if (!stops.length) return <p className="empty-state">No stops have been configured for this route.</p>;
  return <ol className="stop-timeline">{stops.map((stop,index)=><li key={index} className={index===activeIndex?'current':index<activeIndex?'completed':''} aria-current={index===activeIndex?'step':undefined}><span className="stop-number">{index+1}</span><div><strong>{stop}</strong><small>{etas[index]||'Time not set'}</small></div></li>)}</ol>;
}
