import PasswordField from '../../components/PasswordField';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import DialogHeader from '../../components/DialogHeader';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Plus, Search, Download, Pencil, CreditCard, Shield, Trash2, X, FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { api, downloadReport } from '../../api';

const today = () => new Date().toISOString().slice(0,10);
const endAfter = (start,days) => { const date=new Date(start+'T00:00:00Z'); date.setUTCDate(date.getUTCDate()+Number(days)-1); return Number.isFinite(date.getTime())?date.toISOString().slice(0,10):''; };
const emptyForm = () => ({name:'',email:'',password:'',institute_id:localStorage.getItem('instituteScope')||''});
export default function ManageStudents() {
  const user=JSON.parse(localStorage.getItem('user'));
  const superadmin=user.role==='superadmin';
  const [students,setStudents]=useState([]);
  const [institutes,setInstitutes]=useState([]);
  const [search,setSearch]=useState('');
  const [institute,setInstitute]=useState(superadmin?(localStorage.getItem('instituteScope')||''):String(user.institute_id));
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [editor,setEditor]=useState(null);
  const [form,setForm]=useState(emptyForm);
  const [access,setAccess]=useState(null);
  const [payment,setPayment]=useState(null);
  const [history,setHistory]=useState([]);
  const [historyError,setHistoryError]=useState('');
  const [importResult,setImportResult]=useState(null);
  const excelInput=useRef(null);
  const loadVersion=useRef(null);
  const load=useCallback(async()=>{
    const version=Symbol();
    loadVersion.current=version;
    try {
      const [s,i]=await Promise.all([api.get('/auth/students',{params:{institute_id:institute||'all'}}),api.get('/institutes')]);
      if(version!==loadVersion.current)return;
      setStudents(s.data);setInstitutes(i.data);setError('');
    } catch(err) {if(version===loadVersion.current)setError(err.response?.data?.error||'Unable to load students.');}
    finally {if(version===loadVersion.current)setLoading(false);}
  },[institute]);
  // Fetch initial server data; state updates happen after the asynchronous request.
  useEffect(()=>{load();return()=>{loadVersion.current=null;};},[load]);
  const filtered=students.filter(s=>(!status||s.status===status)&&(s.name+' '+s.email).toLowerCase().includes(search.toLowerCase()));
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const save=async e=>{
    e.preventDefault();setBusy(true);
    try {
      if(editor.id)await api.put('/auth/students/'+editor.id,form);else await api.post('/auth/students',{...form,institute_id:superadmin?form.institute_id:user.institute_id});
      toast.success(editor.id?'Student updated.':'Student created. Record a payment to activate access.');setEditor(null);await load();
    }catch(err){toast.error(err.response?.data?.error||'Unable to save student.');}finally{setBusy(false);}
  };
  const openPayment=async student=>{
    const start=today();
    setPayment({student,amount:'',currency:'PKR',reference:'',access_start:start,access_end:endAfter(start,30),days:'30'});
    setHistory([]);setHistoryError('');
    try{setHistory((await api.get('/auth/students/'+student.id+'/payments')).data);}catch{setHistoryError('Payment history is unavailable.');}
  };
  const savePayment=async e=>{
    e.preventDefault();setBusy(true);
    try{
      await api.post('/auth/students/'+payment.student.id+'/payments',{amount:payment.amount,currency:payment.currency,reference:payment.reference,access_start:payment.access_start,access_end:payment.access_end});
      toast.success('Payment recorded and duration updated.');setPayment(null);await load();
    }catch(err){toast.error(err.response?.data?.error||'Unable to record payment.');}finally{setBusy(false);}
  };
  const saveAccess=async e=>{
    e.preventDefault();setBusy(true);
    try{await api.put('/auth/students/'+access.student.id+'/access',{status:access.status,access_start:access.access_start,access_end:access.access_end});toast.success('Access updated.');setAccess(null);await load();}
    catch(err){toast.error(err.response?.data?.error||'Unable to update access.');}finally{setBusy(false);}
  };
  const remove=async student=>{
    if(!window.confirm('Delete '+student.name+'? Payment records will be retained.'))return;
    setBusy(true);
    try{await api.delete('/auth/students/'+student.id);await load();toast.success('Student deleted.');}
    catch(err){toast.error(err.response?.data?.error||'Unable to delete student.');}finally{setBusy(false);}
  };
  const exportStudents=async()=>{
    setBusy(true);
    try{await downloadReport('students',{institute_id:institute||'all',search,status});}
    catch{toast.error('Unable to download PDF.');}finally{setBusy(false);}
  };
  const downloadTemplate=async()=>{
    setBusy(true);
    try{
      const {data}=await api.get('/auth/students/import-template',{responseType:'blob'});
      const url=URL.createObjectURL(data);const anchor=document.createElement('a');anchor.href=url;anchor.download='smarttrack-student-import-template.xlsx';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{toast.error('Unable to download the Excel template.');}finally{setBusy(false);}
  };
  const importExcel=async event=>{
    const file=event.target.files?.[0];event.target.value='';
    if(!file)return;
    if(superadmin&&!institute)return toast.error('Select one institute before importing students.');
    if(!file.name.toLowerCase().endsWith('.xlsx'))return toast.error('Choose an Excel .xlsx file.');
    if(file.size>5*1024*1024)return toast.error('Excel file must be 5 MB or smaller.');
    setBusy(true);
    try{
      const {data}=await api.post('/auth/students/import',await file.arrayBuffer(),{params:{institute_id:superadmin?institute:user.institute_id},headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}});
      setImportResult(data);toast.success(data.message);await load();
    }catch(err){toast.error(err.response?.data?.error||'Unable to import students.');}finally{setBusy(false);}
  };
  return <div className="management-page">
    <header className="management-heading"><div><span className="eyebrow">STUDENT ACCESS & MEMBERSHIP</span><h1>Student management</h1><p>Manage institutes, payment records, and time-limited access from one place.</p></div><div className="form-actions"><button className="secondary-button" disabled={busy} onClick={downloadTemplate}><FileSpreadsheet size={16}/>Excel template</button><input ref={excelInput} hidden type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={importExcel}/><button className="secondary-button" disabled={busy} onClick={()=>excelInput.current?.click()}><Upload size={16}/>Import Excel</button><button className="secondary-button" disabled={busy} onClick={exportStudents}><Download size={16}/>Download PDF</button><DownloadPdfButton type="payments" params={{ institute_id: institute || 'all' }}>Payments PDF</DownloadPdfButton><button className="primary-button" onClick={()=>{setForm({...emptyForm(),institute_id:institute});setEditor({});}}><Plus size={17}/>Add student</button></div></header>
    <div className="student-summary"><span><strong>{students.length}</strong> Students</span><span><strong>{students.filter(s=>s.status==='active').length}</strong> Active</span><span><strong>{students.filter(s=>s.status==='suspended').length}</strong> Suspended</span></div>
    <section className="management-panel">
      <div className="management-filters student-toolbar"><label className="search-filter"><span><Search size={14}/>Search students</span><input placeholder="Name or email" value={search} onChange={e=>setSearch(e.target.value)}/></label>
        {superadmin&&<label>Institute<select value={institute} onChange={e=>setInstitute(e.target.value)}><option value="">All institutes</option>{institutes.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>}
        <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
        <button className="secondary-button" onClick={()=>{setSearch('');setStatus('');if(superadmin)setInstitute('');}}><X size={15}/>Clear filters</button>
      </div>
      {error&&<div className="error-notice" role="alert">{error}<button className="text-link" onClick={load}>Retry</button></div>}
      <div className="management-table-wrap"><table><thead><tr><th>Student</th><th>Institute</th><th>Access period</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {filtered.map(student=><tr key={student.id}><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.institute_name}</td><td><span>{student.access_start||'Not set'} to {student.access_end||'Not set'}</span><small>{student.access_end?'End date inclusive (UTC)':'Set access dates or record a payment'}</small></td><td><span className={'access-badge '+student.status}>{student.status}</span>{student.access_message&&<small className="access-reason">{student.access_message}</small>}</td><td><div className="row-actions">
          <button title="Edit student" aria-label={'Edit '+student.name} disabled={busy} onClick={()=>{setForm({name:student.name,email:student.email,password:'',institute_id:student.institute_id});setEditor(student);}}><Pencil size={16}/></button>
          <button title="Payment and duration" aria-label={'Payment and duration for '+student.name} disabled={busy} onClick={()=>openPayment(student)}><CreditCard size={16}/></button>
          <button title="Activate or suspend" aria-label={'Manage access for '+student.name} disabled={busy} onClick={()=>setAccess({student,status:student.status,access_start:student.access_start||today(),access_end:student.access_end||endAfter(today(),30)})}><Shield size={16}/></button>
          <button title="Delete student" aria-label={'Delete '+student.name} disabled={busy} onClick={()=>remove(student)}><Trash2 size={16}/></button>
        </div></td></tr>)}
      </tbody></table>{!filtered.length&&<p className="empty-state">{loading?'Loading students...':'No students match these filters.'}</p>}</div>
      <p className="table-note">{filtered.length} of {students.length} students shown. PDF export uses these filters.</p>
    </section>
    <Dialog open={!!editor} onClose={()=>!busy&&setEditor(null)} fullWidth maxWidth="sm"><DialogHeader disabled={busy} onClose={()=>setEditor(null)}>{editor?.id?'Edit student':'Add student'}</DialogHeader><DialogContent><form className="management-form dialog-form" onSubmit={save}>
      <label>Full name<input name="name" required value={form.name} onChange={change}/></label><label>Email<input name="email" type="email" required value={form.email} onChange={change}/></label>
      <PasswordField label={editor?.id?'New password (leave blank to keep)':'Temporary password'} name="password" autoComplete="new-password" minLength={8} readOnly={!editor?.id} value={editor?.id?form.password:'password123'} onChange={change}/><p className="form-note">Temporary password: password123. Password change is required on first sign-in.</p>
      {superadmin&&<label>Institute<select name="institute_id" required disabled={!!editor?.id} value={form.institute_id} onChange={change}><option value="">Select institute</option>{institutes.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>}
      <div className="form-actions"><button className="primary-button" disabled={busy}>Save student</button><button type="button" className="secondary-button" disabled={busy} onClick={()=>setEditor(null)}>Cancel</button></div>
    </form></DialogContent></Dialog>
    <Dialog open={!!importResult} onClose={()=>setImportResult(null)} fullWidth maxWidth="sm"><DialogHeader onClose={()=>setImportResult(null)}>Excel import result</DialogHeader><DialogContent>{importResult&&<div className="import-result"><div className="student-summary"><span><strong>{importResult.created}</strong> Added</span><span><strong>{importResult.skipped}</strong> Skipped</span></div>{importResult.errors?.length>0&&<div className="import-errors"><h3>Rows that were skipped</h3>{importResult.errors.map((item,index)=><p key={item.row+'-'+index}><strong>Row {item.row}</strong>{item.email?' · '+item.email:''}<span>{item.message}</span></p>)}</div>}<div className="form-actions"><button className="primary-button" onClick={()=>setImportResult(null)}>Done</button></div></div>}</DialogContent></Dialog>
    <Dialog open={!!payment} onClose={()=>!busy&&setPayment(null)} fullWidth maxWidth="sm"><DialogHeader disabled={busy} onClose={()=>setPayment(null)}>Payment & duration - {payment?.student.name}</DialogHeader><DialogContent>{payment&&<form className="management-form dialog-form" onSubmit={savePayment}>
      <div className="form-grid"><label>Amount received<input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/></label><label>Currency<input required maxLength={3} pattern="[A-Za-z]{3}" value={payment.currency} onChange={e=>setPayment({...payment,currency:e.target.value.toUpperCase()})}/></label></div>
      <label>Duration<select value={payment.days} onChange={e=>setPayment({...payment,days:e.target.value,...(e.target.value?{access_end:endAfter(payment.access_start,e.target.value)}:{})})}><option value="30">30 days</option><option value="90">90 days</option><option value="365">365 days</option><option value="">Custom dates</option></select></label>
      <div className="form-grid"><label>Start date<input required type="date" value={payment.access_start} onChange={e=>setPayment({...payment,access_start:e.target.value,...(payment.days?{access_end:endAfter(e.target.value,payment.days)}:{})})}/></label><label>End date<input required type="date" min={payment.access_start} value={payment.access_end} onChange={e=>setPayment({...payment,access_end:e.target.value,days:''})}/></label></div>
      <label>Receipt / reference<input maxLength={200} value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></label>
      <p className="form-note">Recording payment replaces this student's current access period. Access ends at 23:59 UTC on the end date, then automatically becomes suspended.</p>
      <div className="form-actions"><button className="primary-button" disabled={busy}>Record payment & activate</button><button type="button" className="secondary-button" disabled={busy} onClick={()=>setPayment(null)}>Cancel</button></div>
      <h3>Payment history</h3>{historyError&&<p role="alert">{historyError}</p>}{!history.length&&!historyError&&<p className="table-note">No recorded payments.</p>}{history.map(p=><div className="payment-history-row" key={p.id}><strong>{(p.amount_cents/100).toFixed(2)} {p.currency}</strong><span>{p.access_start} to {p.access_end}</span><small>{p.reference||'No reference'} | {p.recorded_at} UTC</small></div>)}
    </form>}</DialogContent></Dialog>
    <Dialog open={!!access} onClose={()=>!busy&&setAccess(null)} fullWidth maxWidth="sm"><DialogHeader disabled={busy} onClose={()=>setAccess(null)}>Student access - {access?.student.name}</DialogHeader><DialogContent>{access&&<form className="management-form dialog-form" onSubmit={saveAccess}>
      <label>Status<select value={access.status} onChange={e=>setAccess({...access,status:e.target.value})}><option value="active">Active</option><option value="suspended">Suspended by admin</option></select></label>
      {access.status==='active'&&<div className="form-grid"><label>Start date<input required type="date" value={access.access_start} onChange={e=>setAccess({...access,access_start:e.target.value})}/></label><label>End date<input required type="date" min={access.access_start} value={access.access_end} onChange={e=>setAccess({...access,access_end:e.target.value})}/></label></div>}
      <p className="form-note">{access.status==='suspended'?'The student will see "Account suspended by admin" when signing in.':'This changes access dates without recording a payment. Use Payment & duration to record money received.'}</p>
      <div className="form-actions"><button className="primary-button" disabled={busy}>Save access</button><button type="button" className="secondary-button" disabled={busy} onClick={()=>setAccess(null)}>Cancel</button></div>
    </form>}</DialogContent></Dialog>
  </div>;
}
