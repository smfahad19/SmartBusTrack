import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export default function PasswordField({ label, icon: Icon, ...props }) {
 const [visible,setVisible]=useState(false);
 return <div className={'password-control '+(Icon?'has-leading-icon':'')}><label><span>{label}</span><span className="password-input-wrap">{Icon&&<Icon className="password-leading-icon" size={17} aria-hidden="true"/>}<input {...props} type={visible?'text':'password'}/><button type="button" aria-label={(visible?'Hide ':'Show ')+label} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label></div>;
}
