import { useEffect, useMemo, useState } from 'react';
import { Marker, MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import { LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import L from 'leaflet';

const DEFAULT_CENTER=[31.5204,74.3587];
const markerIcon=index=>L.divIcon({
  className:'route-stop-map-pin',html:`<span>${index+1}</span>`,
  iconSize:[28,28],iconAnchor:[14,14],
});

function MapClick({onPick}) {
  useMapEvents({click:event=>onPick(event.latlng.lat,event.latlng.lng)});
  return null;
}

function FitPoints({points,focus}) {
  const map=useMap();
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      map.invalidateSize({pan:false});
      if(focus)map.setView([focus.lat,focus.lng],16,{animate:false});
      else if(points.length)map.fitBounds(points.map(point=>[point.lat,point.lng]),{padding:[35,35],maxZoom:16,animate:false});
    });
    return()=>cancelAnimationFrame(frame);
  },[map,points,focus]);
  return null;
}

export default function RouteStopPicker({stops,coordinates,onChange}) {
  const [activeIndex,setActiveIndex]=useState(0);
  const [query,setQuery]=useState('');
  const [results,setResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const [searchError,setSearchError]=useState('');
  const [focus,setFocus]=useState(null);
  const theme=useTheme();
  const points=useMemo(()=>stops.map((_,index)=>{
    const point=coordinates[index],lat=Number(point?.lat),lng=Number(point?.lng);
    return Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng,index}:null;
  }).filter(Boolean),[stops,coordinates]);
  const selectedIndex=Math.min(activeIndex,Math.max(0,stops.length-1));

  const setPoint=(index,lat,lng,shouldFocus=false)=>{
    const next=Array.from({length:stops.length},(_,itemIndex)=>coordinates[itemIndex]||null);
    next[index]={lat:Number(lat.toFixed(6)),lng:Number(lng.toFixed(6))};
    onChange(next);
    setFocus(shouldFocus?next[index]:null);
    const following=next.findIndex((point,itemIndex)=>itemIndex>index&&!point);
    if(following!==-1)setActiveIndex(following);
  };
  const useCurrentLocation=()=>navigator.geolocation?.getCurrentPosition(
    position=>setPoint(selectedIndex,position.coords.latitude,position.coords.longitude,true),
    ()=>setSearchError('Current location unavailable. Allow browser location access and try again.'),
    {enableHighAccuracy:true,timeout:10000}
  );
  const configuredTileUrl=import.meta.env.VITE_OSM_TILE_URL;
  const tileUrl=configuredTileUrl||('https://{s}.basemaps.cartocdn.com/'+(theme.palette.mode==='dark'?'dark_all':'light_all')+'/{z}/{x}/{y}{r}.png');
  const center=points[0]?[points[0].lat,points[0].lng]:DEFAULT_CENTER;
  const searchPlaces=async()=>{
    const term=query.trim();
    if(term.length<2){setSearchError('Enter at least 2 characters.');return;}
    setSearching(true);setSearchError('');setResults([]);
    try {
      const endpoint=import.meta.env.VITE_NOMINATIM_URL||'https://nominatim.openstreetmap.org/search';
      const parameters=new URLSearchParams({q:term,format:'jsonv2',limit:'5',countrycodes:'pk','accept-language':'en'});
      const response=await fetch(endpoint+'?'+parameters,{headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Search service unavailable');
      const data=await response.json();
      const matches=Array.isArray(data)?data.map(item=>({id:item.place_id,name:item.display_name,lat:Number(item.lat),lng:Number(item.lon)})).filter(item=>Number.isFinite(item.lat)&&Number.isFinite(item.lng)):[];
      setResults(matches);if(!matches.length)setSearchError('No matching location found. Try adding city or area name.');
    } catch { setSearchError('Location search failed. Check the internet connection and try again.'); }
    finally { setSearching(false); }
  };
  const chooseResult=result=>{
    setPoint(selectedIndex,result.lat,result.lng,true);setQuery(result.name);setResults([]);setSearchError('');
  };

  return <section className="route-stop-picker">
    <header><div><strong>Place stops on map</strong><span>Select a stop, then click its exact location on the map.</span></div>
      <button type="button" className="secondary-button" disabled={!stops.length} onClick={useCurrentLocation}><LocateFixed size={16}/>Use my location</button>
    </header>
    {!stops.length?<div className="route-picker-empty"><MapPin size={20}/>Enter comma-separated stop names first.</div>:<>
      <div className="route-place-search">
        <label htmlFor="route-place-query">Search stop or place</label>
        <div><Search size={17}/><input id="route-place-query" value={query} onChange={event=>setQuery(event.target.value)}
          onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();searchPlaces();}}}
          placeholder={`Search for ${stops[selectedIndex]||'a stop'}, city`}/>
          <button type="button" className="primary-button" disabled={searching} onClick={searchPlaces}>{searching?<LoaderCircle className="spin" size={16}/>:<Search size={16}/>}Search</button>
        </div>
        {searchError&&<p role="alert">{searchError}</p>}
        {!!results.length&&<div className="route-search-results" role="listbox" aria-label="Location search results">{results.map(result=><button type="button" role="option" key={result.id} onClick={()=>chooseResult(result)}>
          <MapPin size={16}/><span>{result.name}</span>
        </button>)}</div>}
      </div>
      <div className="route-picker-stops" role="list" aria-label="Route stops">
        {stops.map((stop,index)=><button type="button" role="listitem" key={index} className={(selectedIndex===index?'active ':'')+(coordinates[index]?'placed':'')} onClick={()=>setActiveIndex(index)}>
          <span>{index+1}</span><strong>{stop}</strong><small>{coordinates[index]?`${coordinates[index].lat}, ${coordinates[index].lng}`:'Click map to place'}</small>
        </button>)}
      </div>
      <div className="route-picker-map">
        <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
          <FitPoints points={points} focus={focus}/><MapClick onPick={(lat,lng)=>setPoint(selectedIndex,lat,lng)}/>
          <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors &copy; CARTO"/>
          {points.length>1&&<Polyline positions={points.map(point=>[point.lat,point.lng])} color="#7c3aed" weight={4}/>}
          {points.map(point=><Marker key={point.index} position={[point.lat,point.lng]} icon={markerIcon(point.index)} draggable
            eventHandlers={{click:()=>setActiveIndex(point.index),dragend:event=>{const location=event.target.getLatLng();setPoint(point.index,location.lat,location.lng);}}}/>) }
        </MapContainer>
      </div>
      <p className="route-picker-help">Select a search result or click the map, then drag the marker to fine-tune it. Search data © OpenStreetMap contributors.</p>
    </>}
  </section>;
}
