import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  Active:    { cls: 'badge-green', dot: '#3A6B4A' },
  'At Risk': { cls: 'badge-red',   dot: '#B84040' },
  Completed: { cls: 'badge-blue',  dot: '#3A5A8A' },
};

const STAGE_ORDER = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

function StagePips({ stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="stage-pips">
      {STAGE_ORDER.map((s, i) => (
        <div
          key={s}
          className={`stage-pip ${i < idx ? 'past' : i === idx ? 'current' : ''}`}
          title={s.charAt(0) + s.slice(1).toLowerCase()}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        apiClient.get('dashboard-stats/'),
        apiClient.get('fields/'),
      ]);
      setStats(s.data);
      setFields(f.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;

  const atRiskFields = fields.filter(f => f.computed_status === 'At Risk');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Season Overview</h1>
          <p className="page-subtitle">Good morning, {user?.username}. Here's your farm at a glance.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F4EC', color: '#3A6B4A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/>
              <path d="M9 3v15M15 6v15"/>
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Fields</span>
            <span className="stat-value">{stats?.total_fields ?? '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F4EC', color: '#3A6B4A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Active</span>
            <span className="stat-value" style={{ color: '#3A6B4A' }}>{stats?.status_breakdown.active ?? '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FDECEA', color: '#B84040' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">At Risk</span>
            <span className="stat-value" style={{ color: '#B84040' }}>{stats?.status_breakdown.at_risk ?? '—'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8EFF8', color: '#3A5A8A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Completed</span>
            <span className="stat-value" style={{ color: '#3A5A8A' }}>{stats?.status_breakdown.completed ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* At-Risk alert banner */}
      {atRiskFields.length > 0 && (
        <div className="alert-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>{atRiskFields.length} field{atRiskFields.length > 1 ? 's' : ''} need attention:</strong>
          {atRiskFields.map(f => <span key={f.id} className="alert-field-tag">{f.name}</span>)}
        </div>
      )}

      {/* Fields table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Fields</span>
          <span className="record-count">{fields.length} records</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Crop</th>
                <th>Agent</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Planted</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr><td colSpan={6} className="empty-cell">No fields found. Add fields in the Fields tab.</td></tr>
              ) : fields.map(f => {
                const sc = STATUS_CONFIG[f.computed_status] || STATUS_CONFIG.Active;
                return (
                  <tr key={f.id}>
                    <td className="td-name">{f.name}</td>
                    <td>{f.crop_type}</td>
                    <td className="td-muted">{f.assigned_agent_name || <span className="unassigned">Unassigned</span>}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className="stage-label">{f.current_stage.charAt(0) + f.current_stage.slice(1).toLowerCase()}</span>
                        <StagePips stage={f.current_stage} />
                      </div>
                    </td>
                    <td><span className={`badge ${sc.cls}`}><span className="badge-dot" style={{ background: sc.dot }} />{f.computed_status}</span></td>
                    <td className="td-muted">{new Date(f.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}