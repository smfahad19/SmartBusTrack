import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BusFront } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/signup', { name, email, password, role: 'student' });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Track your bus location in real-time',
    'Get alerts when bus is nearby',
    'View all campus routes & stops',
    'Zero setup — just sign up & go',
  ];

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <motion.div
        style={styles.leftPanel}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <img src="/auth_bus_hero.png" alt="SmartBus" style={styles.bgImage} />
        <div style={styles.imageOverlay} />

        <div style={styles.leftContent}>
          {/* Brand */}
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <BusFront size={22} color="#fff" />
            </div>
            <span style={styles.brandName}>SmartBus</span>
          </div>

          {/* Heading */}
          <div>
            <h2 style={styles.tagline}>Join Thousands of</h2>
            <h2 style={{ ...styles.tagline, color: '#60a5fa' }}>Smart Students.</h2>
            <p style={styles.taglineSub}>
              Create your free account and never miss your bus again.
            </p>
          </div>

          {/* Benefits list */}
          <div style={styles.benefitsList}>
            {benefits.map((b) => (
              <div key={b} style={styles.benefitItem}>
                <CheckCircle2 size={17} color="#34d399" style={{ flexShrink: 0 }} />
                <span style={styles.benefitText}>{b}</span>
              </div>
            ))}
          </div>

          {/* Divider quote */}
          <div style={styles.quoteBox}>
            <p style={styles.quoteText}>
              "SmartBus has completely changed how I commute to campus every day."
            </p>
            <span style={styles.quoteAuthor}>— Sarah K., 3rd Year Student</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        style={styles.rightPanel}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formIconWrap}>
              <UserPlus size={26} color="#34d399" />
            </div>
            <h1 style={styles.formTitle}>Create Account</h1>
            <p style={styles.formSubtitle}>Register as a SmartBus student</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={styles.form}>
            {/* Full Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrap}>
                <User size={16} color="#6b7280" style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Ali Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#34d399'}
                  onBlur={e => e.target.style.borderColor = '#2d2d3a'}
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#6b7280" style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#34d399'}
                  onBlur={e => e.target.style.borderColor = '#2d2d3a'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#6b7280" style={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: '48px' }}
                  onFocus={e => e.target.style.borderColor = '#34d399'}
                  onBlur={e => e.target.style.borderColor = '#2d2d3a'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  {showPass ? <EyeOff size={16} color="#6b7280" /> : <Eye size={16} color="#6b7280" />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={styles.strengthBar}>
                  <div style={{
                    ...styles.strengthFill,
                    width: password.length < 4 ? '25%' : password.length < 6 ? '55%' : '100%',
                    backgroundColor: password.length < 4 ? '#ef4444' : password.length < 6 ? '#f59e0b' : '#34d399',
                  }} />
                </div>
              )}
            </div>

            {/* Role badge */}
            <div style={styles.roleBadge}>
              <span style={styles.roleDot} />
              <span style={styles.roleText}>Registering as <strong style={{ color: '#34d399' }}>Student</strong></span>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(52,211,153,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Creating account...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>Sign in here</Link>
          </p>
          <p style={{ ...styles.footerText, marginTop: '8px' }}>
            <Link to="/" style={{ ...styles.footerLink, color: '#a78bfa' }}>← Back to Home</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#09090f',
    fontFamily: "'Inter', sans-serif",
  },
  leftPanel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    filter: 'hue-rotate(120deg) saturate(0.9)',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(9,9,15,0.55) 0%, rgba(5,30,20,0.82) 100%)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 10,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  tagline: {
    margin: '0',
    fontSize: '40px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.15',
    letterSpacing: '-1px',
  },
  taglineSub: {
    marginTop: '14px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    lineHeight: '1.6',
    maxWidth: '360px',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  benefitText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
  },
  quoteBox: {
    borderLeft: '3px solid rgba(52,211,153,0.5)',
    paddingLeft: '16px',
  },
  quoteText: {
    margin: '0 0 8px',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '13.5px',
    fontStyle: 'italic',
    lineHeight: '1.6',
  },
  quoteAuthor: {
    color: '#34d399',
    fontSize: '12px',
    fontWeight: '600',
  },
  rightPanel: {
    width: '500px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    backgroundColor: '#09090f',
    borderLeft: '1px solid #1a1a2e',
  },
  formCard: {
    width: '100%',
    maxWidth: '420px',
  },
  formHeader: {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'rgba(52,211,153,0.1)',
    border: '1px solid rgba(52,211,153,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  formTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-0.5px',
  },
  formSubtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.3px',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 42px',
    backgroundColor: '#111120',
    border: '1.5px solid #2d2d3a',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  strengthBar: {
    marginTop: '6px',
    height: '3px',
    backgroundColor: '#2d2d3a',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.3s, background-color 0.3s',
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(52,211,153,0.06)',
    border: '1px solid rgba(52,211,153,0.18)',
    borderRadius: '10px',
  },
  roleDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#34d399',
    flexShrink: 0,
  },
  roleText: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#6b7280',
    fontSize: '13.5px',
  },
  footerLink: {
    color: '#34d399',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Signup;
