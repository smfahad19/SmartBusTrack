import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Upload, ExternalLink, Trash2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { api, API_URL } from '../../api';
import { FacebookIcon, InstagramIcon } from '../../components/SocialIcons';

const policyTypes = [
  { type: 'privacy', title: 'Privacy Policy', description: 'Explain how SmartTrack collects, uses, and protects account and live-location data.' },
  { type: 'terms', title: 'Terms of Use', description: 'Publish the rules and responsibilities that apply to SmartTrack users.' }
];

export default function Policies() {
  const [documents,setDocuments]=useState([]);
  const [social,setSocial]=useState({facebook:'',instagram:''});
  const [busy,setBusy]=useState('');
  const inputs=useRef({});
  const load=useCallback(async()=>{
    try{const [policyResponse,socialResponse]=await Promise.all([api.get('/policies'),api.get('/policies/social')]);setDocuments(policyResponse.data);setSocial(socialResponse.data);}catch(err){toast.error(err.response?.data?.error||'Unable to load policies and social links.');}
  },[]);
  // Load server state after mount; updates occur after the asynchronous request.
  useEffect(()=>{load();},[load]);
  const upload=async(type,file)=>{
    if(!file)return;
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))return toast.error('Choose a PDF file.');
    if(file.size>10*1024*1024)return toast.error('PDF must be 10 MB or smaller.');
    setBusy(type);
    try{
      await api.put('/policies/'+type,await file.arrayBuffer(),{headers:{'Content-Type':'application/pdf','X-File-Name':encodeURIComponent(file.name)}});
      toast.success('Policy PDF uploaded.');await load();
    }catch(err){toast.error(err.response?.data?.error||'Unable to upload the PDF.');}
    finally{setBusy('');if(inputs.current[type])inputs.current[type].value='';}
  };
  const remove=async(type,title)=>{
    if(!window.confirm('Remove the uploaded '+title+' PDF?'))return;
    setBusy(type);
    try{await api.delete('/policies/'+type);toast.success(title+' removed.');await load();}
    catch(err){toast.error(err.response?.data?.error||'Unable to remove the PDF.');}finally{setBusy('');}
  };
  const saveSocial=async event=>{
    event.preventDefault();setBusy('social');
    try{const {data}=await api.put('/policies/social',social);setSocial({facebook:data.facebook,instagram:data.instagram});toast.success('Social links updated.');}
    catch(err){toast.error(err.response?.data?.error||'Unable to update social links.');}finally{setBusy('');}
  };
  return <div className="management-page">
    <header className="management-heading"><div><span className="eyebrow">PUBLIC WEBSITE SETTINGS</span><h1>Policies &amp; social</h1><p>Manage official policy PDFs and the social profiles shown in the SmartTrack footer.</p></div></header>
    <div className="policy-grid">{policyTypes.map(item=>{
      const document=documents.find(entry=>entry.type===item.type);
      return <section className="management-panel policy-card" key={item.type}>
        <span className="policy-icon"><FileText size={24}/></span><div><h2>{item.title}</h2><p>{item.description}</p></div>
        {document?<div className="policy-file"><div><strong>{document.original_name}</strong><span>{(document.size/1024/1024).toFixed(2)} MB · Updated {new Date(document.updated_at).toLocaleString()}</span></div><a className="secondary-button" href={`${API_URL}/api/policies/${item.type}/pdf`} target="_blank" rel="noreferrer"><ExternalLink size={16}/>View PDF</a></div>:<p className="policy-empty">No PDF uploaded yet. The website will show its short built-in notice.</p>}
        <div className="form-actions"><input ref={node=>{inputs.current[item.type]=node;}} hidden type="file" accept="application/pdf,.pdf" onChange={event=>upload(item.type,event.target.files?.[0])}/><button className="primary-button" disabled={!!busy} onClick={()=>inputs.current[item.type]?.click()}><Upload size={17}/>{document?'Replace PDF':'Upload PDF'}</button>{document&&<button className="danger-button" disabled={!!busy} onClick={()=>remove(item.type,item.title)}><Trash2 size={16}/>Remove</button>}</div>
      </section>;
    })}</div>
    <p className="table-note">PDF only · maximum 10 MB per document. Replacing a document updates the public link immediately.</p>
    <section className="management-panel social-settings-card"><div className="social-settings-heading"><span className="policy-icon"><InstagramIcon size={23}/></span><div><h2>Social media links</h2><p>Add official profile URLs. An empty field hides that social icon from the public footer.</p></div></div><form className="management-form" onSubmit={saveSocial}><label><span><FacebookIcon size={15}/>Facebook profile URL</span><input type="url" inputMode="url" placeholder="https://www.facebook.com/your-page" value={social.facebook} onChange={event=>setSocial({...social,facebook:event.target.value})}/></label><label><span><InstagramIcon size={15}/>Instagram profile URL</span><input type="url" inputMode="url" placeholder="https://www.instagram.com/your-page" value={social.instagram} onChange={event=>setSocial({...social,instagram:event.target.value})}/></label><div className="form-actions"><button className="primary-button" disabled={!!busy}><Save size={16}/>{busy==='social'?'Saving...':'Save social links'}</button></div></form></section>
  </div>;
}
