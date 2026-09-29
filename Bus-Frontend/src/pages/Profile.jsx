import { useState } from 'react';
import { Building2, Camera, KeyRound, Mail, Phone, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../api';
import PasswordField from '../components/PasswordField';
import ProfileAvatar from '../components/ProfileAvatar';

const roleLabel = role => ({ superadmin:'Global super administrator', admin:'Institute administrator', driver:'Driver account', student:'Student account' }[role] || role);

export default function Profile() {
  const stored=JSON.parse(localStorage.getItem('user')||'null');
  const [user,setUser]=useState(stored);
  const [profile,setProfile]=useState({name:stored?.name||'',email:stored?.email||'',phone:stored?.phone||''});
  const [password,setPassword]=useState({currentPassword:'',password:'',confirmPassword:''});
  const [saving,setSaving]=useState('');

  const updateStoredUser=data=>{
    localStorage.setItem('user',JSON.stringify(data));setUser(data);
    window.dispatchEvent(new Event('smartbus-user-updated'));
  };
  const uploadAvatar=async event=>{
    const file=event.target.files?.[0];event.target.value='';
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast.error('Use a PNG, JPEG, or WebP image.');return;}
    if(file.size>5*1024*1024){toast.error('Profile photo must be 5 MB or smaller.');return;}
    setSaving('avatar');
    try {
      const {data}=await api.put('/auth/avatar',file,{headers:{'Content-Type':file.type}});
      updateStoredUser(data.user);window.dispatchEvent(new Event('smartbus-avatar-updated'));toast.success(data.message);
    } catch(error){toast.error(error.response?.data?.error||'Unable to upload profile photo.');}
    finally{setSaving('');}
  };
  const removeAvatar=async()=>{
    setSaving('avatar');
    try {
      const {data}=await api.delete('/auth/avatar');updateStoredUser(data.user);
      window.dispatchEvent(new Event('smartbus-avatar-updated'));toast.success(data.message);
    } catch(error){toast.error(error.response?.data?.error||'Unable to remove profile photo.');}
    finally{setSaving('');}
  };

  const saveProfile=async event=>{
    event.preventDefault();setSaving('profile');
    try {
      const {data}=await api.put('/auth/profile',profile);
      updateStoredUser(data.user);
      toast.success(data.message);
    } catch(error){toast.error(error.response?.data?.error||'Unable to update profile.');}
    finally{setSaving('');}
  };
  const savePassword=async event=>{
    event.preventDefault();setSaving('password');
    try {
      const {data}=await api.put('/auth/password',password);
      localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));
      setPassword({currentPassword:'',password:'',confirmPassword:''});
      window.dispatchEvent(new Event('smartbus-user-updated'));toast.success(data.message);
    } catch(error){toast.error(error.response?.data?.error||'Unable to change password.');}
    finally{setSaving('');}
  };

  return <div className="management-page profile-page">
    <header className="management-heading"><div><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Profile management</h1><p>Keep your personal details and sign-in password up to date.</p></div></header>
    <section className="profile-summary">
      <ProfileAvatar user={user} className="profile-avatar-large"/>
      <div><h2>{user?.name}</h2><p>{roleLabel(user?.role)}</p><div className="avatar-actions"><label className="secondary-button"><Camera size={15}/>{saving==='avatar'?'Uploading...':user?.has_avatar?'Change photo':'Add photo'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={!!saving} onChange={uploadAvatar}/></label>{user?.has_avatar&&<button type="button" className="avatar-remove" disabled={!!saving} onClick={removeAvatar}><Trash2 size={15}/>Remove</button>}</div><small className="avatar-help">PNG, JPEG or WebP · maximum 5 MB</small></div>
      <div className="profile-meta"><span><ShieldCheck size={16}/>{roleLabel(user?.role)}</span><span><Building2 size={16}/>{user?.role==='superadmin'?'All institutes':user?.institute_name||'Institute not assigned'}</span></div>
    </section>
    <div className="profile-grid">
      <section className="management-panel profile-panel"><div className="profile-panel-title"><UserRound size={20}/><div><h2>Personal information</h2><p>Used across your SmartBus workspace.</p></div></div>
        <form className="management-form" onSubmit={saveProfile}>
          <label>Full name<div className="profile-input"><UserRound size={17}/><input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} required maxLength={160}/></div></label>
          <label>Email address<div className="profile-input"><Mail size={17}/><input type="email" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})} required maxLength={254}/></div></label>
          <label>Phone number<div className="profile-input"><Phone size={17}/><input type="tel" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} maxLength={30} placeholder="Optional contact number"/></div></label>
          <div className="form-actions"><button className="primary-button" disabled={!!saving}>{saving==='profile'?'Saving...':'Save profile'}</button></div>
        </form>
      </section>
      <section className="management-panel profile-panel"><div className="profile-panel-title"><KeyRound size={20}/><div><h2>Change password</h2><p>Confirm your current password before setting a new one.</p></div></div>
        <form className="management-form" onSubmit={savePassword}>
          <PasswordField label="Current password" value={password.currentPassword} onChange={e=>setPassword({...password,currentPassword:e.target.value})} autoComplete="current-password" required/>
          <PasswordField label="New password" value={password.password} onChange={e=>setPassword({...password,password:e.target.value})} autoComplete="new-password" minLength={8} required/>
          <PasswordField label="Confirm new password" value={password.confirmPassword} onChange={e=>setPassword({...password,confirmPassword:e.target.value})} autoComplete="new-password" minLength={8} required/>
          <p className="form-note">Use at least 8 characters and choose a password different from your current one.</p>
          <div className="form-actions"><button className="primary-button" disabled={!!saving}>{saving==='password'?'Updating...':'Change password'}</button></div>
        </form>
      </section>
    </div>
  </div>;
}
