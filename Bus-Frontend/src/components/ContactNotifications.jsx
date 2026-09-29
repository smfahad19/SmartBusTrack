import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { api, connectSocket } from '../api';

export default function ContactNotifications() {
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const navigate=useNavigate();
  useEffect(()=>{
    let active=true;
    const load=()=>api.get('/contacts',{params:{status:'unread'}}).then(({data})=>{if(active)setItems(data);}).catch(()=>{});
    load();
    const socket=connectSocket();
    socket.on('contactInquiry',()=>{load();toast.info('New free demo request received.');});
    socket.on('contactInquiryUpdated',load);
    return()=>{active=false;socket.disconnect();};
  },[]);
  const view=async inquiry=>{
    try{await api.put('/contacts/'+inquiry.id+'/status',{status:'read'});}catch{/* Open the inbox even if the status update fails. */}
    setItems(current=>current.filter(item=>item.id!==inquiry.id));setOpen(false);navigate('/admin/contacts');
  };
  const markAllRead=async()=>{
    try{await api.put('/contacts/read-all',{});setItems([]);toast.success('All notifications marked read.');}
    catch(error){toast.error(error.response?.data?.error||'Unable to update notifications.');}
  };
  return <div className="notification-center">
    <button className="notification-button" aria-label={`${items.length} unread demo request notifications`} aria-expanded={open} aria-haspopup="true" onClick={()=>setOpen(value=>!value)}><Bell size={19}/>{items.length>0&&<span>{items.length>99?'99+':items.length}</span>}</button>
    {open&&<div className="notification-panel"><header><div><strong>Demo requests</strong><span>{items.length} unread</span></div>{items.length>0&&<button onClick={markAllRead}><CheckCheck size={15}/>Mark all read</button>}</header>{items.length?<div className="notification-list">{items.slice(0,5).map(inquiry=><button key={inquiry.id} onClick={()=>view(inquiry)}><span>{inquiry.name}</span><small>{inquiry.message}</small><time>{new Date(inquiry.created_at).toLocaleString()}</time></button>)}</div>:<p>No unread demo requests.</p>}<button className="notification-view-all" onClick={()=>{setOpen(false);navigate('/admin/contacts');}}>View all demo requests</button></div>}
  </div>;
}
