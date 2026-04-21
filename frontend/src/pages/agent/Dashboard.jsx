import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  Active:    { cls: 'badge-green', bg: '#E8F4EC', color: '#3A6B4A' },
  'At Risk': { cls: 'badge-red',   bg: '#FDECEA', color: '#B84040' },
  Completed: { cls: 'badge-blue',  bg: '#E8EFF8', color: '#3A5A8A' },
};

const STAGE_ORDER = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

function StageProgress({ stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="field-stage-track">
      {STAGE_ORDER.map((s, i) => (
        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            className={`field-stage-node ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}`}
          />
          <span style={{ fontSize: 10, color: i <= idx ? 'var(--green)' : 'var(--earth3)' }}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('fields/')
      .then(r => setFields(r.data))
      .finally(() => setLoading(false));
  }, []);

  const active    = fields.filter(f => f.computed_status === 'Active').length;
  const atRisk    = fields.filter(f => f.computed_status === 'At Risk').length;
  const completed = fields.filter(f => f.computed_status === 'Completed').length;

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Season</h1>
          <p className="page-subtitle">Welcome back, {user?.username}. You have {fields.length} field{fields.length !== 1 ? 's' : ''} assigned.</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EDE8DF', color: 'var(--earth2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><path d="M9 3v15M15 6v15"/></svg>
          </div>
          <div className="stat-body"><span className="stat-label">Total</span><span className="stat-value">{fields.length}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F4EC', color: '#3A6B4A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
          </div>
          <div className="stat-body"><span className="stat-label">Active</span><span className="stat-value" style={{ color: '#3A6B4A' }}>{active}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FDECEA', color: '#B84040' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="stat-body"><span className="stat-label">At Risk</span><span className="stat-value" style={{ color: '#B84040' }}>{atRisk}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8EFF8', color: '#3A5A8A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <div className="stat-body"><span className="stat-label">Harvested</span><span className="stat-value" style={{ color: '#3A5A8A' }}>{completed}</span></div>
        </div>
      </div>

      {/* At-risk alert */}
      {atRisk > 0 && (
        <div className="alert-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <strong>{atRisk} field{atRisk > 1 ? 's' : ''} flagged at risk.</strong> Log an update to let your coordinator know.
        </div>
      )}

      {/* Field cards */}
      {fields.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--earth3)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No fields assigned to you yet.</p>
          <p style={{ fontSize: 13 }}>Contact your coordinator to get fields assigned.</p>
        </div>
      ) : (
        <div className="field-cards-grid">
          {fields.map(f => {
            const sc = STATUS_CONFIG[f.computed_status] || STATUS_CONFIG.Active;
            return (
              <div key={f.id} className="field-card" onClick={() => navigate(`/agent/fields/${f.id}`)}>
                <div className="field-card-top">
                  <div>
                    <div className="field-card-name">{f.name}</div>
                    <div className="field-card-crop">{f.crop_type}</div>
                  </div>
                  <span className={`badge ${sc.cls}`}>{f.computed_status}</span>
                </div>
                <StageProgress stage={f.current_stage} />
                <div className="field-card-footer">
                  <span style={{ fontSize: 12, color: 'var(--earth3)' }}>
                    Planted {new Date(f.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--earth2)', fontWeight: 500 }}>
                    {f.updates?.length || 0} update{f.updates?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}