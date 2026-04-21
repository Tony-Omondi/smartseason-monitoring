import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const STATUS_CONFIG = {
  Active:    { cls: 'badge-green' },
  'At Risk': { cls: 'badge-red'   },
  Completed: { cls: 'badge-blue'  },
};

const STAGE_ORDER = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

function StageBar({ stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {STAGE_ORDER.map((s, i) => (
        <div
          key={s}
          style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= idx ? (i === idx ? 'var(--amber)' : 'var(--green)') : 'var(--cream2)',
            transition: 'background .2s',
          }}
          title={s}
        />
      ))}
    </div>
  );
}

export default function AgentMyFields() {
  const navigate = useNavigate();
  const [fields, setFields]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    apiClient.get('fields/')
      .then(r => setFields(r.data))
      .finally(() => setLoading(false));
  }, []);

  const visible = fields.filter(f => {
    const q = search.toLowerCase();
    const matchQ = !q || f.name.toLowerCase().includes(q) || f.crop_type.toLowerCase().includes(q);
    const matchF = !filter || f.computed_status === filter;
    return matchQ && matchF;
  });

  if (loading) return <div className="page-loading"><span className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Fields</h1>
          <p className="page-subtitle">{fields.length} field{fields.length !== 1 ? 's' : ''} assigned to you.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input filter-search" placeholder="Search fields or crops…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {['', 'Active', 'At Risk', 'Completed'].map(v => (
            <button
              key={v}
              className={`filter-pill ${filter === v ? 'active' : ''}`}
              onClick={() => setFilter(v)}
            >
              {v || 'All'}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--earth3)' }}>
          {fields.length === 0
            ? <p>No fields have been assigned to you yet.</p>
            : <p>No fields match your filter. <button className="link-btn" onClick={() => { setFilter(''); setSearch(''); }}>Clear filters</button></p>
          }
        </div>
      ) : (
        <div className="field-cards-grid">
          {visible.map(f => {
            const sc = STATUS_CONFIG[f.computed_status] || STATUS_CONFIG.Active;
            const latestUpdate = f.updates?.slice(-1)[0];
            return (
              <div
                key={f.id}
                className={`field-card ${f.computed_status === 'At Risk' ? 'at-risk' : ''}`}
                onClick={() => navigate(`/agent/fields/${f.id}`)}
              >
                <div className="field-card-top">
                  <div>
                    <div className="field-card-name">{f.name}</div>
                    <div className="field-card-crop">{f.crop_type}</div>
                  </div>
                  <span className={`badge ${sc.cls}`}>{f.computed_status}</span>
                </div>

                <div style={{ margin: '12px 0 6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--earth3)' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 500, color: 'var(--earth2)' }}>
                      {f.current_stage.charAt(0) + f.current_stage.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <StageBar stage={f.current_stage} />
                </div>

                {latestUpdate && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--cream)', borderRadius: 6, fontSize: 12, color: 'var(--earth2)' }}>
                    <span style={{ fontWeight: 500 }}>Last note: </span>
                    {latestUpdate.notes?.length > 60 ? latestUpdate.notes.slice(0, 60) + '…' : latestUpdate.notes || '—'}
                  </div>
                )}

                <div className="field-card-footer">
                  <span>Planted {new Date(f.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <span className="view-link">View & Update →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}