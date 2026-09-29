import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { BusFront, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'driver') navigate('/driver');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT PANEL — Image + Branding */}
      <motion.div
        style={styles.leftPanel}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <img src="/auth_bus_hero.png" alt="Smart Bus" style={styles.bgImage} />
        <div style={styles.imageOverlay} />

        <div style={styles.leftContent}>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <BusFront size={22} color="#fff" />
            </div>
            <span style={styles.brandName}>SmartBus</span>
          </div>

          <div style={styles.taglineBox}>
            <h2 style={styles.tagline}>Track Your Bus.</h2>
            <h2 style={styles.tagline}>In Real Time.</h2>
            <p style={styles.taglineSub}>
              Safe, smart and seamless campus transportation for students and staff.
            </p>
          </div>

          <div style={styles.statsRow}>
            {[['500+', 'Students'], ['20+', 'Routes'], ['98%', 'On-Time']].map(([val, label]) => (
              <div key={label} style={styles.statItem}>
                <span style={styles.statVal}>{val}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL — Login Form */}
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
              <BusFront size={26} color="#3b82f6" />
            </div>
            <h1 style={styles.formTitle}>Welcome Back</h1>
            <p style={styles.formSubtitle}>Sign in to your SmartBus account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#6b7280" style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: '48px' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
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
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(59,130,246,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Signing in...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={styles.footerText}>
            New student?{' '}
            <Link to="/signup" style={styles.footerLink}>Create your account</Link>
          </p>
          <p style={styles.footerText} className="mt-1">
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
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(9,9,15,0.55) 0%, rgba(15,23,60,0.75) 100%)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 10,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
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
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
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
  taglineBox: {},
  tagline: {
    margin: '0',
    fontSize: '42px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.15',
    letterSpacing: '-1px',
  },
  taglineSub: {
    marginTop: '14px',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '15px',
    lineHeight: '1.6',
    maxWidth: '380px',
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statVal: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#60a5fa',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  rightPanel: {
    width: '480px',
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
    maxWidth: '400px',
  },
  formHeader: {
    marginBottom: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  formIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.25)',
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
    gap: '20px',
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
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
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
    color: '#60a5fa',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Login;
