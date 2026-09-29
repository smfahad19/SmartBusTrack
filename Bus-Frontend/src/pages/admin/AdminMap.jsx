import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bus, MapPin, Radio, RefreshCw, Route, Search, Users } from 'lucide-react';
import { api, connectSocket } from '../../api';
import PageToolbar from '../../components/PageToolbar';
import TrackingMap from '../../components/TrackingMap';
import { coordinates, formatTime } from '../../transportUtils';

export default function AdminMap() {
  const [buses,setBuses]=useState([]);
  const [routes,setRoutes]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [connected,setConnected]=useState(false);
  const [search,setSearch]=useState('');
  const user=JSON.parse(localStorage.getItem('user')||'null');
  const load=useCallback(async()=>{
    try {
      const [{data},{data:routeData}]=await Promise.all([api.get('/buses'),api.get('/routes')]);setBuses(data);setRoutes(routeData);
      setSelectedId(previous=>data.some(bus=>bus.id===previous)?previous:null);setError('');
    } catch(err){setError(err.response?.data?.error||'Unable to load fleet locations.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{
    let active=true;load();const socket=connectSocket();
    socket.on('connect',()=>{if(active){setConnected(true);load();}});
    socket.on('disconnect',()=>setConnected(false));socket.on('busUpdated',load);
    socket.on('locationUpdate',data=>{const point=coordinates(data);if(!point)return;setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,lat:point[0],lng:point[1]}:bus));});
    socket.on('statusUpdate',data=>setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,status:String(data.status||'')}:bus)));
    socket.on('stopUpdate',data=>setBuses(previous=>previous.map(bus=>bus.id===Number(data.id)?{...bus,current_stop:data.current_stop}:bus)));
    return()=>{active=false;socket.disconnect();};
  },[load]);
  const filtered=useMemo(()=>{const query=search.trim().toLowerCase();return query?buses.filter(bus=>[bus.name,bus.number_plate,bus.driver_name,bus.institute_name,bus.route].some(value=>String(value||'').toLowerCase().includes(query))):buses;},[buses,search]);
  const located=filtered.filter(bus=>coordinates(bus)).length;
  const selectedBus=filtered.find(bus=>bus.id===selectedId);
  const selectedRoute=routes.find(route=>route.id===selectedBus?.route_id)||routes.find(route=>route.name===selectedBus?.route&&route.institute_id===selectedBus?.institute_id);
  const mapBuses=selectedBus?[selectedBus]:filtered;
  return <div className="management-page admin-map-page">
    <header className="management-heading"><div><span className="eyebrow">LIVE FLEET OPERATIONS</span><h1>Fleet map view</h1><p>{user?.role==='superadmin'?'Monitor buses across all institutes or select one institute below.':'Monitor every bus and driver in your institute from one live map.'}</p></div><span className={'connection-pill '+(connected?'connected':'')}><Radio size={15}/>{connected?'Live updates':'Reconnecting...'}</span></header>
    <PageToolbar search={<label className="toolbar-search-label">Search fleet<div className="map-search"><Search size={16}/><input value={search} onChange={event=>{setSearch(event.target.value);setSelectedId(null);}} placeholder="Bus, plate, driver or route"/></div></label>}>{selectedBus&&<button className="secondary-button" onClick={()=>setSelectedId(null)}><Bus size={16}/>Show all buses</button>}</PageToolbar>
    <div className="map-summary"><span><Bus size={18}/><strong>{filtered.length}</strong>Total buses</span><span className="located"><MapPin size={18}/><strong>{located}</strong>Reporting location</span><span className="waiting"><Radio size={18}/><strong>{filtered.length-located}</strong>Waiting for GPS</span></div>
    {error&&<div className="error-notice" role="alert">{error}<button className="secondary-button" onClick={load}><RefreshCw size={15}/>Retry</button></div>}
    {loading?<div className="tracking-empty" role="status">Loading fleet map...</div>:<div className="tracking-layout admin-map-layout">
      <section className="tracking-bus-list" aria-label="Fleet buses">{!filtered.length?<div className="tracking-empty"><Bus size={30}/><h2>No buses found</h2><p>Change the institute filter or search term.</p></div>:filtered.map(bus=>{const selected=bus.id===selectedId;return <article className={'tracking-bus-card admin-map-bus '+(selected?'selected':'')} key={bus.id}>
        <button className="bus-select-button" aria-pressed={selected} onClick={()=>setSelectedId(current=>current===bus.id?null:bus.id)}><span className="mini-icon"><Bus size={21}/></span><span><strong>{bus.name}</strong><small>{[bus.number_plate,bus.institute_name].filter(Boolean).join(' · ')}</small></span><span className={'gps-dot '+(coordinates(bus)?'online':'')} aria-label={coordinates(bus)?'Location available':'Waiting for location'}/></button>
        <div className="admin-map-bus-meta"><span><Users size={13}/>{bus.driver_name||'Driver unassigned'}</span><span><Route size={13}/>{bus.route||'Route unassigned'}</span><span><Radio size={13}/>{bus.status||'No status'}</span>{bus.departure_time&&<span>{formatTime(bus.departure_time)}</span>}</div>
      </article>})}</section>
      <div className="tracking-map-column"><TrackingMap buses={mapBuses} selectedId={selectedBus?.id||null} onSelect={setSelectedId} fitAll title={selectedBus?`${selectedBus.name} route stops`:'All fleet locations'} route={selectedRoute}/></div>
    </div>}
  </div>;
}
