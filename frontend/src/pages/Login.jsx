import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_USERS = [
  { label: 'Admin / Coordinator', username: 'admin', password: 'admin123', role: 'ADMIN', color: '#3A6B4A' },
  { label: 'Field Agent — Alice', username: 'alice', password: 'agent123', role: 'AGENT', color: '#C17E3A' },
  { label: 'Field Agent — Bob',   username: 'bob',   password: 'agent123', role: 'AGENT', color: '#3A5A8A' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/agent', { replace: true });
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  };

  return (
    <div className="login-root">
      {/* Left panel – branding */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-leaf-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
            </svg>
          </div>
          <h1 className="login-brand">SmartSeason</h1>
          <p className="login-tagline">Field Monitoring System</p>
          <p className="login-desc">
            Track crop progress, monitor field stages, and coordinate agents across your entire growing season — all in one place.
          </p>

          {/* Stage lifecycle visual */}
          <div className="lifecycle-row">
            {['Planted', 'Growing', 'Ready', 'Harvested'].map((s, i) => (
              <div key={s} className="lifecycle-step">
                <div className={`lifecycle-dot ${i < 2 ? 'done' : i === 2 ? 'current' : ''}`} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to your account to continue</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-section">
            <div className="demo-divider"><span>Demo credentials</span></div>
            <div className="demo-cards">
              {DEMO_USERS.map(u => (
                <button
                  key={u.username}
                  className="demo-card"
                  onClick={() => fillDemo(u)}
                  style={{ '--accent': u.color }}
                >
                  <div className="demo-avatar" style={{ background: u.color }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="demo-name">{u.label}</div>
                    <div className="demo-creds">{u.username} / {u.password}</div>
                  </div>
                  <svg className="demo-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}