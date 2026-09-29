import { useEffect, useState } from 'react';
import { api } from '../api';
export default function InstituteField({ value, onChange, disabled }) {
 const [institutes,setInstitutes]=useState([]);
 const [error,setError]=useState('');
 const user=JSON.parse(localStorage.getItem('user')||'null');
 useEffect(()=>{if(user?.role!=='superadmin')return;let active=true;api.get('/institutes').then(r=>{if(active)setInstitutes(r.data);}).catch(()=>{if(active)setError('Unable to load institutes. Please refresh.');});return()=>{active=false;};},[user?.role]);
 if(user?.role!=='superadmin')return null;
 return <div className="management-form record-institute"><label>Institute *<select required value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}><option value="">Select an institute</option>{institutes.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label><p className="form-note">{error || (disabled?'Changes apply to this record?s institute.':'This record will be added to the selected institute.')}</p></div>;
}
