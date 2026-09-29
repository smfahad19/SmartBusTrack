import { useState } from 'react';
import { Clock3, X } from 'lucide-react';
import { formatTime, normalizeTime } from '../transportUtils';

export default function DepartureTimePicker({value,onChange}) {
  const normalized=normalizeTime(value);
  const [hourText='0',minute='']=normalized.split(':');
  const hour24=Number(hourText);
  const initialHour=normalized?String(hour24%12||12):'';
  const initialMinute=normalized?String(Number(minute)):'';
  const initialPeriod=normalized?(hour24<12?'AM':'PM'):'AM';
  const [draft,setDraft]=useState({hour:initialHour,minute:initialMinute,period:initialPeriod});
  const update=next=>{
    setDraft(next);
    const hour=Number(next.hour),minutes=Number(next.minute||0);
    if(!next.hour){onChange('');return;}
    if(hour<1||hour>12||minutes<0||minutes>59)return;
    let converted=hour%12;
    if(next.period==='PM')converted+=12;
    onChange(String(converted).padStart(2,'0')+':'+String(minutes).padStart(2,'0'));
  };
  const clear=()=>{setDraft({hour:'',minute:'',period:'AM'});onChange('');};
  return <div className="departure-picker">
    <div className="departure-picker-heading"><span><Clock3 size={18}/></span><div><strong>Departure schedule</strong><small>Type a time or use the number controls</small></div></div>
    <div className="departure-picker-controls">
      <label><span>Hour</span><input aria-label="Departure hour" inputMode="numeric" type="number" min="1" max="12" placeholder="08" value={draft.hour} onChange={event=>update({...draft,hour:event.target.value})} onBlur={()=>{if(draft.hour)update({...draft,hour:String(Math.min(12,Math.max(1,Number(draft.hour)||1)))})}}/></label>
      <span className="time-separator">:</span>
      <label><span>Minutes</span><input aria-label="Departure minutes" inputMode="numeric" type="number" min="0" max="59" placeholder="30" value={draft.minute} onChange={event=>update({...draft,minute:event.target.value})} onBlur={()=>{if(draft.hour)update({...draft,minute:String(Math.min(59,Math.max(0,Number(draft.minute)||0)))})}}/></label>
      <label><span>Period</span><select aria-label="Departure period" value={draft.period} disabled={!draft.hour} onChange={event=>update({...draft,period:event.target.value})}><option>AM</option><option>PM</option></select></label>
      {normalized&&<button type="button" className="departure-clear" aria-label="Clear departure time" onClick={clear}><X size={17}/></button>}
    </div>
    <div className={'departure-preview '+(normalized?'selected':'')}><span className="status-dot"/>{normalized?'Scheduled departure: '+formatTime(normalized):'No departure time selected'}</div>
  </div>;
}
