import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QUIET_PRESETS } from '../../constants/presets.js';

const S = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
  },
  dialog:   {
    background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
    padding: '20px', maxWidth: '320px', width: '90%',
  },
  title:    { fontSize: '16px', fontWeight: 600, marginBottom: '12px' },
  zone:     { fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' },
  group:    { marginBottom: '12px' },
  label:    { fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '4px' },
  input:    {
    width: '100%', padding: '8px', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: 'var(--rs)', color: 'var(--text)', fontSize: '13px', fontFamily: "'Inter',sans-serif",
  },
  presetRow: { display: 'flex', gap: '8px', justifyContent: 'center' },
  presetBtn: {
    flex: 1, padding: '8px', fontSize: '11px', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: 'var(--rs)', color: 'var(--muted)', cursor: 'pointer',
  },
  actions:   { display: 'flex', gap: '8px', marginTop: '16px' },
  cancelBtn: {
    flex: 1, padding: '8px', background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: 'var(--rs)', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px',
  },
  saveBtn:   {
    flex: 1, padding: '8px', background: 'var(--red)', border: 'none', borderRadius: 'var(--rs)',
    color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
  },
};

/** Modal for editing a zone's quiet hours; rendered on <body> like the original. */
export default function QuietHoursModal({ zone, onCancel, onSave }) {
  const existing = zone.deferral_times?.[0] || {};
  const [start, setStart] = useState(existing.start || '');
  const [end, setEnd] = useState(existing.end || '');

  return createPortal(
    <div className="quiet-modal" style={S.overlay}>
      <div style={S.dialog}>
        <div style={S.title}>⏰ Edit Quiet Hours</div>
        <div style={S.zone}>{zone.label}</div>

        <div style={S.group}>
          <label style={S.label}>Start Time</label>
          <input id="eh-start" type="time" style={S.input} value={start} onChange={e => setStart(e.target.value)} />
        </div>

        <div style={S.group}>
          <label style={S.label}>End Time</label>
          <input id="eh-end" type="time" style={S.input} value={end} onChange={e => setEnd(e.target.value)} />
        </div>

        <div style={S.presetRow}>
          {QUIET_PRESETS.map(p => (
            <button key={p.label} style={S.presetBtn} onClick={() => { setStart(p.start); setEnd(p.end); }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={S.actions}>
          <button style={S.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={S.saveBtn} onClick={() => onSave(start, end)}>Save</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
