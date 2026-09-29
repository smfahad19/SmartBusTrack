import PasswordField from '../../components/PasswordField';
import DialogHeader from '../../components/DialogHeader';
import { Dialog, DialogContent } from '@mui/material';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import { useEffect, useState, useCallback } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../api';
export default function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [institute, setInstitute] = useState({ name: '', address: '' });
  const [editing, setEditing] = useState(null);
  const [admin, setAdmin] = useState({ name: '', email: '', password: '', institute_id: '' });
  const [saving, setSaving] = useState(false);
  const [instituteOpen, setInstituteOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEditing, setAdminEditing] = useState(null);
  const [replacing,setReplacing]=useState(false);
  const load = useCallback(async () => {
    try { const [i,a] = await Promise.all([api.get('/institutes'),api.get('/auth/admins')]); setInstitutes(i.data); setAdmins(a.data); }
    catch(err) { toast.error(err.response?.data?.error || 'Unable to load institutes.'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const saveInstitute = async e => {
    e.preventDefault(); setSaving(true);
    try { if(editing) await api.put('/institutes/'+editing,institute); else await api.post('/institutes',institute); setInstituteOpen(false); setEditing(null); setInstitute({name:'',address:''}); await load(); toast.success('Institute saved.'); }
    catch(err) { toast.error(err.response?.data?.error || 'Unable to save.'); } finally { setSaving(false); }
  };
  const saveAdmin = async e => {
    e.preventDefault(); setSaving(true);
    try { if(adminEditing) await api.put('/auth/admins/'+adminEditing,{...admin,replace_admin:replacing}); else await api.post('/auth/admins',admin); setAdminOpen(false); setAdminEditing(null); setAdmin({ name:'',email:'',password:'',institute_id:'' }); await load(); toast.success('Institute administrator saved.'); }
    catch(err) { toast.error(err.response?.data?.error || 'Unable to create administrator.'); } finally { setSaving(false); }
  };
  const removeInstitute = async institute => {
    if(!window.confirm('Delete institute "'+institute.name+'"? Only institutes without linked records can be deleted.'))return;
    setSaving(true);
    try { await api.delete('/institutes/'+institute.id); if(localStorage.getItem('instituteScope')===String(institute.id))localStorage.removeItem('instituteScope');await load();toast.success('Institute deleted.'); }
    catch(err) {toast.error(err.response?.data?.error || 'Unable to delete institute.');}
    finally {setSaving(false);}
  };
  const removeAdmin = async account => {
    if(!window.confirm('Remove administrator '+account.name+'? Institute data will be retained.')) return;
    setSaving(true);
    try { await api.delete('/auth/admins/'+account.id); await load(); toast.success('Administrator removed.'); }
    catch(err) { toast.error(err.response?.data?.error || 'Unable to remove administrator.'); }
    finally { setSaving(false); }
  };
  return <div className="management-page">
    <header className="management-heading"><div><span className="eyebrow">SUPER ADMIN PANEL</span><h1>Institutes & administrators</h1><p>Create separate workspaces for every campus. You retain access to all institutes.</p></div><div className="form-actions"><button className="primary-button" disabled={saving} onClick={()=>{setEditing(null);setInstitute({name:'',address:''});setInstituteOpen(true);}}><Plus size={17}/>Add institute</button><button className="primary-button" disabled={saving || !institutes.some(i=>!admins.some(a=>a.institute_id===i.id))} title="Assign an admin to an institute without an admin" onClick={()=>{setReplacing(false);setAdminEditing(null);setAdmin({name:'',email:'',password:'',institute_id:''});setAdminOpen(true);}}><Plus size={17}/>Add admin</button></div></header>
    <section className="management-panel"><div className="management-heading"><h2>All registered institutes</h2><DownloadPdfButton type="institutes" params={{ institute_id: 'all' }} /></div><div className="institute-cards" role="region" aria-label="Registered institutes" tabIndex={0}>{institutes.map(i=><article key={i.id}><div className="institute-card-head"><Building2 size={22}/><div className="institute-card-actions"><button disabled={saving} className="icon-button" aria-label={'Edit '+i.name} onClick={()=>{setEditing(i.id);setInstitute({name:i.name,address:i.address});setInstituteOpen(true);}}><Pencil size={17}/></button><button type="button" disabled={saving} className="icon-button delete-action" aria-label={'Delete '+i.name} onClick={()=>removeInstitute(i)}><Trash2 size={17}/></button></div></div><h3>{i.name}</h3><p>{i.address||'Address not added'}</p><span>{admins.find(a=>a.institute_id===i.id)?.name || 'No admin assigned'}</span><button type="button" className="secondary-button institute-admin-action" disabled={saving} onClick={()=>{const current=admins.find(a=>a.institute_id===i.id);setReplacing(!!current);setAdminEditing(current?.id||null);setAdmin({name:'',email:'',password:'',institute_id:i.id});setAdminOpen(true);}}>{admins.some(a=>a.institute_id===i.id)?'Change admin':'Assign admin'}</button></article>)}</div></section>
    <section className="management-panel"><div className="management-heading"><h2>Institute administrators</h2><DownloadPdfButton type="admins" params={{ institute_id: 'all' }} /></div><div className="management-table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Institute</th><th>Actions</th></tr></thead><tbody>{admins.map(a=><tr key={a.id}><td>{a.name}</td><td>{a.email}</td><td>{a.institute_name}</td><td><div className="row-actions"><button disabled={saving} aria-label={'Edit '+a.name} onClick={()=>{setReplacing(false);setAdminEditing(a.id);setAdmin({name:a.name,email:a.email,password:'',institute_id:a.institute_id});setAdminOpen(true);}}><Pencil size={16}/></button><button disabled={saving} aria-label={'Remove '+a.name} onClick={()=>removeAdmin(a)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!admins.length&&<p className="empty-state">Create an administrator for an institute to get started.</p>}</div></section>
    <Dialog open={instituteOpen} onClose={()=>!saving&&setInstituteOpen(false)} fullWidth maxWidth="sm" aria-labelledby="institute-dialog-title">
      <DialogHeader id="institute-dialog-title" disabled={saving} onClose={()=>setInstituteOpen(false)}>{editing?'Edit institute':'Add institute'}</DialogHeader>
      <DialogContent><form className="management-form dialog-form" onSubmit={saveInstitute}>
        <label>Institute name<input autoFocus required maxLength={160} value={institute.name} onChange={e=>setInstitute({...institute,name:e.target.value})}/></label>
        <label>Address<input maxLength={300} value={institute.address} onChange={e=>setInstitute({...institute,address:e.target.value})}/></label>
        <div className="form-actions"><button className="primary-button" disabled={saving}>{saving?'Saving...':'Save institute'}</button><button type="button" className="secondary-button" disabled={saving} onClick={()=>setInstituteOpen(false)}>Cancel</button></div>
      </form></DialogContent>
    </Dialog>
    <Dialog open={adminOpen} onClose={()=>!saving&&setAdminOpen(false)} fullWidth maxWidth="sm" aria-labelledby="admin-dialog-title">
      <DialogHeader id="admin-dialog-title" disabled={saving} onClose={()=>setAdminOpen(false)}>{replacing?'Change institute admin':adminEditing?'Edit admin':'Add admin'}</DialogHeader>
      <DialogContent><form className="management-form dialog-form" onSubmit={saveAdmin}>
        {!institutes.length&&<p className="form-note">Add an institute first, then assign an admin to it.</p>}
        <label>Institute<select autoFocus required disabled={!!adminEditing} value={admin.institute_id} onChange={e=>setAdmin({...admin,institute_id:e.target.value})}><option value="">Select institute</option>{institutes.filter(i=>adminEditing || !admins.some(a=>a.institute_id===i.id)).map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
        <label>Name<input required maxLength={160} value={admin.name} onChange={e=>setAdmin({...admin,name:e.target.value})}/></label>
        <label>Email<input type="email" required maxLength={254} value={admin.email} onChange={e=>setAdmin({...admin,email:e.target.value})}/></label>
        <PasswordField label={adminEditing&&!replacing?'New password (leave blank to keep)':'Temporary password'} minLength={8} autoComplete="new-password" readOnly={!adminEditing||replacing} value={adminEditing&&!replacing?admin.password:'password123'} onChange={e=>setAdmin({...admin,password:e.target.value})}/><p className="form-note">{replacing?'Replacing the admin revokes their sessions. The new admin signs in with password123 and must change it.':'One admin per institute. Initial password is password123; change required at first sign-in.'}</p>
        <div className="form-actions"><button className="primary-button" disabled={saving||!institutes.length}>{saving?'Saving...':'Save admin'}</button><button type="button" className="secondary-button" disabled={saving} onClick={()=>setAdminOpen(false)}>Cancel</button></div>
      </form></DialogContent>
    </Dialog>
  </div>;
}
