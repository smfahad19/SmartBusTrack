export function parseList(value) {
  try { const data = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(data) ? data.filter(item => typeof item === 'string') : []; }
  catch { return []; }
}
export function coordinates(bus) {
  if (bus?.lat == null || bus?.lng == null || bus.lat === '' || bus.lng === '') return null;
  const lat=Number(bus.lat),lng=Number(bus.lng);
  return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?[lat,lng]:null;
}
export function routeStopPoints(route) {
  const stops=parseList(route?.stops),etas=parseList(route?.etas);
  let points=[];
  try { const parsed=typeof route?.stop_coordinates==='string'?JSON.parse(route.stop_coordinates):route?.stop_coordinates;points=Array.isArray(parsed)?parsed:[]; }
  catch { points=[]; }
  return stops.map((name,index)=>{
    const point=points[index];
    const lat=Number(Array.isArray(point)?point[0]:point?.lat),lng=Number(Array.isArray(point)?point[1]:point?.lng);
    return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?{name,eta:etas[index],lat,lng,index}:null;
  }).filter(Boolean);
}
export const formatSeconds = value => Math.floor(value/60)+':'+String(value%60).padStart(2,'0');
export function normalizeTime(value) {
  const text=String(value||'').trim();
  const twentyFour=text.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if(twentyFour)return String(Number(twentyFour[1])).padStart(2,'0')+':'+twentyFour[2];
  const twelve=text.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i);
  if(!twelve)return '';
  let hour=Number(twelve[1])%12;
  if(twelve[3].toUpperCase()==='PM')hour+=12;
  return String(hour).padStart(2,'0')+':'+twelve[2];
}
export function formatTime(value) {
  const time=normalizeTime(value);
  if(!time)return value||'Not set';
  const [hour,minute]=time.split(':').map(Number);
  return String(hour%12||12).padStart(2,'0')+':'+String(minute).padStart(2,'0')+' '+(hour<12?'AM':'PM');
}
