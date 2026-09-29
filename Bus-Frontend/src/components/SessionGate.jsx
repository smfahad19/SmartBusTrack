import { useEffect, useState } from 'react';
import { api } from '../api';
export default function SessionGate({ children }) {
  const [ready, setReady] = useState(!localStorage.getItem('token'));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    let active = true;
    api.get('/auth/me').then(({ data }) => {
      if (!active) return;
      // A global administrator starts with all institutes, regardless of an old saved filter.
      if (data.role === 'superadmin') localStorage.removeItem('instituteScope');
      localStorage.setItem('user', JSON.stringify(data)); setReady(true);
    }).catch(err => { if (active) setError(err.response?.data?.error || 'Cannot connect to the server. Please refresh to retry.'); });
    return () => { active = false; };
  }, []);
  if (!ready) return <div className="theme-loading" role="status">{error || 'Loading your workspace...'}</div>;
  return children;
}
