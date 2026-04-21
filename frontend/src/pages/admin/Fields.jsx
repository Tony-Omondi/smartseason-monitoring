import { useEffect, useState, useCallback } from 'react';
import apiClient from '../../api/client';

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];
const STAGE_ORDER = STAGES;

const STATUS_CONFIG = {
  Active:    { cls: 'badge-green' },
  'At Risk': { cls: 'badge-red'   },
  Completed: { cls: 'badge-blue'  },
};

function StagePips({ stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="stage-pips">
      {STAGE_ORDER.map((s, i) => (
        <div key={s} className={`stage-pip ${i < idx ? 'past' : i === idx ? 'current' : ''}`} title={s} />
      ))}
    </div>
  );
}

// ── Field Form Modal ────────────────────────────────────────────────────────
function FieldModal({ field, agents, onClose, onSaved }) {
  const isEdit = !!field;
  const [form, setForm] = useState({
    name:           field?.name || '',
    crop_type:      field?.crop_type || '',
    planting_date:  field?.planting_date || '',
    current_stage:  field?.current_stage || 'PLANTED',
    assigned_agent: field?.assigned_agent || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, assigned_agent: form.assigned_agent || null };
      if (isEdit) {
        await apiClient.patch(`fields/${field.id}/`, payload);
      } else {
        await apiClient.post('fields/', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Field' : 'Add New Field'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Field Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. North Paddock A" required />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <input className="form-input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)} placeholder="e.g. Maize, Wheat" required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Planting Date *</label>
              <input className="form-input" type="date" value={form.planting_date} onChange={e => set('planting_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Current Stage</label>
              <select className="form-input form-select" value={form.current_stage} onChange={e => set('current_stage', e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Agent</label>
            <select className="form-input form-select" value={form.assigned_agent} onChange={e => set('assigned_agent', e.target.value)}>
              <option value="">— Unassigned —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : isEdit ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ────────────────────────────────────────────────────
function DeleteModal({ field, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const confirm = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`fields/${field.id}/`);
      onDeleted();
      onClose();
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Field</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p className="modal-body-text">
          Are you sure you want to delete <strong>{field.name}</strong>? This will permanently remove the field and all its update history.
        </p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={confirm} disabled={deleting}>
            {deleting ? <span className="btn-spinner" /> : 'Delete Field'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field Detail Drawer ─────────────────────────────────────────────────────
function DetailDrawer({ field, onClose, onEdit }) {
  const [detail, setDetail] = useState(field);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`fields/${field.id}/`)
      .then(r => setDetail(r.data))
      .finally(() => setLoading(false));
  }, [field.id]);

  const sc = STATUS_CONFIG[detail.computed_status] || STATUS_CONFIG.Active;

  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">{detail.name}</h2>
            <p className="drawer-sub">{detail.crop_type}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); onEdit(detail); }}>Edit</button>
            <button className="modal-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="detail-meta-grid">
          <div className="detail-meta-item">
            <span className="detail-meta-label">Status</span>
            <span className={`badge ${sc.cls}`}>{detail.computed_status}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Stage</span>
            <div>
              <div className="stage-label-sm">{detail.current_stage.charAt(0) + detail.current_stage.slice(1).toLowerCase()}</div>
              <StagePips stage={detail.current_stage} />
            </div>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Assigned Agent</span>
            <span>{detail.assigned_agent_name || <em style={{ color: 'var(--earth3)' }}>Unassigned</em>}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Planted</span>
            <span>{new Date(detail.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="drawer-section-title">
          Update History
          <span className="record-count" style={{ marginLeft: 8 }}>{detail.updates?.length || 0}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}><span className="spinner" /></div>
        ) : detail.updates?.length === 0 ? (
          <div className="empty-updates">No updates recorded yet.</div>
        ) : (
          <div className="updates-list">
            {[...detail.updates].reverse().map(u => (
              <div key={u.id} className={`update-item ${u.is_flagged ? 'flagged' : ''}`}>
                <div className="update-top">
                  <span className="update-agent">{u.agent_name}</span>
                  {u.is_flagged && <span className="flag-badge">⚑ Flagged</span>}
                  <span className="update-time">
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                    {new Date(u.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {u.notes && <p className="update-notes">{u.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminFields() {
  const [fields, setFields]     = useState([]);
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStage,  setFilterStage]  = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [viewing, setViewing]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, u] = await Promise.all([
        apiClient.get('fields/'),
        apiClient.get('users/'),
      ]);
      setFields(f.data);
      setAgents(u.data.filter(u => u.role === 'AGENT'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtered list
  const visible = fields.filter(f => {
    const q = search.toLowerCase();
    const matchQ = !q || f.name.toLowerCase().includes(q) || f.crop_type.toLowerCase().includes(q) || (f.assigned_agent_name || '').toLowerCase().includes(q);
    const matchS = !filterStatus || f.computed_status === filterStatus;
    const matchSt = !filterStage || f.current_stage === filterStage;
    return matchQ && matchS && matchSt;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fields</h1>
          <p className="page-subtitle">Manage all fields, assignments and stage tracking.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Field
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="form-input filter-search" placeholder="Search fields, crops, agents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input form-select filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>
        <select className="form-input form-select filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
        {(search || filterStatus || filterStage) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterStage(''); }}>Clear</button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Fields</span>
          <span className="record-count">{visible.length} of {fields.length}</span>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Crop</th>
                  <th>Agent</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Updates</th>
                  <th>Planted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr><td colSpan={8} className="empty-cell">No fields match your filters.</td></tr>
                ) : visible.map(f => {
                  const sc = STATUS_CONFIG[f.computed_status] || STATUS_CONFIG.Active;
                  return (
                    <tr key={f.id} className="tr-hover" onClick={() => setViewing(f)} style={{ cursor: 'pointer' }}>
                      <td className="td-name">{f.name}</td>
                      <td>{f.crop_type}</td>
                      <td className="td-muted">{f.assigned_agent_name || <span className="unassigned">Unassigned</span>}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span className="stage-label">{f.current_stage.charAt(0) + f.current_stage.slice(1).toLowerCase()}</span>
                          <StagePips stage={f.current_stage} />
                        </div>
                      </td>
                      <td><span className={`badge ${sc.cls}`}>{f.computed_status}</span></td>
                      <td className="td-muted">{f.updates?.length ?? 0}</td>
                      <td className="td-muted">{new Date(f.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="row-actions">
                          <button className="icon-btn" title="Edit" onClick={() => setEditing(f)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="icon-btn danger" title="Delete" onClick={() => setDeleting(f)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && <FieldModal agents={agents} onClose={() => setShowCreate(false)} onSaved={load} />}
      {editing    && <FieldModal field={editing} agents={agents} onClose={() => setEditing(null)} onSaved={load} />}
      {deleting   && <DeleteModal field={deleting} onClose={() => setDeleting(null)} onDeleted={load} />}
      {viewing    && <DetailDrawer field={viewing} onClose={() => setViewing(null)} onEdit={f => setEditing(f)} />}
    </div>
  );
}