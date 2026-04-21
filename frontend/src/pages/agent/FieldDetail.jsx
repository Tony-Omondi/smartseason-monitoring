import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

const STATUS_CONFIG = {
  Active:    { cls: 'badge-green' },
  'At Risk': { cls: 'badge-red'   },
  Completed: { cls: 'badge-blue'  },
};

function UpdateModal({ field, onClose, onSaved }) {
  const [form, setForm] = useState({
    current_stage: field.current_stage,
    notes: '',
    is_flagged: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.notes.trim()) { setError('Please enter an observation or note.'); return; }
    setError('');
    setSaving(true);
    try {
      await apiClient.post(`fields/${field.id}/add_update/`, form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save update.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Log Field Update</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--earth2)', marginBottom: 20, marginTop: -8 }}>
          Recording update for <strong>{field.name}</strong>
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Update Stage</label>
            <div className="stage-selector">
              {STAGES.map((s, i) => {
                const currentIdx = STAGES.indexOf(field.current_stage);
                const isDisabled = i < currentIdx; // can't go backwards
                return (
                  <button
                    type="button"
                    key={s}
                    disabled={isDisabled}
                    className={`stage-option ${form.current_stage === s ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && set('current_stage', s)}
                  >
                    <div className={`stage-option-dot ${form.current_stage === s ? 'active' : ''}`} />
                    <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                  </button>
                );
              })}
            </div>
            {form.current_stage !== field.current_stage && (
              <p className="stage-change-hint">
                Stage will advance from <strong>{field.current_stage.toLowerCase()}</strong> → <strong>{form.current_stage.toLowerCase()}</strong>
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Observations / Notes *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Describe current field conditions, any issues observed, weather impact, etc."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label
              className={`flag-toggle ${form.is_flagged ? 'flagged' : ''}`}
              onClick={() => set('is_flagged', !form.is_flagged)}
            >
              <div className="flag-toggle-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={form.is_flagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Flag as critical issue</div>
                <div style={{ fontSize: 12, color: form.is_flagged ? '#B84040' : 'var(--earth3)', marginTop: 1 }}>
                  {form.is_flagged ? 'This field will be marked At Risk' : 'Flag if there is a serious problem (pests, disease, drought)'}
                </div>
              </div>
              <div className={`flag-checkbox ${form.is_flagged ? 'checked' : ''}`} />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : 'Submit Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgentFieldDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [field, setField]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`fields/${id}/`);
      setField(data);
    } catch {
      navigate('/agent/fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading || !field) return <div className="page-loading"><span className="spinner" /></div>;

  const sc = STATUS_CONFIG[field.computed_status] || STATUS_CONFIG.Active;
  const stageIdx = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'].indexOf(field.current_stage);
  const isCompleted = field.current_stage === 'HARVESTED';

  return (
    <div className="page">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/agent/fields')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to fields
      </button>

      <div className="field-detail-layout">
        {/* Left: field info */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, marginBottom: 2 }}>{field.name}</h1>
                  <p style={{ color: 'var(--earth2)', fontSize: 14 }}>{field.crop_type}</p>
                </div>
                <span className={`badge ${sc.cls}`} style={{ fontSize: 13, padding: '5px 12px' }}>{field.computed_status}</span>
              </div>

              {/* Stage progress */}
              <div style={{ margin: '20px 0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {['PLANTED', 'GROWING', 'READY', 'HARVESTED'].map((s, i) => (
                    <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: i < stageIdx ? 'var(--green)' : i === stageIdx ? 'var(--amber)' : 'var(--cream2)',
                          border: `2px solid ${i < stageIdx ? 'var(--green)' : i === stageIdx ? 'var(--amber)' : 'var(--cream2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .2s',
                        }}>
                          {i < stageIdx && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                          {i === stageIdx && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <span style={{ fontSize: 11, marginTop: 6, fontWeight: i === stageIdx ? 600 : 400, color: i <= stageIdx ? 'var(--earth)' : 'var(--earth3)' }}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </span>
                      </div>
                      {i < 3 && <div style={{ height: 2, flex: 0.8, background: i < stageIdx ? 'var(--green)' : 'var(--cream2)', marginBottom: 20, transition: 'background .2s' }} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="info-chip">
                  <span className="info-chip-label">Planted</span>
                  <span>{new Date(field.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="info-chip">
                  <span className="info-chip-label">Updates logged</span>
                  <span>{field.updates?.length || 0}</span>
                </div>
              </div>
            </div>

            {!isCompleted && (
              <div style={{ borderTop: '1px solid var(--cream2)', padding: '16px 24px' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowUpdate(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Log Update
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: update history */}
        <div style={{ width: 360, flexShrink: 0 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Update History</span>
              <span className="record-count">{field.updates?.length || 0}</span>
            </div>
            <div style={{ padding: '0 0 8px' }}>
              {field.updates?.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--earth3)', fontSize: 14 }}>
                  No updates yet. Use "Log Update" to record field observations.
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {[...field.updates].reverse().map((u, idx) => (
                    <div key={u.id} className={`update-entry ${u.is_flagged ? 'flagged' : ''}`}>
                      <div className="update-entry-header">
                        <span className="update-agent-name">{u.agent_name}</span>
                        {u.is_flagged && (
                          <span className="badge badge-red" style={{ fontSize: 11 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}>
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                            Critical
                          </span>
                        )}
                        <span className="update-timestamp">
                          {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                          {new Date(u.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {u.notes && <p className="update-entry-notes">{u.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpdate && <UpdateModal field={field} onClose={() => setShowUpdate(false)} onSaved={load} />}
    </div>
  );
}