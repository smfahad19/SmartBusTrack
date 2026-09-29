import { useCallback, useEffect, useRef, useState } from 'react';
import { Bus, Radio, Navigation, Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../api';
import TrackingMap from '../../components/TrackingMap';
import StopTimeline from '../../components/StopTimeline';
import { coordinates, parseList, formatSeconds, routeStopPoints } from '../../transportUtils';
export default function DriverDashboard() {
  const [bus,setBus]=useState(null);
  const [route,setRoute]=useState(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [sharing,setSharing]=useState('');
  const [history,setHistory]=useState([]);
  const [stopIndex,setStopIndex]=useState(0);
  const [atStop,setAtStop]=useState(false);
  const [remaining,setRemaining]=useState(0);
  const [complete,setComplete]=useState(false);
  const [busy,setBusy]=useState(false);
  const watch=useRef(null),simulation=useRef(null);
  const user=JSON.parse(localStorage.getItem('user'));
  const load=useCallback(async()=>{
    try{
      const b=(await api.get('/buses/my-bus')).data;setBus(b);
      const routes=(await api.get('/routes')).data;
      const r=routes.find(item=>item.id===b.route_id)||routes.find(item=>item.name===b.route);setRoute(r||null);
      const stops=parseList(r?.stops),idx=stops.indexOf(b.current_stop);
      const arrived=String(b.status).startsWith('Arrived');
      setAtStop(arrived);setStopIndex(Math.max(0,Math.min(stops.length-1,idx+(String(b.status).startsWith('Moving')?1:0))));setComplete(b.status==='Journey Completed');setError('');
    }catch(err){setError(err.response?.data?.error||'Unable to load your assigned bus.');}
    finally{setLoading(false);}
  },[]);
  // Fetch initial server data; state updates happen after the asynchronous request.
  useEffect(()=>{load();},[load]);
  useEffect(()=>()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);if(simulation.current!==null)clearInterval(simulation.current);},[]);
  useEffect(()=>{if(!atStop)return;const timer=setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>clearInterval(timer);},[atStop]);
  const stopSharing=()=>{
    if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);
    if(simulation.current!==null)clearInterval(simulation.current);
    watch.current=null;simulation.current=null;setSharing('');
  };
  const sendPosition=async point=>{
    try{await api.put('/buses/'+bus.id+'/location',{lat:point[0],lng:point[1]});setBus(previous=>({...previous,lat:point[0],lng:point[1]}));setHistory(previous=>[...previous,point].slice(-200));}
    catch(err){stopSharing();toast.error(err.response?.data?.error||'Location update failed. Sharing stopped.');}
  };
  const startSharing=()=>{
    if(!navigator.geolocation){toast.error('This browser does not support location sharing.');return;}
    if(!window.isSecureContext){toast.error('Mobile GPS requires an HTTPS address. Open the app through a secure tunnel, then try again.');return;}
    stopSharing();setSharing('gps');
    watch.current=navigator.geolocation.watchPosition(position=>sendPosition([position.coords.latitude,position.coords.longitude]),()=>{stopSharing();toast.error('Location unavailable. Allow location access and try again.');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  };
  const simulate=()=>{
    stopSharing();setSharing('demo');
    const routePoints=routeStopPoints(route).map(point=>[point.lat,point.lng]);
    if(!routePoints.length){setSharing('');toast.error('Add stop locations to this route before running simulation.');return;}
    const path=[coordinates(bus),...routePoints.slice(stopIndex)].filter(Boolean);let segment=0,step=0;
    if(path.length===1){sendPosition(path[0]);stopSharing();return;}
    simulation.current=setInterval(()=>{
      step++;const start=path[segment],end=path[segment+1],progress=step/10;
      sendPosition([start[0]+(end[0]-start[0])*progress,start[1]+(end[1]-start[1])*progress]);
      if(step>=10){segment++;step=0;if(segment>=path.length-1)stopSharing();}
    },1000);
  };
  const stops=parseList(route?.stops),etas=parseList(route?.etas);
  const stopPoints=routeStopPoints(route);
  const routeMapped=stops.length>0&&stopPoints.length===stops.length;
  const arrive=async()=>{
    if(!stops[stopIndex])return;
    setBusy(true);
    try{
      const stop=stops[stopIndex],status='Arrived at '+stop;
      const response=await api.put('/buses/'+bus.id+'/stop',{stopName:stop}),point=response.data.location||stopPoints.find(item=>item.index===stopIndex);
      await api.put('/buses/'+bus.id+'/status',{status});
      setBus(previous=>({...previous,current_stop:stop,status,...(point?{lat:point.lat,lng:point.lng}:{})}));
      if(point)setHistory(previous=>[...previous,[point.lat,point.lng]].slice(-200));
      setAtStop(true);setRemaining(180);
    }catch(err){toast.error(err.response?.data?.error||'Unable to mark arrival.');}finally{setBusy(false);}
  };
  const proceed=async()=>{
    setBusy(true);
    try{
      const last=stopIndex===stops.length-1,status=last?'Journey Completed':'Moving toward '+stops[stopIndex+1];
      await api.put('/buses/'+bus.id+'/status',{status});setBus(previous=>({...previous,status}));setAtStop(false);setRemaining(0);
      if(last){setComplete(true);stopSharing();}else setStopIndex(i=>i+1);
    }catch(err){toast.error(err.response?.data?.error||'Unable to update journey.');}finally{setBusy(false);}
  };
  const reset=async()=>{
    setBusy(true);
    try{await api.put('/buses/'+bus.id+'/reset',{});setBus(previous=>({...previous,status:'On time',current_stop:null}));setComplete(false);setStopIndex(0);setAtStop(false);setRemaining(0);setHistory([]);}
    catch(err){toast.error(err.response?.data?.error||'Unable to reset trip.');}finally{setBusy(false);}
  };
  const reportDelay=async()=>{
    setBusy(true);
    try{await api.put('/buses/'+bus.id+'/status',{status:'Delayed due to traffic'});setBus(previous=>({...previous,status:'Delayed due to traffic'}));toast.success('Delay reported to students.');}
    catch(err){toast.error(err.response?.data?.error||'Unable to report delay.');}finally{setBusy(false);}
  };
  if(loading)return <div className="tracking-empty" role="status">Loading your journey...</div>;
  if(!bus)return <div className="tracking-empty"><Bus size={34}/><h1>No bus assigned</h1><p>{error||'Contact your institute admin to assign a bus and route.'}</p><button className="secondary-button" onClick={load}>Check again</button></div>;
  return <div className="tracking-page driver-tracking">
    <header className="tracking-heading"><div><span className="eyebrow">{user?.institute_name||'DRIVER WORKSPACE'}</span><h1>My journey</h1><p>{bus.name} / {bus.number_plate}</p></div><div className="tracking-actions"><button className="secondary-button" disabled={!!sharing||complete} onClick={simulate}>Simulate route</button>{sharing?<button className="primary-button" onClick={stopSharing}>Stop sharing</button>:<button className="primary-button" disabled={complete} onClick={startSharing}><Radio size={16}/>Share location</button>}</div></header>
    {error&&<div className="error-notice" role="alert">{error}</div>}
    {!routeMapped&&<div className="error-notice" role="status">This route has {stopPoints.length} of {stops.length} stop locations mapped. Live mobile GPS sharing still works; mapping is only required for the route line, stop markers, simulation, and Mark arrival.</div>}
    <div className="journey-status"><span className={'connection-pill '+(sharing?'connected':'')}><Radio size={15}/>{sharing==='demo'?'Simulation running':sharing?'Sharing GPS location':'Location sharing off'}</span><span>{bus.status}</span></div>
    {complete&&<section className="journey-complete"><Flag size={30}/><div><h2>Journey complete</h2><p>You have reached the final stop. Start a new trip when ready.</p></div><button className="primary-button" disabled={busy} onClick={reset}>Start new journey</button></section>}
    <div className="tracking-layout"><section className="driver-route-panel"><header><span className="eyebrow">{atStop?'AT CURRENT STOP':'NEXT STOP'}</span><h2>{complete?'Trip completed':stops[stopIndex]||'Route not assigned'}</h2><p>{route?.name||'Ask your institute admin to assign a route with stops.'}</p></header><StopTimeline stops={stops} etas={etas} activeIndex={complete?stops.length:stopIndex}/>
      <div className="driver-route-actions">{atStop&&<div className="stop-countdown">Stop wait<strong>{formatSeconds(remaining)}</strong></div>}
      <button className="primary-button" disabled={busy||!routeMapped||complete} onClick={atStop?proceed:arrive}><Navigation size={16}/>{atStop?(stopIndex===stops.length-1?'Finish journey':'Proceed to next stop'):'Mark arrival'}</button>
      <button className="secondary-button" disabled={busy||complete} onClick={reportDelay}><AlertTriangle size={16}/>Report traffic delay</button></div>
    </section><div className="tracking-map-column"><TrackingMap buses={[{...bus,history}]} selectedId={bus.id} route={route}/></div></div>
  </div>;
}
