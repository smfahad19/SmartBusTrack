import RouteArtwork from '../components/RouteArtwork';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Radio, Route, Bell, ArrowUpRight, BusFront, CircleCheck, Headphones, LockKeyhole, ShieldCheck, Send, Menu, X, Clock, CalendarCheck } from 'lucide-react';
import Brand from '../components/Brand';
import DialogHeader from '../components/DialogHeader';
import { FacebookIcon, InstagramIcon } from '../components/SocialIcons';
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Dialog, DialogContent } from '@mui/material';
import { api, API_URL } from '../api';
const features = [
  { icon: Radio, number: '01', title: 'Know where your bus is.', description: 'Follow the location shared by your driver on a live map. No more guessing at the bus stop.', color: 'blue' },
  { icon: Route, number: '02', title: 'Find your way around.', description: 'Explore campus routes, scheduled stops, and assigned buses before you head out.', color: 'mint' },
  { icon: Bell, number: '03', title: 'Stay in the loop.', description: 'See arrival and traffic-delay updates from your driver as your journey unfolds.', color: 'peach' }
];
const serviceBenefits = [
  {icon:Clock,title:'Reduced waiting time',description:'Live bus visibility helps students leave at the right time instead of waiting without updates.'},
  {icon:ShieldCheck,title:'Improved student safety',description:'Authorised tracking and journey updates give students and transport teams better awareness.'},
  {icon:Radio,title:'Central fleet monitoring',description:'Administrators can view active buses, routes and location status from one operational dashboard.'},
  {icon:Route,title:'Route performance reports',description:'Journey and route information supports better scheduling and transport planning.'},
  {icon:Bell,title:'Delay & emergency alerts',description:'Important traffic, delay and emergency updates can reach the right users without confusion.'}
];
const emptyContact = {name:'',email:'',phone:'',organization:'',designation:'',message:'',website:''};
export default function Landing() {
  const {scrollYProgress}=useScroll();
  const scrollProgress=useSpring(scrollYProgress,{stiffness:140,damping:30,mass:.25});
  const [policies,setPolicies]=useState({});
  const [social,setSocial]=useState({facebook:'',instagram:''});
  const [contact,setContact]=useState(emptyContact);
  const [contactState,setContactState]=useState({type:'idle',message:''});
  const [menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{Promise.all([api.get('/policies'),api.get('/policies/social')]).then(([policyResponse,socialResponse])=>{setPolicies(Object.fromEntries(policyResponse.data.map(item=>[item.type,item])));setSocial(socialResponse.data);}).catch(()=>{});},[]);
  useEffect(()=>{
    if(!menuOpen)return undefined;
    const closeMenu=event=>{if(event.key==='Escape'||window.innerWidth>900)setMenuOpen(false);};
    window.addEventListener('keydown',closeMenu);window.addEventListener('resize',closeMenu);
    return()=>{window.removeEventListener('keydown',closeMenu);window.removeEventListener('resize',closeMenu);};
  },[menuOpen]);
  const policyUrl=type=>policies[type]?`${API_URL}/api/policies/${type}/pdf`:null;
  const submitContact=async event=>{
    event.preventDefault();setContactState({type:'loading',message:''});
    try{const {data}=await api.post('/contacts',contact);setContact(emptyContact);setContactState({type:'success',message:data.message});}
    catch(error){setContactState({type:'error',message:error.response?.data?.error||'Unable to submit your request. Please try again.'});}
  };
  const updateContact=event=>setContact(current=>({...current,[event.target.name]:event.target.value}));
  const reveal={initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.18},transition:{duration:.62,ease:[.2,.7,.2,1]}};
  return <div className="landing-page">
    <header className={'landing-header '+(menuOpen?'menu-open':'')}><motion.div className="landing-scroll-progress" style={{scaleX:scrollProgress}}/><nav className="landing-nav" aria-label="Main navigation"><a className="landing-brand-link" href="#top" aria-label="SmartTrack home"><Brand /></a><div className={'landing-links '+(menuOpen?'open':'')} id="landing-menu"><div className="landing-mobile-menu-title"><span>Explore SmartTrack</span><small>Campus transport, made simpler.</small></div><a href="#features" onClick={()=>setMenuOpen(false)}><Radio className="nav-link-icon" size={18}/><span>Why SmartTrack</span></a><a href="#benefits" onClick={()=>setMenuOpen(false)}><ShieldCheck className="nav-link-icon" size={18}/><span>Benefits</span></a><a href="#how-it-works" onClick={()=>setMenuOpen(false)}><Route className="nav-link-icon" size={18}/><span>How it works</span></a><a href="#contact" onClick={()=>setMenuOpen(false)}><CalendarCheck className="nav-link-icon" size={18}/><span>Book demo</span></a><Link className="primary-button small-button" to="/login"><span>Sign in</span><ArrowUpRight size={17} /></Link></div><button className="landing-menu-toggle" type="button" aria-label={menuOpen?'Close navigation menu':'Open navigation menu'} aria-expanded={menuOpen} aria-controls="landing-menu" onClick={()=>setMenuOpen(value=>!value)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button></nav>{menuOpen&&<button className="landing-menu-backdrop" type="button" aria-label="Close navigation menu" onClick={()=>setMenuOpen(false)}/>}</header>
    <main>
      <motion.section id="top" className="landing-hero" initial="hidden" animate="visible" variants={{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}}}>
        <div className="hero-ambient" aria-hidden="true"><span/><span/><span/></div>
        <motion.div className="hero-copy" variants={{hidden:{opacity:0,y:22},visible:{opacity:1,y:0,transition:{duration:.62}}}}><span className="eyebrow hero-eyebrow"><span className="status-dot" /> YOUR CAMPUS. IN MOTION.</span><h1>Less waiting.<br />More <span>living.</span></h1><p>Your bus, your route, your day. See your campus shuttle on the map and head out with a little more confidence.</p><div className="hero-actions"><Link to="/login" className="primary-button">Sign in <ArrowRight size={19} /></Link><a href="#how-it-works" className="secondary-button">See how it works</a></div><div className="hero-caption"><span className="mini-icon"><BusFront size={19} /></span><span>Built for campus life.<br /><strong>Made for everyone on the move.</strong></span></div></motion.div>
        <div className="hero-visual"><div className="hero-orbit" aria-hidden="true"><span/><span/></div><div className="hero-photo"><RouteArtwork /><div className="hero-photo-label"><span>THE WAY FORWARD</span><strong>A better everyday journey.</strong></div></div><div className="floating-route"><span className="route-icon"><Route size={22} /></span><div><strong>Campus, connected.</strong><span>Routes & stops in one place</span></div><ArrowUpRight size={20} /></div><div className="floating-map"><MapPin size={19} /><span>Your next stop.<strong>One glance away.</strong></span></div></div>
      </motion.section>
      <motion.div {...reveal} className="feature-strip premium-feature-strip"><span>Small details. Better commutes.</span><span><Radio size={19} /> Live location</span><span><Route size={19} /> Route schedules</span><span><Bell size={19} /> Journey updates</span></motion.div>
      <motion.section {...reveal} id="features" className="landing-section"><div className="section-heading"><div><span className="eyebrow">EVERYTHING IN ONE PLACE</span><h2>A smoother ride<br />starts here.</h2></div><p>From your first lecture to your last stop, keep the information you need close at hand.</p></div><div className="feature-cards">{features.map(({ icon: Icon, number, title, description, color },index) => <motion.article initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}} transition={{duration:.48,delay:index*.09}} className={'feature-card ' + color} key={number}><div className="feature-card-top"><span className="feature-icon"><Icon size={25} /></span><span>{number}</span></div><h3>{title}</h3><p>{description}</p></motion.article>)}</div></motion.section>
      <motion.section {...reveal} id="benefits" className="benefits-section"><div className="benefits-heading"><div><span className="eyebrow">BUILT FOR BETTER JOURNEYS</span><h2>Smarter transport.<br/>Meaningful results.</h2></div><p>SmartTrack turns live transport information into a safer, more predictable campus experience for everyone.</p></div><div className="benefits-grid">{serviceBenefits.map(({icon:Icon,title,description},index)=><motion.article className="benefit-card" key={title} initial={{opacity:0,y:24,scale:.97}} whileInView={{opacity:1,y:0,scale:1}} viewport={{once:true,amount:.3}} transition={{duration:.48,delay:index*.07}}><span className="benefit-icon"><Icon size={22}/></span><span className="benefit-number">0{index+1}</span><h3>{title}</h3><p>{description}</p></motion.article>)}</div></motion.section>
      <motion.section {...reveal} id="how-it-works" className="journey-section"><div><span className="eyebrow">LESS SETUP. MORE GO.</span><h2>You're three steps<br />from a smarter commute.</h2></div><div className="journey-steps">{[['Get access', 'Your institute administrator creates and activates your student account.'], ['Choose your route', 'Browse the schedule and find your campus bus.'], ['Track and travel', 'Open the live map and follow your journey.']].map(([title, desc], i) => <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.45,delay:i*.09}} className="journey-step" key={title}><span>{i + 1}</span><div><h3>{title}</h3><p>{desc}</p></div></motion.div>)}</div></motion.section>
      <motion.section {...reveal} className="landing-cta"><span className="cta-orb" aria-hidden="true"/><div><span className="eyebrow">NEXT STOP: A BETTER DAY</span><h2>Campus life moves fast.<br />Keep up with SmartBus.</h2></div><Link to="/login" className="primary-button">Sign in <ArrowRight size={19} /></Link></motion.section>
      <motion.section {...reveal} id="contact" className="contact-section" aria-labelledby="contact-title">
        <div className="contact-section-copy"><span className="contact-section-icon"><CalendarCheck size={24}/></span><span className="eyebrow">FREE SMARTTRACK DEMO</span><h2 id="contact-title">See SmartTrack in action.</h2><p>Book a free, no-obligation demo for your institute. Our team will walk you through live bus tracking, route management, student access and administration tools.</p><span className="demo-free-note"><CircleCheck size={18}/><span><strong>Totally free within Lahore</strong><small>No demo fee or visit charges.</small></span></span><div className="contact-support-details"><span><Clock size={17}/><span><small>EXPECTED RESPONSE</small><strong>Within 1 business day</strong></span></span><span><Headphones size={17}/><span><small>DEMO AVAILABILITY</small><strong>Mon–Sat, 9 AM–6 PM (PKT)</strong></span></span></div><span className="contact-privacy-note"><ShieldCheck size={15}/>Your demo request is visible only to the super administrator.</span></div>
        <form className="contact-form" onSubmit={submitContact}>
          <div className="contact-form-heading"><strong>Request your free demo</strong><span>Free • No obligation</span></div>
          <div className="contact-form-grid"><label>Full name<input required maxLength={160} name="name" autoComplete="name" value={contact.name} onChange={updateContact} placeholder="Your full name"/></label><label>Email address<input required maxLength={254} type="email" name="email" autoComplete="email" value={contact.email} onChange={updateContact} placeholder="you@example.com"/></label></div>
          <label>Contact number<input required maxLength={30} name="phone" autoComplete="tel" value={contact.phone} onChange={updateContact} placeholder="+92 300 1234567"/></label>
          <div className="contact-form-grid"><label><span>Institute name <small className="optional-field">Optional</small></span><input maxLength={160} name="organization" autoComplete="organization" value={contact.organization} onChange={updateContact} placeholder="Your institute or organisation"/></label><label><span>Designation <small className="optional-field">Optional</small></span><input maxLength={120} name="designation" autoComplete="organization-title" value={contact.designation} onChange={updateContact} placeholder="e.g. Transport Manager"/></label></div>
          <label>What would you like to see in the demo?<textarea required maxLength={2000} rows={5} name="message" value={contact.message} onChange={updateContact} placeholder="Tell us about your institute, fleet, or the features you want to explore."/></label>
          <label className="contact-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" name="website" value={contact.website} onChange={updateContact}/></label>
          {contactState.type==='error'&&<p className="contact-message error" role="alert">{contactState.message}</p>}
          <button className="contact-submit" disabled={contactState.type==='loading'}>{contactState.type==='loading'?'Booking demo...':<>Book free demo <Send size={17}/></>}</button>
        </form>
      </motion.section>
    </main><footer className="site-footer">
      <div className="footer-main">
        <section className="footer-brand-column" aria-label="About SmartTrack"><Brand/><p>Real-time campus transport tracking for safer, smarter everyday journeys.</p><span className="footer-status"><span className="status-dot"/>Live transport platform</span>{(social.facebook||social.instagram)&&<div className="footer-social-links" aria-label="SmartTrack social media">{social.facebook&&<a href={social.facebook} target="_blank" rel="noreferrer" aria-label="SmartTrack on Facebook" title="Facebook"><FacebookIcon size={17}/></a>}{social.instagram&&<a href={social.instagram} target="_blank" rel="noreferrer" aria-label="SmartTrack on Instagram" title="Instagram"><InstagramIcon size={17}/></a>}</div>}</section>
        <nav className="footer-column" aria-label="Explore SmartTrack"><h3>Explore</h3><a href="#features">Why SmartTrack</a><a href="#how-it-works">How it works</a><Link to="/login">Live bus tracking</Link></nav>
        <nav className="footer-column" aria-label="Transport portals"><h3>Transport portal</h3><Link to="/login">Student access</Link><Link to="/login">Driver access</Link><Link to="/login">Admin access</Link></nav>
        <section className="footer-column footer-support"><h3>Support</h3><Link to="/login"><LockKeyhole size={15}/>Account access</Link><a href="#how-it-works"><Headphones size={15}/>Tracking help</a><a href="#contact"><CalendarCheck size={15}/>Book a free demo</a><span><CircleCheck size={15}/>Account issues are handled by your institute administrator.</span></section>
      </div>
      <div className="footer-policies">
        <details id="location-privacy"><summary><ShieldCheck size={15}/>Location privacy</summary><p>Live bus location is used for transport tracking and is visible only through authorised SmartTrack accounts. Drivers control mobile GPS sharing.</p>{policyUrl('privacy')&&<a href={policyUrl('privacy')} target="_blank" rel="noreferrer">Read the full Privacy Policy <ArrowUpRight size={14}/></a>}</details>
        <details id="terms"><summary>Terms of use</summary><p>Use SmartTrack only for authorised campus transport operations. Account access is issued and managed by participating institutes.</p>{policyUrl('terms')&&<a href={policyUrl('terms')} target="_blank" rel="noreferrer">Read the full Terms of Use <ArrowUpRight size={14}/></a>}</details>
      </div>
      <div className="footer-bottom"><div><a href={policyUrl('privacy')||'#location-privacy'} target={policyUrl('privacy')?'_blank':undefined} rel={policyUrl('privacy')?'noreferrer':undefined}>Privacy</a><a href={policyUrl('terms')||'#terms'} target={policyUrl('terms')?'_blank':undefined} rel={policyUrl('terms')?'noreferrer':undefined}>Terms</a></div><span className="footer-copyright">© {new Date().getFullYear()} SmartTrack. All rights reserved.</span><span className="footer-made">Built for campus transport.</span></div>
    </footer>
    <Dialog open={contactState.type==='success'} onClose={()=>setContactState({type:'idle',message:''})} fullWidth maxWidth="xs" aria-labelledby="contact-success-title"><DialogHeader id="contact-success-title" onClose={()=>setContactState({type:'idle',message:''})}>Demo request submitted</DialogHeader><DialogContent><div className="contact-success-popup"><span><CircleCheck size={34}/></span><h2>Thank you!</h2><p>{contactState.message||'Your free demo request has been submitted successfully. Our team will contact you soon to arrange a suitable time.'}</p><button className="primary-button" onClick={()=>setContactState({type:'idle',message:''})}>Done</button></div></DialogContent></Dialog>
  </div>;
}
