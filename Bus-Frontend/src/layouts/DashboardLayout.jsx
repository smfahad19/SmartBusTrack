import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Map, Bus, Users, Route, LayoutDashboard, Menu, LogOut, X, ArrowUpRight, GraduationCap, Building2, UserRound, FileText, MessageSquare } from 'lucide-react';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import Brand from '../components/Brand';
import ProfileAvatar from '../components/ProfileAvatar';
import ContactNotifications from '../components/ContactNotifications';
import DialogHeader from '../components/DialogHeader';
const menus = {
  admin: [['Overview', LayoutDashboard, '/admin'], ['Map view', Map, '/admin/map'], ['Bus fleet', Bus, '/admin/buses'], ['Drivers', Users, '/admin/drivers'], ['Students', GraduationCap, '/admin/students'], ['Routes & stops', Route, '/admin/routes']],
  student: [['Live tracking', Map, '/student'], ['Routes & schedules', Route, '/student/buses']],
  driver: [['My journey', Bus, '/driver']]
};
export default function DashboardLayout({ role }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen,setLogoutOpen]=useState(false);
  const [scope, setScope] = useState(localStorage.getItem('instituteScope') || '');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('user')||'null'));
  useEffect(()=>{const refresh=()=>setUser(JSON.parse(localStorage.getItem('user')||'null'));window.addEventListener('smartbus-user-updated',refresh);return()=>window.removeEventListener('smartbus-user-updated',refresh);},[]);
  const items = [...menus[role], ...(user?.role === 'superadmin' ? [['Institutes & admins', Building2, '/admin/institutes'], ['Demo requests', MessageSquare, '/admin/contacts'], ['Policies & social', FileText, '/admin/policies']] : []), ['My profile', UserRound, `/${role}/profile`]];
  const changeScope = value => { localStorage.setItem('instituteScope', value); setScope(value); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('instituteScope'); setLogoutOpen(false); navigate('/login'); };
  return <div className="dashboard-shell">
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={'sidebar ' + (open ? 'is-open' : '')}><div className="sidebar-brand"><Brand /><button className="icon-button mobile-only" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button></div><span className="sidebar-label">{user?.role === 'superadmin' ? 'SUPER ADMIN PANEL' : role === 'admin' ? 'WORKSPACE' : 'YOUR CAMPUS'}</span><nav aria-label="Main navigation">{items.map(([title, Icon, path]) => <Link key={path} to={path} onClick={() => setOpen(false)} aria-current={pathname === path ? 'page' : undefined} className={'sidebar-link ' + (pathname === path ? 'active' : '')}><Icon size={20} /><span>{title}</span>{pathname === path && <span className="nav-indicator" />}</Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><span className="mini-icon"><Route size={21} /></span><strong>Every route, connected.</strong><p>Your campus journey, all in one place.</p><Link to="/">Explore SmartBus <ArrowUpRight size={15} /></Link></div><button className="logout-button" onClick={()=>{setOpen(false);setLogoutOpen(true);}}><LogOut size={18} /> Sign out</button></div></aside>
    <div className="dashboard-body"><header className="dashboard-topbar"><div className="topbar-breadcrumb"><button className="icon-button mobile-only" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={21} /></button><span className="role-label">{user?.role === 'superadmin' ? 'Super admin panel' : role + ' workspace'}</span><span className="breadcrumb-divider">/</span><strong>{items.find(([, , path]) => path === pathname)?.[0]}</strong></div><div className="topbar-actions">{user?.role==='superadmin'&&<ContactNotifications/>}<Link to={`/${role}/profile`} className="user-profile" aria-label="Open profile settings"><ProfileAvatar user={user} className="user-avatar"/><div><strong>{user?.name}</strong><span>{role === 'admin' ? (user?.role === 'superadmin' ? 'Global super administrator' : user?.institute_name || 'Institute admin') : role + ' account'}</span></div></Link></div></header><main className="dashboard-content"><div className="page-enter" key={pathname + scope}><Outlet context={{ scope, changeScope, isSuperadmin: user?.role === 'superadmin' }} /></div></main></div>
    <Dialog open={logoutOpen} onClose={()=>setLogoutOpen(false)} fullWidth maxWidth="xs" aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description"><DialogHeader id="logout-dialog-title" onClose={()=>setLogoutOpen(false)}>Confirm sign out</DialogHeader><DialogContent><div className="logout-confirmation"><span><LogOut size={27}/></span><h2>Sign out of your account?</h2><p id="logout-dialog-description">You will need to enter your email and password again to access your workspace.</p></div></DialogContent><DialogActions className="logout-dialog-actions"><button className="secondary-button" autoFocus onClick={()=>setLogoutOpen(false)}>Cancel</button><button className="danger-button logout-confirm-button" onClick={logout}><LogOut size={16}/>Sign out</button></DialogActions></Dialog>
  </div>;
}
