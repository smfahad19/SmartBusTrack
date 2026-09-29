import { useMemo, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, OverlayViewF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import { Fragment, useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';
import { coordinates, routeStopPoints } from '../transportUtils';

const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };
const mapContainerStyle = { width: '100%', height: '100%' };
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#161922' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#161922' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a7afc0' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#343a49' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#20242d' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8e97aa' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b303b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#171a21' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b4250' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#242936' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2638' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6d8294' }] },
];
const busColors=['#2563eb','#dc2626','#059669','#d97706','#7c3aed','#0891b2','#db2777'];
const busColor=id=>busColors[Math.abs(Number(id)||0)%busColors.length];
const leafletIcon = bus => L.divIcon({
  className: 'bus-map-pin',
  html: `<span aria-hidden="true" style="background:${busColor(bus.id)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 11h14M12 3v8M7 19v3M17 19v3M8 15h1m6 0h1"/></svg></span>`,
  iconSize: [38, 44],
  iconAnchor: [19, 40],
  popupAnchor: [0, -38],
});
const stopIcon = index => L.divIcon({
  className: 'route-stop-map-pin',
  html: `<span>${index+1}</span>`,
  iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -15],
});

function toPoint(value) {
  const point = coordinates(value);
  return point ? { lat: point[0], lng: point[1] } : null;
}

function LeafletViewport({ position, buses, routeStops, fitAll }) {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    return () => cancelAnimationFrame(frame);
  }, [map]);
  useEffect(() => {
    const points=[...buses.map(coordinates).filter(Boolean),...routeStops.map(stop=>[stop.lat,stop.lng])];
    if((fitAll||(!position&&routeStops.length))&&points.length)map.fitBounds(points,{padding:[38,38],maxZoom:15,animate:false});
    else if (position) map.setView([position.lat, position.lng], map.getZoom(), { animate: false });
  }, [map, position, buses, routeStops, fitAll]);
  return null;
}

function OpenStreetMap({ buses, onSelect, position, selected, theme, fitAll, routeStops }) {
  const configuredTileUrl = import.meta.env.VITE_OSM_TILE_URL;
  const tileUrl = configuredTileUrl || ('https://{s}.basemaps.cartocdn.com/' + (theme.palette.mode === 'dark' ? 'dark_all' : 'light_all') + '/{z}/{x}/{y}{r}.png');
  return <MapContainer center={[position?.lat || DEFAULT_CENTER.lat, position?.lng || DEFAULT_CENTER.lng]} zoom={position ? 15 : 12} style={mapContainerStyle}>
    <LeafletViewport position={position} buses={buses} routeStops={routeStops} fitAll={fitAll}/>
    <TileLayer
      url={tileUrl}
      attribution='&copy; OpenStreetMap contributors &copy; CARTO'
    />
    {selected?.history?.length > 1 && <Polyline positions={selected.history} color="#2865e8" weight={5}/>}
    {routeStops.length > 1 && <Polyline positions={routeStops.map(stop=>[stop.lat,stop.lng])} color="#7c3aed" weight={4} opacity={.8}/>}
    {routeStops.map(stop=><Marker key={'stop-'+stop.index} position={[stop.lat,stop.lng]} icon={stopIcon(stop.index)}>
      <Popup><div className="google-map-popup"><strong>{stop.index+1}. {stop.name}</strong><span>{stop.eta||'Timing not set'}</span><small>{stop.lat}, {stop.lng}</small></div></Popup>
    </Marker>)}
    {buses.filter(bus => coordinates(bus)).map(bus => <Fragment key={bus.id}>
      <Marker position={coordinates(bus)} icon={leafletIcon(bus)} eventHandlers={{ click: () => onSelect?.(bus.id) }}>
        <Tooltip permanent direction="right" offset={[20,-20]} className="bus-route-tooltip"><div style={{borderColor:busColor(bus.id)}}><strong>{bus.name}</strong><span>{bus.route||'Route not assigned'}</span></div></Tooltip>
        <Popup><div className="google-map-popup"><strong>{bus.name}</strong><span>{bus.number_plate}</span><p>{bus.route||'Route not assigned'}</p><p>{bus.status || 'No status reported'}</p><small>{bus.driver_name || 'Driver not assigned'}</small>{bus.institute_name&&<small>{bus.institute_name}</small>}</div></Popup>
      </Marker>
    </Fragment>)}
  </MapContainer>;
}

function GoogleTrackingMap({ apiKey, buses, selectedId, onSelect, selected, position, theme, fitAll, routeStops }) {
  const [popupId, setPopupId] = useState(null);
  const [map, setMap] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({ id: 'smartbus-google-map', googleMapsApiKey: apiKey || '' });
  const center = position || routeStops[0] || DEFAULT_CENTER;
  const visibleBuses = useMemo(() => buses.map(bus => ({ bus, position: toPoint(bus) })).filter(item => item.position), [buses]);
  const history = (selected?.history || []).map(([lat, lng]) => ({ lat, lng }));
  const options = useMemo(() => ({
    styles: theme.palette.mode === 'dark' ? darkMapStyles : undefined,
    mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    clickableIcons: false, gestureHandling: 'greedy',
  }), [theme.palette.mode]);
  useEffect(() => {
    if (!map || (!fitAll&&(position||!routeStops.length)) || (!visibleBuses.length&&!routeStops.length) || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    visibleBuses.forEach(item => bounds.extend(item.position));
    routeStops.forEach(stop=>bounds.extend({lat:stop.lat,lng:stop.lng}));
    map.fitBounds(bounds);
  }, [map, fitAll, position, visibleBuses, routeStops]);

  if (!apiKey || loadError) {
    return <OpenStreetMap buses={buses} onSelect={onSelect} selected={selected} position={position} theme={theme} fitAll={fitAll} routeStops={routeStops}/>;
  }
  if (!isLoaded) return <div className="map-load-state" role="status">Loading Google Maps...</div>;
  return <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={position ? 15 : 12} options={options} onLoad={setMap} onUnmount={()=>setMap(null)}>
    {history.length > 1 && <PolylineF path={history} options={{ strokeColor: '#2865e8', strokeOpacity: .9, strokeWeight: 5 }} />}
    {routeStops.length > 1 && <PolylineF path={routeStops} options={{strokeColor:'#7c3aed',strokeOpacity:.8,strokeWeight:4}}/>}
    {routeStops.map(stop=><MarkerF key={'stop-'+stop.index} position={stop} title={stop.name}
      label={{text:String(stop.index+1),color:'#ffffff',fontWeight:'700'}}
      icon={{path:window.google.maps.SymbolPath.CIRCLE,fillColor:'#7c3aed',fillOpacity:1,strokeColor:'#ffffff',strokeWeight:2,scale:12}}
      onClick={()=>setPopupId('stop-'+stop.index)}>
      {popupId==='stop-'+stop.index&&<InfoWindowF position={stop} onCloseClick={()=>setPopupId(null)}><div className="google-map-popup"><strong>{stop.index+1}. {stop.name}</strong><span>{stop.eta||'Timing not set'}</span><small>{stop.lat}, {stop.lng}</small></div></InfoWindowF>}
    </MarkerF>)}
    {visibleBuses.map(({ bus, position: busPosition }) => <MarkerF key={bus.id} position={busPosition} title={bus.name}
      onClick={() => { setPopupId(bus.id); onSelect?.(bus.id); }}
      icon={{ path: window.google.maps.SymbolPath.CIRCLE, fillColor: busColor(bus.id), fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3, scale: bus.id === selectedId ? 11 : 9 }}>
      {popupId === bus.id && <InfoWindowF position={busPosition} onCloseClick={() => setPopupId(null)}><div className="google-map-popup"><strong>{bus.name}</strong><span>{bus.number_plate}</span><p>{bus.route||'Route not assigned'}</p><p>{bus.status || 'No status reported'}</p><small>{bus.driver_name || 'Driver not assigned'}</small></div></InfoWindowF>}
    </MarkerF>)}
    {visibleBuses.map(({bus,position:busPosition})=><OverlayViewF key={'label-'+bus.id} position={busPosition} mapPaneName="overlayMouseTarget"><div className="google-bus-route-label" style={{borderColor:busColor(bus.id)}}><strong>{bus.name}</strong><span>{bus.route||'Route not assigned'}</span></div></OverlayViewF>)}
  </GoogleMap>;
}

export default function TrackingMap({ buses, selectedId, onSelect, fitAll=false, title, route }) {
  const theme = useTheme();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const provider = import.meta.env.VITE_MAP_PROVIDER || 'osm';
  const selected = buses.find(bus => bus.id === selectedId);
  const position = toPoint(selected);
  const routeStops=useMemo(()=>routeStopPoints(route),[route]);
  const mapDescription=selected
    ? route
      ? `${routeStops.length} mapped route ${routeStops.length===1?'stop':'stops'} shown${position?' with the live bus location':'; waiting for the bus GPS location'}.`
      : `${position?'Live bus location shown. ':''}No route is assigned to this bus, so there are no route stops to display.`
    : fitAll
      ? `${buses.filter(bus=>coordinates(bus)).length} of ${buses.length} buses are reporting a location.`
      : 'Select a bus from the list below or beside the map.';
  const mapBody = provider === 'google'
    ? <GoogleTrackingMap apiKey={apiKey} buses={buses} selectedId={selectedId} onSelect={onSelect} selected={selected} position={position} theme={theme} fitAll={fitAll} routeStops={routeStops}/>
    : <OpenStreetMap buses={buses} onSelect={onSelect} selected={selected} position={position} theme={theme} fitAll={fitAll} routeStops={routeStops}/>;

  return <section className="tracking-map-panel">
    <header><span className="mini-icon"><MapPin size={19}/></span><div><span className="eyebrow">LIVE MAP</span><h2>{title || selected?.name || 'Choose a bus to follow'}</h2><p>{mapDescription}</p></div></header>
    <div className="tracking-map-canvas">{mapBody}</div>
    <footer>{position ? <a className="secondary-button" href={'https://www.google.com/maps/search/?api=1&query=' + position.lat + ',' + position.lng} target="_blank" rel="noopener noreferrer"><Navigation size={17}/>Open in Google Maps</a> : <p>{selected?'No live location is available for this bus yet.':fitAll?'Select a bus card to view all mapped stops on its route.':'No bus selected.'}</p>}</footer>
  </section>;
}
