import PageToolbar from '../../components/PageToolbar';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, connectSocket } from '../../api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Bus, Users, GraduationCap, Route, ArrowUpRight, Plus, MapPin, Building2, ChartNoAxesCombined } from 'lucide-react';

const chartColors={blue:'#3974ec',mint:'#21a982',amber:'#e49a31',slate:'#98a4b5',violet:'#8b6ee8'};

export default function AdminDashboard() {
  const isSuperadmin = JSON.parse(localStorage.getItem('user') || 'null')?.role === 'superadmin';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [stats, buses, students, routes, institutes] = await Promise.all([
          api.get('/buses/analytics'),
          api.get('/buses'),
          api.get('/auth/students'),
          api.get('/routes'),
          isSuperadmin ? api.get('/institutes') : Promise.resolve(null)
        ]);
        if (active) { setData({ ...stats.data, buses: buses.data, students: students.data, routes: routes.data, totalInstitutes: institutes?.data.length }); setError(''); }
      } catch { if (active) setError('Unable to load your fleet. Please refresh to try again.'); }
    };
    load();
    const socket = connectSocket();
    socket.on('connect', load);
    socket.on('statusUpdate', load);
    socket.on('busUpdated', load);
    return () => { active = false; socket.disconnect(); };
  }, [isSuperadmin]);
  const cards = [
    ...(isSuperadmin ? [{ title: 'Total institutes', value: data?.totalInstitutes, caption: 'Across the entire platform', icon: Building2, color: 'violet', category: 'INSTITUTES', unit: 'Institutes', path: '/admin/institutes', action: 'Manage institutes' }] : []),
    { title: 'Total buses', value: data?.totalBuses, caption: 'In your campus fleet', icon: Bus, color: 'blue', category: 'FLEET', unit: 'Buses', path: '/admin/buses', action: 'View fleet' },
    { title: 'Active status', value: data?.activeBuses, caption: 'Based on reported bus status', icon: MapPin, color: 'mint', category: 'OPERATIONS', unit: 'Active', path: '/admin/buses', action: 'View bus statuses' },
    { title: 'Drivers', value: data?.totalDrivers, caption: 'Registered driver accounts', icon: Users, color: 'amber', category: 'YOUR TEAM', unit: 'Drivers', path: '/admin/drivers', action: 'Manage drivers' },
    { title: 'Students', value: data?.totalStudents, caption: 'Connected to your campus', icon: GraduationCap, color: 'violet', category: 'COMMUNITY', unit: 'Students', path: '/admin/students', action: 'View students' }
  ];
  const buses=data?.buses||[];
  const delayed=buses.filter(bus=>/delay|traffic|breakdown|emergency/i.test(bus.status||'')).length;
  const active=buses.filter(bus=>!/delay|traffic|breakdown|emergency/i.test(bus.status||'')&&(/moving|arrived/i.test(bus.status||'')||bus.status==='On time')).length;
  const fleetChart=[{name:'Active',value:active,color:chartColors.mint},{name:'Delayed / issue',value:delayed,color:chartColors.amber},{name:'Other status',value:Math.max(0,buses.length-active-delayed),color:chartColors.slate}];
  const today=new Date().toISOString().slice(0,10);
  const expiring=data?.students?.filter(student=>student.status==='active'&&student.access_end&&student.access_end>=today&&(Date.parse(student.access_end)-Date.parse(today))<=30*86400000).length||0;
  const studentChart=[{name:'Active',value:Math.max(0,(data?.students?.filter(student=>student.status==='active').length||0)-expiring),color:chartColors.blue},{name:'Expiring',value:expiring,color:chartColors.amber},{name:'Suspended',value:data?.students?.filter(student=>student.status!=='active').length||0,color:chartColors.violet}];
  const routeChart=(data?.routes||[]).map(route=>({name:route.name.length>18?route.name.slice(0,17)+'…':route.name,buses:buses.filter(bus=>bus.route_id===route.id||bus.route===route.name).length})).sort((a,b)=>b.buses-a.buses).slice(0,6);
  return <div>
    <div className="overview-heading"><div><span className="overview-kicker">TRANSPORT OVERVIEW</span><h1>Dashboard overview</h1><p>Monitor fleet, people and routes across your selected institutes.</p></div></div>
    <PageToolbar><div className="form-actions"><DownloadPdfButton type="all">Download all data</DownloadPdfButton><Link to="/admin/buses" className="secondary-button"><Plus size={16} /> Manage fleet</Link></div></PageToolbar>
    {error && <div className="error-notice" role="alert">{error}</div>}
    <div className={'overview-stats' + (isSuperadmin ? ' superadmin-stats' : '')} aria-label="Campus statistics">
      {cards.map(({ title, value, caption, icon: Icon, color, unit, path, action }) => (
        <Link className={'stat-card metric-card metric-' + color} to={path} key={title} aria-label={title + ': ' + (value ?? (error ? 'unavailable' : 'loading')) + '. ' + action}>
          <Icon className="metric-watermark" size={118} strokeWidth={1} aria-hidden="true" />
          <div className="metric-heading">
            <span className="metric-icon"><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></span>
            <div><h2>{title}</h2></div>
          </div>
          <div className="metric-value-row">
            {value == null ? <span className={error ? 'metric-unavailable' : 'metric-skeleton'}>{error ? '--' : <span className="sr-only">Loading</span>}</span> : <strong className="metric-value" key={value}>{value.toLocaleString()}</strong>}
            <span className="metric-unit">{unit}</span>
          </div>
          <p className="metric-description">{caption}</p>
          <div className="metric-footer"><span><i aria-hidden="true" />{action}</span><ArrowUpRight size={17} aria-hidden="true" /></div>
        </Link>
      ))}
    </div>
    <section className="dashboard-insights" aria-labelledby="dashboard-insights-title"><div className="dashboard-insights-heading"><div><span className="overview-kicker">CLEAR, LIVE INSIGHTS</span><h2 id="dashboard-insights-title">Operations at a glance</h2></div><span><ChartNoAxesCombined size={16}/>Current database view</span></div>{!data?<p className="empty-state">{error?'Charts unavailable':'Preparing dashboard insights…'}</p>:<div className="dashboard-chart-grid">
      <article className="dashboard-chart-card fleet-chart-card"><header><div><h3>Fleet status</h3><p>Current reported status</p></div><strong>{buses.length}</strong></header><div className="donut-chart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={fleetChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={72} paddingAngle={3} stroke="none">{fleetChart.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip formatter={(value,name)=>[value+' buses',name]} contentStyle={{borderRadius:12,border:'1px solid #dfe5ee',fontSize:11}}/></PieChart></ResponsiveContainer><div className="donut-chart-center"><strong>{buses.length}</strong><span>Buses</span></div></div><div className="chart-legend">{fleetChart.map(item=><span key={item.name}><i style={{background:item.color}}/>{item.name}<strong>{item.value}</strong></span>)}</div></article>
      <article className="dashboard-chart-card"><header><div><h3>Student access</h3><p>Account availability</p></div><strong>{data.students.length}</strong></header><div className="compact-bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={studentChart} margin={{top:8,right:4,left:-18,bottom:0}}><CartesianGrid vertical={false} strokeDasharray="3 5" stroke="var(--workspace-border)"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:10}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:10}}/><Tooltip formatter={value=>[value+' students','Accounts']} cursor={{fill:'rgba(57,116,236,.05)'}} contentStyle={{borderRadius:12,border:'1px solid #dfe5ee',fontSize:11}}/><Bar dataKey="value" radius={[7,7,2,2]} maxBarSize={42}>{studentChart.map(item=><Cell key={item.name} fill={item.color}/>)}</Bar></BarChart></ResponsiveContainer></div></article>
      <article className="dashboard-chart-card route-chart-card"><header><div><h3>Route coverage</h3><p>Buses assigned per route</p></div><strong>{data.routes.length}</strong></header>{routeChart.length?<div className="route-bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={routeChart} layout="vertical" margin={{top:4,right:16,left:4,bottom:0}}><CartesianGrid horizontal={false} strokeDasharray="3 5" stroke="var(--workspace-border)"/><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:10}}/><YAxis type="category" dataKey="name" width={92} axisLine={false} tickLine={false} tick={{fill:'var(--muted)',fontSize:9}}/><Tooltip formatter={value=>[value+' buses','Assigned']} cursor={{fill:'rgba(57,116,236,.05)'}} contentStyle={{borderRadius:12,border:'1px solid #dfe5ee',fontSize:11}}/><Bar dataKey="buses" fill={chartColors.blue} radius={[0,7,7,0]} maxBarSize={18}/></BarChart></ResponsiveContainer></div>:<p className="chart-empty">No routes available yet.</p>}</article>
    </div>}</section>
    <div className="overview-columns"><section className="overview-panel"><div className="panel-title"><h2>Fleet overview</h2><Link to="/admin/buses">View all buses ?</Link></div>{!data ? <p className="empty-state">{error ? 'Fleet unavailable' : 'Loading your fleet?'}</p> : !data.buses.length ? <p className="empty-state">Your fleet starts here. Add your first bus to get moving.</p> : data.buses.slice(0, 5).map(bus => <div className="bus-overview-row" key={bus.id}><span className="mini-icon"><Bus size={20} /></span><div><strong>{bus.name}</strong><p>{bus.number_plate} ? {bus.route || 'Route unassigned'}</p></div><span className="status-pill">{bus.status || 'No status'}</span></div>)}</section>
    <section className="overview-panel"><div className="panel-title"><h2>Your workspace</h2><span className="overview-kicker">QUICK ACCESS</span></div>{[
      { title: 'Plan your routes', desc: 'Manage stops and scheduled times', path: '/admin/routes', icon: Route },
      { title: 'Manage your drivers', desc: 'Keep your transport team connected', path: '/admin/drivers', icon: Users },
      { title: 'Student community', desc: 'View and manage student accounts', path: '/admin/students', icon: GraduationCap }
    ].map(({ title, desc, path, icon: Icon }) => <Link to={path} className="quick-action" key={path}><span className="mini-icon"><Icon size={19} /></span><div><strong>{title}</strong><p>{desc}</p></div><ArrowUpRight size={18} /></Link>)}</section></div>
    <div className="overview-banner"><Route size={35} /><div><h3>Good journeys start with a little planning.</h3><p>Assign a driver and route to each bus so your campus community knows which way to go.</p></div></div>
  </div>;
}
