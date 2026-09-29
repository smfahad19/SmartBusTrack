import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Route, Navigation } from 'lucide-react';
import { api } from '../../api';
import StopTimeline from '../../components/StopTimeline';
import { parseList } from '../../transportUtils';
export default function BusList() {
  const [routes,setRoutes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const navigate=useNavigate();
  useEffect(()=>{let active=true;api.get('/routes').then(r=>{if(active)setRoutes(r.data);}).catch(()=>{if(active)setError('Unable to load routes. Please refresh to try again.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
  return <div className="tracking-page"><header className="tracking-heading"><div><span className="eyebrow">PLAN YOUR JOURNEY</span><h1>Routes & schedules</h1><p>Explore your institute's bus routes and scheduled stops.</p></div></header>
    {error&&<div className="error-notice" role="alert">{error}</div>}
    {loading?<div className="tracking-empty" role="status">Loading schedules...</div>:!routes.length?<div className="tracking-empty"><Route size={30}/><h2>No routes available</h2><p>Your institute admin will publish schedules here.</p></div>:<div className="schedule-grid">{routes.map((route,index)=><article className="schedule-card" key={route.id+'-'+(route.bus_id||index)}><header><span className="mini-icon"><Route size={21}/></span><div><h2>{route.name}</h2><p>{parseList(route.stops).length} stops</p></div></header><div className="schedule-assignment"><Bus size={18}/><div><strong>{route.bus_name||'No bus assigned'}</strong><small>{route.bus_plate||'Plate unavailable'} | {route.driver_name||'Driver unassigned'}</small></div></div><StopTimeline stops={parseList(route.stops)} etas={parseList(route.etas)}/><button className="secondary-button" disabled={!route.bus_id} onClick={()=>{sessionStorage.setItem('trackBusId',String(route.bus_id));navigate('/student');}}><Navigation size={16}/>Track this route</button></article>)}</div>}
  </div>;
}
