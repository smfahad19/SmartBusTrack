import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BusFront, Shield, Zap, MapPin, ArrowRight, Globe, Mail, Phone, Users, Clock, CheckCircle, HelpCircle, MessageSquare } from 'lucide-react';

const Landing = () => {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.brand}>
            <div style={styles.logoBox}>
              <BusFront size={24} color="#fff" />
            </div>
            <span style={styles.brandText}>SmartBus</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#about" style={styles.navItem}>About</a>
            <a href="#features" style={styles.navItem}>Features</a>
            <a href="#how-it-works" style={styles.navItem}>Process</a>
            <a href="#faq" style={styles.navItem}>FAQ</a>
            <Link to="/login" style={styles.loginBtn}>Sign In</Link>
            <Link to="/signup" style={styles.signupBtn}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={styles.heroText}
          >
            <span style={styles.badge}>Next Generation Transit</span>
            <h1 style={styles.mainTitle}>
              Campus Transit <br />
              <span style={styles.gradientText}>Perfected.</span>
            </h1>
            <p style={styles.heroSub}>
              Track your campus bus in real-time. SmartBus uses advanced GPS technology 
              to provide live location updates, estimated arrival times, and seamless route planning.
            </p>
            <div style={styles.ctaGroup}>
              <Link to="/signup" style={styles.primaryCta}>
                Join as Student <ArrowRight size={18} />
              </Link>
              <Link to="/login" style={styles.secondaryCta}>
                View Demo
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            style={styles.heroImageWrap}
          >
            <div style={styles.imageGlow} />
            <img src="/landing_hero.png" alt="SmartBus Dashboard" style={styles.heroImage} />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={styles.statsBar}>
        <div style={styles.statsInner}>
          {[
            { val: "5,000+", label: "Active Students" },
            { val: "12", label: "University Routes" },
            { val: "24/7", label: "Real-time Tracking" },
            { val: "99.9%", label: "Uptime" }
          ].map((s, i) => (
            <div key={i} style={styles.statBox}>
              <span style={styles.statVal}>{s.val}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.section}>
        <div style={styles.splitContent}>
          <div style={styles.textContent}>
            <span style={styles.subBadge}>Our Mission</span>
            <h2 style={styles.sectionTitle}>Making Campus Life Easier</h2>
            <p style={styles.sectionPara}>
              SmartBus was born from a simple problem: students waiting too long for buses without knowing where they are. 
              Our mission is to eliminate the guesswork from university transportation.
            </p>
            <div style={styles.pointList}>
              <div style={styles.point}>
                <CheckCircle size={20} color="#3b82f6" />
                <span>Proprietary GPS streaming technology</span>
              </div>
              <div style={styles.point}>
                <CheckCircle size={20} color="#3b82f6" />
                <span>Dedicated student & driver interfaces</span>
              </div>
              <div style={styles.point}>
                <CheckCircle size={20} color="#3b82f6" />
                <span>Optimized for low-bandwidth mobile networks</span>
              </div>
            </div>
          </div>
          <div style={styles.visualContent}>
            <div style={styles.glassCard}>
              <Users size={48} color="#3b82f6" />
              <h4 style={{ margin: '16px 0 8px' }}>Community Driven</h4>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Over 50 universities have adopted SmartBus for their campus transit needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Advanced Features</h2>
          <p style={styles.sectionSub}>Everything you need to navigate your campus.</p>
        </div>
        <div style={styles.featureGrid}>
          {[
            {
              icon: <MapPin size={24} color="#3b82f6" />,
              title: "Live GPS Tracking",
              desc: "Pinpoint accuracy for all active buses. See moving vehicles on a high-fidelity map."
            },
            {
              icon: <Clock size={24} color="#10b981" />,
              title: "ETA Predictions",
              desc: "Smart algorithms calculate arrival times based on traffic and historical data."
            },
            {
              icon: <Shield size={24} color="#f59e0b" />,
              title: "Security & Safety",
              desc: "Emergency SOS buttons for drivers and live ride-sharing for students."
            },
            {
              icon: <Zap size={24} color="#8b5cf6" />,
              title: "Instant Notifications",
              desc: "Get pushed alerts when your favorite bus is 2 minutes away from your stop."
            },
            {
              icon: <Users size={24} color="#ec4899" />,
              title: "Driver Dashboard",
              desc: "Simplified controls for drivers to start/stop tracking and manage routes."
            },
            {
              icon: <Globe size={24} color="#06b6d4" />,
              title: "Multi-Route Support",
              desc: "Manage multiple bus lines and shuttle services within a single unified platform."
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, borderColor: 'rgba(59,130,246,0.3)' }}
              style={styles.featureCard}
            >
              <div style={styles.featIconBox}>{feat.icon}</div>
              <h3 style={styles.featTitle}>{feat.title}</h3>
              <p style={styles.featDesc}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSub}>Simple 3-step process to get started.</p>
        </div>
        <div style={styles.processGrid}>
          {[
            { step: "01", title: "Create Account", desc: "Sign up as a student using your university email address." },
            { step: "02", title: "Select Route", desc: "Choose the bus route you want to track from the live list." },
            { step: "03", title: "Track & Travel", desc: "Watch the bus move live and reach your destination on time." }
          ].map((p, i) => (
            <div key={i} style={styles.processItem}>
              <span style={styles.stepNum}>{p.step}</span>
              <h3 style={styles.stepTitle}>{p.title}</h3>
              <p style={styles.stepDesc}>{p.desc}</p>
              {i < 2 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>What Users Say</h2>
        </div>
        <div style={styles.testimonialGrid}>
          {[
            { user: "Sarah J.", role: "Student", text: "Finally! I don't have to stand in the rain waiting for the bus anymore. I just check my phone and leave my dorm exactly on time." },
            { user: "Ahmed K.", role: "Student", text: "The map interface is so smooth. I can see multiple buses at once and pick the one that's less crowded." },
            { user: "David M.", role: "Driver", text: "As a driver, I love how easy it is to just press 'Start Route'. The students are happier because they know I'm coming." }
          ].map((t, i) => (
            <div key={i} style={styles.testiCard}>
              <MessageSquare size={20} color="#3b82f6" style={{ marginBottom: '16px' }} />
              <p style={styles.testiText}>"{t.text}"</p>
              <div style={styles.testiUser}>
                <div style={styles.avatar}>{t.user[0]}</div>
                <div>
                  <h4 style={{ margin: 0 }}>{t.user}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>FAQs</h2>
          <p style={styles.sectionSub}>Find answers to common questions.</p>
        </div>
        <div style={styles.faqList}>
          {[
            { q: "Is the app free for students?", a: "Yes, SmartBus is completely free for all university students and staff." },
            { q: "How accurate is the location tracking?", a: "We use GPS with GLONASS support, providing accuracy within 3-5 meters in most areas." },
            { q: "Can I use it on my phone?", a: "Absolutely. SmartBus is optimized for all mobile devices via web browser or our native apps." },
            { q: "How do I register my bus as a driver?", a: "Driver registration is managed by the university administration. Please contact your transport office." }
          ].map((f, i) => (
            <div key={i} style={styles.faqItem}>
              <div style={styles.faqQ}>
                <HelpCircle size={20} color="#3b82f6" />
                <span>{f.q}</span>
              </div>
              <p style={styles.faqA}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.ctaCard}>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Ready to start tracking?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', maxWidth: '500px' }}>Join over 5,000 students who use SmartBus every day to simplify their commute.</p>
          <Link to="/signup" style={styles.primaryCta}>Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <div style={styles.brand}>
              <div style={styles.logoBox}>
                <BusFront size={20} color="#fff" />
              </div>
              <span style={styles.brandText}>SmartBus</span>
            </div>
            <p style={styles.footerTag}>Revolutionizing university transportation through technology and real-time data.</p>
          </div>
          <div style={styles.footerLinks}>
            <div style={styles.linkCol}>
              <span style={styles.colTitle}>Product</span>
              <a href="#about" style={styles.link}>About</a>
              <a href="#features" style={styles.link}>Features</a>
              <a href="#how-it-works" style={styles.link}>Process</a>
            </div>
            <div style={styles.linkCol}>
              <span style={styles.colTitle}>Support</span>
              <a href="#faq" style={styles.link}>Help Center</a>
              <a href="#" style={styles.link}>Privacy Policy</a>
              <a href="#" style={styles.link}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <span style={styles.copyright}>© 2024 SmartBus Inc. All rights reserved.</span>
          <div style={styles.socials}>
            <Mail size={18} style={styles.socialIcon} />
            <Globe size={18} style={styles.socialIcon} />
            <Phone size={18} style={styles.socialIcon} />
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#050508',
    color: '#fff',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden',
  },
  nav: {
    padding: '20px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(5,5,8,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
  },
  brandText: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navItem: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  loginBtn: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 16px',
  },
  signupBtn: {
    backgroundColor: '#fff',
    color: '#000',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  hero: {
    padding: '120px 0 80px',
    position: 'relative',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '60px',
  },
  heroText: {
    flex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '99px',
    color: '#60a5fa',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '24px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: '64px',
    fontWeight: '900',
    lineHeight: '1.1',
    margin: '0 0 24px 0',
    letterSpacing: '-2px',
  },
  gradientText: {
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    color: '#94a3b8',
    lineHeight: '1.6',
    maxWidth: '500px',
    marginBottom: '40px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '16px',
  },
  primaryCta: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)',
  },
  secondaryCta: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  heroImageWrap: {
    flex: 1.2,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    borderRadius: '24px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 2,
  },
  imageGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    backgroundColor: '#3b82f6',
    filter: 'blur(100px)',
    opacity: 0.2,
    zIndex: 1,
  },
  statsBar: {
    padding: '60px 24px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  statsInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '40px',
    flexWrap: 'wrap',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: '150px',
  },
  statVal: {
    fontSize: '40px',
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  section: {
    padding: '100px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionAlt: {
    padding: '100px 24px',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  splitContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '80px',
    flexWrap: 'wrap',
  },
  textContent: {
    flex: 1,
    minWidth: '300px',
  },
  visualContent: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    justifyContent: 'center',
  },
  subBadge: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: '14px',
    textTransform: 'uppercase',
    marginBottom: '16px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  sectionPara: {
    color: '#94a3b8',
    lineHeight: '1.7',
    fontSize: '17px',
    marginBottom: '32px',
  },
  pointList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  point: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    color: '#cbd5e1',
  },
  glassCard: {
    padding: '48px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '32px',
    textAlign: 'center',
    maxWidth: '400px',
    backdropFilter: 'blur(10px)',
  },
  features: {
    padding: '100px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
    maxWidth: '700px',
    margin: '0 auto 60px',
  },
  sectionSub: {
    fontSize: '18px',
    color: '#94a3b8',
    marginTop: '16px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    padding: '40px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '24px',
    transition: 'all 0.3s ease',
  },
  featIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'rgba(59,130,246,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  featTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  featDesc: {
    color: '#94a3b8',
    lineHeight: '1.6',
    fontSize: '15px',
  },
  processGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '40px',
    flexWrap: 'wrap',
    marginTop: '40px',
  },
  processItem: {
    flex: 1,
    minWidth: '250px',
    position: 'relative',
    textAlign: 'center',
  },
  stepNum: {
    fontSize: '60px',
    fontWeight: '900',
    color: 'rgba(59,130,246,0.1)',
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
  },
  stepTitle: {
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 2,
  },
  stepDesc: {
    color: '#94a3b8',
    lineHeight: '1.6',
    position: 'relative',
    zIndex: 2,
  },
  stepLine: {
    position: 'absolute',
    top: '30px',
    right: '-20%',
    width: '40%',
    height: '1px',
    background: 'linear-gradient(to right, rgba(59,130,246,0.3), transparent)',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  testiCard: {
    padding: '32px',
    backgroundColor: '#0a0a0f',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  testiText: {
    fontSize: '16px',
    color: '#cbd5e1',
    lineHeight: '1.7',
    marginBottom: '24px',
    fontStyle: 'italic',
  },
  testiUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  faqList: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  faqItem: {
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  faqQ: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  faqA: {
    color: '#94a3b8',
    lineHeight: '1.6',
    paddingLeft: '32px',
  },
  finalCta: {
    padding: '100px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  ctaCard: {
    width: '100%',
    maxWidth: '900px',
    padding: '80px 40px',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footer: {
    padding: '100px 24px 40px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: '#030305',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '60px',
    flexWrap: 'wrap',
    gap: '40px',
  },
  footerBrand: {
    maxWidth: '300px',
  },
  footerTag: {
    marginTop: '20px',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  footerLinks: {
    display: 'flex',
    gap: '80px',
  },
  linkCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  colTitle: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#fff',
    marginBottom: '8px',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '40px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    color: '#475569',
    fontSize: '12px',
  },
  socials: {
    display: 'flex',
    gap: '20px',
  },
  socialIcon: {
    color: '#475569',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
};

export default Landing;
