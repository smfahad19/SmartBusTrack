import { useEffect, useState } from 'react';
import { api } from '../api';

export default function ProfileAvatar({ user, className='' }) {
  const [source,setSource]=useState('');
  useEffect(()=>{
    let active=true;
    let objectUrl='';
    const load=async()=>{
      if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}
      if(!user?.has_avatar){if(active)setSource('');return;}
      try {
        const {data}=await api.get('/auth/avatar',{responseType:'blob'});
        objectUrl=URL.createObjectURL(data);if(active)setSource(objectUrl);
      } catch {if(active)setSource('');}
    };
    load();
    window.addEventListener('smartbus-avatar-updated',load);
    return()=>{active=false;window.removeEventListener('smartbus-avatar-updated',load);if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[user?.id,user?.has_avatar]);
  if(source)return <img className={className} src={source} alt={user?.name ? user.name+' profile' : 'Profile'} />;
  return <span className={className} aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase()||'U'}</span>;
}
