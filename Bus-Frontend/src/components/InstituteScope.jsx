import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { api } from '../api';
export default function InstituteScope({ value, onChange }) {
  const [institutes, setInstitutes] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/institutes').then(r => setInstitutes(r.data)).catch(() => setError('Unable to load institutes.')); }, []);
  return <div className="institute-scope"><Building2 size={18} /><label htmlFor="workspace-institute">Filter by institute</label><select id="workspace-institute" value={value} onChange={e => onChange(e.target.value)}><option value="">All institutes</option>{institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select><button type="button" className="secondary-button" disabled={!value} onClick={()=>onChange('')}>Clear filter</button><span>{error || (value ? 'Showing selected institute' : 'Showing all institutes. Select one to add records.')}</span></div>;
}
