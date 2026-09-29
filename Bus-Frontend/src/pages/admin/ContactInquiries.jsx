import { useCallback, useEffect, useState } from 'react';
import { Briefcase, Building2, CheckCircle2, Mail, MessageSquare, Phone, RefreshCw, RotateCcw, Trash2, MailOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../api';

export default function ContactInquiries() {
  const [inquiries,setInquiries]=useState([]);
  const [status,setStatus]=useState('all');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(null);
  const load=useCallback(async()=>{
    setLoading(true);
    try{setInquiries((await api.get('/contacts',{params:{status}})).data);}
    catch(error){toast.error(error.response?.data?.error||'Unable to load demo requests.');}
    finally{setLoading(false);}
  },[status]);
  // Fetch after mount/filter changes; state updates happen after the request.
  useEffect(()=>{load();},[load]);
  const changeStatus=async(inquiry,nextStatus)=>{
    setBusy(inquiry.id);
    try{await api.put('/contacts/'+inquiry.id+'/status',{status:nextStatus});await load();toast.success(nextStatus==='resolved'?'Demo request marked resolved.':nextStatus==='read'?'Demo request marked read.':'Demo request moved back to unread.');}
    catch(error){toast.error(error.response?.data?.error||'Unable to update demo request.');}finally{setBusy(null);}
  };
  const remove=async inquiry=>{
    if(!window.confirm('Permanently delete the demo request from '+inquiry.name+'?'))return;
    setBusy(inquiry.id);
    try{await api.delete('/contacts/'+inquiry.id);setInquiries(current=>current.filter(item=>item.id!==inquiry.id));toast.success('Demo request deleted.');}
    catch(error){toast.error(error.response?.data?.error||'Unable to delete demo request.');}finally{setBusy(null);}
  };
  const unread=inquiries.filter(item=>item.status==='unread').length;
  return <div className="management-page contact-inquiries-page">
    <header className="management-heading"><div><span className="eyebrow">FREE DEMO BOOKINGS</span><h1>Demo Requests</h1><p>Review free demo requests submitted from the public website and follow up with interested institutes.</p></div><div className="contact-admin-actions"><label><span>Status</span><select value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All requests</option><option value="unread">Unread</option><option value="read">Read</option><option value="resolved">Resolved</option></select></label><button className="secondary-button" disabled={loading} onClick={load}><RefreshCw size={16}/>Refresh</button></div></header>
    <div className="student-summary"><span><strong>{inquiries.length}</strong> Shown</span><span><strong>{unread}</strong> Unread</span><span><strong>{inquiries.length-unread}</strong> Read / resolved</span></div>
    <section className="management-panel">
      {loading?<p className="empty-state">Loading demo requests...</p>:!inquiries.length?<p className="empty-state">No demo requests found.</p>:<div className="inquiry-list">{inquiries.map(inquiry=><article className={'inquiry-card '+inquiry.status} key={inquiry.id}>
        <header><div><span className={'inquiry-status '+inquiry.status}>{inquiry.status}</span><h2>{inquiry.name}</h2><time dateTime={inquiry.created_at}>{new Date(inquiry.created_at).toLocaleString()}</time></div></header>
        <div className="inquiry-contact"><a href={'mailto:'+inquiry.email}><Mail size={15}/>{inquiry.email}</a><a href={'tel:'+inquiry.phone.replace(/[^+\d]/g,'')}><Phone size={15}/>{inquiry.phone}</a>{inquiry.organization&&<span><Building2 size={15}/>{inquiry.organization}</span>}{inquiry.designation&&<span><Briefcase size={15}/>{inquiry.designation}</span>}</div>
        <p className="inquiry-message"><MessageSquare size={17}/><span>{inquiry.message}</span></p>
        <footer>{inquiry.status==='unread'?<button className="secondary-button" disabled={busy===inquiry.id} onClick={()=>changeStatus(inquiry,'read')}><MailOpen size={16}/>Mark read</button>:<button className="secondary-button" disabled={busy===inquiry.id} onClick={()=>changeStatus(inquiry,'unread')}><RotateCcw size={16}/>Mark unread</button>}{inquiry.status!=='resolved'&&<button className="primary-button" disabled={busy===inquiry.id} onClick={()=>changeStatus(inquiry,'resolved')}><CheckCircle2 size={16}/>Resolve</button>}<button className="danger-button" disabled={busy===inquiry.id} onClick={()=>remove(inquiry)}><Trash2 size={16}/>Delete</button></footer>
      </article>)}</div>}
    </section>
  </div>;
}
