import { useCallback, useEffect, useRef, useState } from 'react';
import { Bus, Radio, Users, Bell, X, RefreshCw } from 'lucide-react';
import { api, connectSocket } from '../../api';
import TrackingMap from '../../components/TrackingMap';
import StopTimeline from '../../components/StopTimeline';
import { coordinates, parseList, formatSeconds } from '../../transportUtils';
export default function StudentDashboard() {
  const [buses,setBuses]=useState([]);
  const [routes,setRoutes]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [connected,setConnected]=useState(false);
  const [notices,setNotices]=useState([]);
  const [timers,setTimers]=useState({});
  const busRef=useRef([]);
  const user=JSON.parse(localStorage.getItem('user'));
  const load=useCallback(async()=>{
    try {
      const [b,r]=await Promise.all([api.get('/buses'),api.get('/routes')]);
      busRef.current=b.data;setBuses(b.data);setRoutes(r.data);
      const busId=sessionStorage.getItem('trackBusId');
      const target=b.data.find(bus=>bus.id===Number(busId));
      setSelectedId(previous=>target?.id || (b.data.some(bus=>bus.id===previous)?previous:b.data[0]?.id ?? null));
      if(busId)sessionStorage.removeItem('trackBusId');
      setError('');
    } catch(err){setError(err.response?.data?.error||'Unable to load your campus buses.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{
    let active=true;
    // Load the initial server snapshot before subscribing to live updates.
    load();
    const socket=connectSocket();
    const notify=message=>setNotices(previous=>[{id:crypto.randomUUID(),message},...previous].slice(0,3));
    socket.on('connect',()=>{if(active){setConnected(true);load();}});
    socket.on('disconnect',()=>setConnected(false));
    socket.on('busUpdated',load);
    socket.on('locationUpdate',data=>{
      const point=coordinates(data);if(!point)return;
      setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,lat:point[0],lng:point[1],history:[...(bus.history||[]),point].slice(-50)}:bus));
    });
    socket.on('statusUpdate',data=>{
      const status=String(data.status||'No status reported');
      setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,status}:bus));
      setTimers(previous=>({...previous,[data.id]:status.includes('Arrived')?180:0}));
      notify((busRef.current.find(bus=>bus.id===Number(data.id))?.name||'Bus')+': '+status);
    });
    socket.on('stopUpdate',data=>setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,current_stop:data.current_stop}:bus)));
    return()=>{active=false;socket.disconnect();};
  },[load]);
  useEffect(()=>{const timer=setInterval(()=>setTimers(previous=>Object.fromEntries(Object.entries(previous).map(([id,value])=>[id,Math.max(0,value-1)]))),1000);return()=>clearInterval(timer);},[]);
  const selectedBus=buses.find(bus=>bus.id===selectedId);
  const selectedRoute=routes.find(route=>route.id===selectedBus?.route_id)||routes.find(route=>route.name===selectedBus?.route);
  return <div className="tracking-page student-tracking">
    <header className="tracking-heading"><div><span className="eyebrow">{user?.institute_name||'YOUR CAMPUS'}</span><h1>Live bus tracking</h1><p>Choose your bus to see its route, stops, and last reported location.</p></div><span className={'connection-pill '+(connected?'connected':'')}><Radio size={15}/>{connected?'Connected':'Reconnecting...'}</span></header>
    {user?.access_end&&<div className="access-period-note">Your transport access: <strong>{user.access_start} to {user.access_end}</strong><span>Valid through the end date (UTC).</span></div>}
    {error&&<div className="error-notice" role="alert">{error}<button className="secondary-button" onClick={load}><RefreshCw size={15}/>Retry</button></div>}
    <div className="tracking-notices" aria-live="polite">{notices.map(n=><div key={n.id}><Bell size={17}/><span>{n.message}</span><button aria-label="Dismiss notification" onClick={()=>setNotices(previous=>previous.filter(item=>item.id!==n.id))}><X size={16}/></button></div>)}</div>
    {loading?<div className="tracking-empty" role="status">Loading campus buses...</div>:<div className="tracking-layout">
      <section className="tracking-bus-list" aria-label="Campus buses">{!buses.length?<div className="tracking-empty"><Bus size={30}/><h2>No buses available</h2><p>Your institute admin has not added any buses yet.</p></div>:buses.map(bus=>{
        const route=routes.find(r=>r.id===bus.route_id)||routes.find(r=>r.name===bus.route);
        const stops=parseList(route?.stops),etas=parseList(route?.etas),selected=bus.id===selectedId;
        return <article className={'tracking-bus-card '+(selected?'selected':'')} key={bus.id}>
          <button className="bus-select-button" onClick={()=>setSelectedId(bus.id)} aria-expanded={selected}><span className="mini-icon"><Bus size={22}/></span><span><strong>{bus.name}</strong><small>{bus.number_plate}</small></span><span className="selection-dot" aria-hidden="true"/></button>
          <div className="bus-card-details"><span className="bus-driver"><Users size={14}/>{bus.driver_name||'Driver unassigned'}</span><span className="tracking-status">{bus.status||'No status reported'}</span></div>
          {timers[bus.id]>0&&<div className="stop-countdown">Stop wait <strong>{formatSeconds(timers[bus.id])}</strong></div>}
          {selected&&<div className="bus-route-details"><h3>{route?.name||'Route not assigned'}</h3><StopTimeline stops={stops} etas={etas} activeIndex={stops.indexOf(bus.current_stop)}/></div>}
        </article>;
      })}</section>
      <div className="tracking-map-column"><TrackingMap buses={buses} selectedId={selectedId} onSelect={setSelectedId} route={selectedRoute}/></div>
    </div>}
  </div>;
}
