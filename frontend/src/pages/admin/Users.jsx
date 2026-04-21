import { useEffect, useState, useCallback } from 'react';
import apiClient from '../../api/client';

function UserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'AGENT' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiClient.post('users/', form);
      onSaved();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create User</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. alice" required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="AGENT">Field Agent</option>
                <option value="ADMIN">Admin (Coordinator)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" required />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('users/');
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const admins = users.filter(u => u.role === 'ADMIN');
  const agents = users.filter(u => u.role === 'AGENT');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">Manage coordinators and field agents.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add User
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Admins */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Coordinators</span>
              <span className="record-count">{admins.length}</span>
            </div>
            <div className="users-grid">
              {admins.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--earth3)', fontSize: 14 }}>No coordinators found.</div>
              ) : admins.map(u => <UserCard key={u.id} user={u} />)}
            </div>
          </div>

          {/* Agents */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Field Agents</span>
              <span className="record-count">{agents.length}</span>
            </div>
            <div className="users-grid">
              {agents.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--earth3)', fontSize: 14 }}>No agents yet. Add one above.</div>
              ) : agents.map(u => <UserCard key={u.id} user={u} />)}
            </div>
          </div>
        </div>
      )}

      {showCreate && <UserModal onClose={() => setShowCreate(false)} onSaved={load} />}
    </div>
  );
}

function UserCard({ user }) {
  const isAdmin = user.role === 'ADMIN';
  const initials = user.username.slice(0, 2).toUpperCase();
  const color = isAdmin ? '#3A6B4A' : '#3A5A8A';

  return (
    <div className="user-card">
      <div className="user-card-avatar" style={{ background: color }}>{initials}</div>
      <div className="user-card-body">
        <div className="user-card-name">{user.username}</div>
        <div className="user-card-email">{user.email || <em style={{ opacity: .5 }}>No email</em>}</div>
      </div>
      <span className={`badge ${isAdmin ? 'badge-green' : 'badge-blue'}`} style={{ flexShrink: 0 }}>
        {isAdmin ? 'Admin' : 'Agent'}
      </span>
    </div>
  );
}